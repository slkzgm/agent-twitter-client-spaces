// src/bozoTest.ts

import 'dotenv/config';
import { Space, SpaceConfig } from './core/Space';
import { Scraper } from '../scraper';
import { RecordToDiskPlugin } from './plugins/RecordToDiskPlugin';
import { SttTtsPlugin } from './plugins/SttTtsPlugin';
import { IdleMonitorPlugin } from './plugins/IdleMonitorPlugin';
import { HlsRecordPlugin } from './plugins/HlsRecordPlugin';

/**
 * Main test entry point
 */
async function main() {
  console.log('[Test] Starting...');

  // 1) Twitter login with your scraper
  const scraper = new Scraper();
  await scraper.login(
    process.env.TWITTER_USERNAME!,
    process.env.TWITTER_PASSWORD!,
  );

  // 2) Create the Space instance
  // Set debug=true if you want more logs
  const space = new Space(scraper, { debug: false });

  // Create our TTS/STT plugin instance
  const sttTtsPlugin = new SttTtsPlugin();
  space.use(sttTtsPlugin, {
    openAiApiKey: process.env.OPENAI_API_KEY,
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: 'D38z5RcWu1voky8WS1ja', // example
    // You can also initialize systemPrompt, chatContext, etc. here if you wish
    // systemPrompt: "You are a calm and friendly AI assistant."
  });

  // 3) Initialize the Space
  const config: SpaceConfig = {
    mode: 'INTERACTIVE',
    title: 'AI Chat - Dynamic GPT Config',
    description: 'Space that demonstrates dynamic GPT personalities.',
    languages: ['en'],
  };

  const broadcastInfo = await space.initialize(config);
  const spaceUrl = broadcastInfo.share_url.replace('broadcasts', 'spaces');
  console.log('[Test] Space created =>', spaceUrl);

  // (Optional) Tweet out the Space link
  await scraper.sendTweet(`${config.title} ${spaceUrl}`);
  console.log('[Test] Tweet sent');

  // 4) Some event listeners
  space.on('speakerRequest', async (req) => {
    console.log('[Test] Speaker request =>', req);
    await space.approveSpeaker(req.userId, req.sessionUUID);

    // Remove the speaker after 60 seconds (testing only)
    setTimeout(() => {
      console.log(
        `[Test] Removing speaker => userId=${req.userId} (after 60s)`,
      );
      space.removeSpeaker(req.userId).catch((err) => {
        console.error('[Test] removeSpeaker error =>', err);
      });
    }, 60_000);
  });

  space.on('error', (err) => {
    console.error('[Test] Space Error =>', err);
  });

  console.log('[Test] Space is running... press Ctrl+C to exit.');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n[Test] Caught interrupt signal, stopping...');
    await space.stop();
    console.log('[Test] Space stopped. Bye!');
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[Test] Unhandled main error =>', err);
  process.exit(1);
});
