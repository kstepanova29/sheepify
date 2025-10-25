# Fish Audio Setup Guide

## Overview
This guide explains how to set up Fish Audio API integration for Sheepify's text-to-speech features.

## Prerequisites
- Fish Audio account with API access
- API key from Fish Audio dashboard

## Installation

### 1. Dependencies (Already Installed)
```bash
npm install expo-av@~15.0.1
```

### 2. Environment Configuration

Create a `.env` file in the project root (if it doesn't exist):

```env
# Anthropic (Claude AI) - Already configured
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-...

# Fish Audio API - Required for TTS
EXPO_PUBLIC_FISH_AUDIO_API_KEY=your-fish-audio-api-key-here
```

**Important**: Never commit your `.env` file to git!

### 3. Get Fish Audio API Key

1. Visit [https://fish.audio/](https://fish.audio/)
2. Sign up or log in to your account
3. Navigate to API settings
4. Generate a new API key
5. Copy the key to your `.env` file

### 4. Update app.json (Optional)

If you prefer to configure the API key through `app.json`:

```json
{
  "expo": {
    "extra": {
      "anthropicApiKey": "...",
      "fishAudioApiKey": "your-fish-audio-api-key-here"
    }
  }
}
```

## Services Created

### `/services/audio/audioPlayer.ts`
Audio playback service using expo-av:
- `initializeAudio()` - Configure audio mode
- `playAudioFromUrl(url)` - Play remote audio (Fish Audio generated)
- `playLocalAudio(asset)` - Play local audio files
- `stopAudio()` - Stop playback
- `pauseAudio()` / `resumeAudio()` - Control playback
- `setVolume(level)` - Adjust volume

### `/services/ai/fishAudioService.ts`
Fish Audio API client:
- `generateSpeech(options)` - Convert text to speech
- `generateSpeechSafe(text)` - Safe wrapper with fallback
- `claudeToSpeech(message)` - Claude + Fish Audio integration

## Usage Examples

### Basic Text-to-Speech
```typescript
import * as fishAudioService from '@/services/ai/fishAudioService';
import * as audioPlayer from '@/services/audio/audioPlayer';

// Generate speech
const result = await fishAudioService.generateSpeech({
  text: "Wake up, sleepy sheep!",
  voiceId: "shleepy-voice-001",
  speed: 1.1,
  emotion: "excited"
});

// Play audio
await audioPlayer.playAudioFromUrl(result.audioUrl);
```

### Claude + Fish Audio Integration
```typescript
import { claudeService } from '@/services/ai/claudeService';
import * as fishAudioService from '@/services/ai/fishAudioService';
import * as audioPlayer from '@/services/audio/audioPlayer';

// 1. Generate message with Claude
const context = {
  sleepDuration: 9,
  sleepQuality: 'perfect' as const,
  streak: 5,
  penaltyWarning: 0,
  totalSheep: 10,
  lastSleepDate: new Date()
};

const message = await claudeService.generateSleepMessage(context);
// "Ewe nailed it! 9 hours of sleep! You're un-BAAAA-lievable! 💕"

// 2. Convert to speech with Fish Audio
const audioUrl = await fishAudioService.claudeToSpeech(message, {
  emotion: 'excited'
});

// 3. Play audio
await audioPlayer.playAudioFromUrl(audioUrl);
```

### Safe Usage with Fallback
```typescript
// Try to play audio, fallback to text if it fails
const audioUrl = await fishAudioService.generateSpeechSafe(message);

if (audioUrl) {
  await audioPlayer.playAudioFromUrl(audioUrl);
} else {
  // Fallback: Display text message
  Alert.alert('Shleepy says:', message);
}
```

## Error Handling

The Fish Audio service handles common errors gracefully:

### No Credits (402)
```
"Shleepy is out of vocal energy! 🐑💤 (Fish Audio credits depleted)"
```

### Rate Limiting (429)
- Automatic retry with exponential backoff
- Up to 3 retry attempts
- Final error: "Fish Audio is temporarily busy. Please try again in a moment! 🐑"

### Invalid API Key (401)
```
"Fish Audio API key is invalid. Please check your configuration."
```

### Network Errors
```
"Failed to generate speech. Please check your internet connection and try again."
```

## Integration Points (Future)

### 1. Sleep Log Screen
When user wakes up:
```typescript
// app/sleep-log.tsx
const message = await claudeService.generateSleepMessage(context);
const audioUrl = await fishAudioService.claudeToSpeech(message);
await audioPlayer.playAudioFromUrl(audioUrl);
```

### 2. Alarm Service (To Be Built)
Wake-up alarm with personalized message:
```typescript
// services/alarms/alarmService.ts
const wakeUpMessage = await claudeService.sendMessage("Generate wake up");
const audioUrl = await fishAudioService.claudeToSpeech(wakeUpMessage, {
  speed: 1.2,
  emotion: 'excited'
});
await audioPlayer.playAudioFromUrl(audioUrl);
```

### 3. Dream Narration
After good sleep:
```typescript
const dream = await claudeService.generateDream('perfect');
const audioUrl = await fishAudioService.claudeToSpeech(dream, {
  speed: 0.9, // Slower, dreamier
  emotion: 'calm'
});
await audioPlayer.playAudioFromUrl(audioUrl);
```

### 4. Bedtime Reminders (To Be Built)
Nightly sleep encouragement:
```typescript
// services/reminders/bedtimeService.ts
const reminder = "Time to sleep, little sheep! 🐑";
const audioUrl = await fishAudioService.generateSpeech({
  text: reminder,
  emotion: 'gentle'
});
await audioPlayer.playAudioFromUrl(audioUrl);
```

## Voice Configuration

### Voice IDs
Fish Audio supports multiple voices. Configure Shleepy's voice:

1. Create/clone a voice in Fish Audio dashboard
2. Copy the voice ID
3. Use it in API calls:
```typescript
const result = await fishAudioService.generateSpeech({
  text: "Hello!",
  voiceId: "your-voice-id-here" // Replace with actual ID
});
```

### Voice Parameters
- **speed**: 0.5 to 2.0 (default: 1.0)
- **emotion**: "happy", "sad", "excited", "calm", "neutral"
- **format**: "mp3", "wav", "opus" (default: mp3)

## Testing

Use the Shleepy Test screen to verify integration:

```bash
# Start the app
npx expo start
```

Navigate to: **Home → Test Shleepy AI**

Test buttons:
- **Perfect Sleep** - Generates affirmation message
- **Good Sleep** - Generates encouragement
- **Poor Sleep** - Generates roast
- **Generate Dream** - Creates dream snippet

## Next Steps

1. **Get Fish Audio API Key** - Sign up at fish.audio
2. **Add to .env file** - Configure `EXPO_PUBLIC_FISH_AUDIO_API_KEY`
3. **Select Voice** - Create or clone a voice for Shleepy
4. **Test Integration** - Use Test screen to verify TTS works
5. **Implement in Features** - Add to sleep-log, alarms, etc.

## Troubleshooting

### "Fish Audio API key not found"
- Ensure `.env` file exists in project root
- Check that `EXPO_PUBLIC_FISH_AUDIO_API_KEY` is set
- Restart Expo dev server after adding env vars

### "Failed to generate speech"
- Check internet connection
- Verify API key is valid
- Check Fish Audio account credits
- Review console logs for detailed error

### Audio not playing
- Ensure `initializeAudio()` was called
- Check device volume settings
- Verify audio URL is valid
- Test with `playLocalAudio()` first

### Silent mode issues (iOS)
- Audio is configured to play in silent mode
- Check iOS sound settings
- Verify app has audio permissions

## API Costs

Fish Audio pricing (approximate):
- ~$0.001 per generated audio
- 100 messages ≈ $0.10
- 1000 messages ≈ $1.00

Budget recommendation: $5-10/month for typical usage

## Security

- ✅ API keys stored in environment variables
- ✅ Never committed to git
- ✅ Prefix `EXPO_PUBLIC_` for React Native access
- ⚠️ Consider using Expo SecureStore for production
- ⚠️ Implement rate limiting on client side

## Support

- Fish Audio Docs: https://fish.audio/docs/
- Fish Audio API: https://fish.audio/docs/api/
- Expo Audio: https://docs.expo.dev/versions/latest/sdk/audio/

