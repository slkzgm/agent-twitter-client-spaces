// src/bozoTestParticipant.ts

import 'dotenv/config';
import { Scraper } from '../scraper';
import { SpaceParticipant } from './core/SpaceParticipant';
import { SttTtsPlugin } from './plugins/SttTtsPluginCustom';

const audioSpaceId = '1eaKbaNQbMBxX';

async function main() {
  // 1) Login
  const scraper = new Scraper();
  await scraper.login(
    process.env.TWITTER_USERNAME!,
    process.env.TWITTER_PASSWORD!,
  );

  // 2) Create participant
  const participant = new SpaceParticipant(scraper, {
    spaceId: audioSpaceId,
    debug: false,
  });

  // Create our TTS/STT plugin instance
  const sttTtsPlugin = new SttTtsPlugin();
  participant.use(sttTtsPlugin, {
    openAiApiKey: process.env.OPENAI_API_KEY,
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: 'D38z5RcWu1voky8WS1ja', // example
    // You can also initialize systemPrompt, chatContext, etc. here if you wish
    // systemPrompt: "You are a calm and friendly AI assistant."
  });

  // 3) Join as listener
  await participant.joinAsListener();
  console.log('[TestParticipant] HLS =>', participant.getHlsUrl());

  // 4) Request speaker
  await participant.requestSpeaker();
  console.log('[TestParticipant] Waiting for host acceptance...');

  // Ici, en vrai, tu dois attendre un signal côté chat
  // indiquant que le host t'a approuvé (par ex. un "guestBroadcastingEvent=1").
  // Pour simplifier, on attend 10 sec
  await new Promise((r) => setTimeout(r, 10000));

  // 5) Become speaker
  await participant.becomeSpeaker();
  console.log('[TestParticipant] Now a speaker!');

  await participant.muteSelf();
  await participant.unmuteSelf();
}

main().catch((err) => {
  console.error('[TestParticipant] Unhandled error =>', err);
  process.exit(1);
});
