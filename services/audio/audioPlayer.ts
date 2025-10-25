import { Audio } from 'expo-av';

/**
 * Audio Player Service
 * 
 * Provides a simple interface for playing audio in the Sheepify app.
 * This service wraps expo-av functionality and manages audio playback state.
 * 
 * Integration Points:
 * - Alarm wake-up sounds (plays Fish Audio generated voice)
 * - Sleep feedback audio (plays Claude + Fish Audio combined messages)
 * - Bedtime reminder notifications
 * - Dream narration playback
 */

// Store the current playing sound instance
let currentSound: Audio.Sound | null = null;

/**
 * Configure audio mode for the app
 * This should be called once when the app starts
 */
export async function initializeAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true, // Allow audio even in silent mode (important for alarms!)
      staysActiveInBackground: false, // Keep audio playing in background
      shouldDuckAndroid: true, // Lower other audio when playing
    });
  } catch (error) {
    console.error('Failed to initialize audio mode:', error);
  }
}

/**
 * Play audio from a remote URL
 * 
 * Use this to play Fish Audio API generated audio:
 * 1. Call fishAudioService.generateSpeech() to get audio URL
 * 2. Pass URL to this function to play it
 * 
 * @param url - Remote audio URL (e.g., from Fish Audio API)
 * @param onPlaybackComplete - Optional callback when audio finishes
 * @returns Promise<void>
 */
export async function playAudioFromUrl(
  url: string,
  onPlaybackComplete?: () => void
): Promise<void> {
  try {
    // Stop any currently playing audio
    await stopAudio();

    // Create and load new sound
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true }, // Auto-play when loaded
      onPlaybackComplete
        ? (status) => {
            if (status.isLoaded && status.didJustFinish) {
              onPlaybackComplete();
            }
          }
        : undefined
    );

    currentSound = sound;

    // Start playing
    await sound.playAsync();
  } catch (error) {
    console.error('Failed to play audio from URL:', error);
    throw new Error('Could not play audio. Please try again.');
  }
}

/**
 * Play audio from a local file
 * 
 * Use this for:
 * - Default alarm sounds (stored in /assets/sounds/)
 * - Cached Fish Audio files
 * - Sound effects (sheep bleats, etc.)
 * 
 * @param assetPath - Local asset path (e.g., require('../../assets/sounds/alarm.mp3'))
 * @param onPlaybackComplete - Optional callback when audio finishes
 * @returns Promise<void>
 */
export async function playLocalAudio(
  assetPath: number, // Expo requires assets as numbers from require()
  onPlaybackComplete?: () => void
): Promise<void> {
  try {
    // Stop any currently playing audio
    await stopAudio();

    // Create and load new sound
    const { sound } = await Audio.Sound.createAsync(
      assetPath,
      { shouldPlay: true },
      onPlaybackComplete
        ? (status) => {
            if (status.isLoaded && status.didJustFinish) {
              onPlaybackComplete();
            }
          }
        : undefined
    );

    currentSound = sound;

    // Start playing
    await sound.playAsync();
  } catch (error) {
    console.error('Failed to play local audio:', error);
    throw new Error('Could not play audio. Please try again.');
  }
}

/**
 * Stop currently playing audio and unload it
 * 
 * Important: Always unload sounds to prevent memory leaks
 */
export async function stopAudio(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (error) {
      console.error('Failed to stop audio:', error);
    } finally {
      currentSound = null;
    }
  }
}

/**
 * Pause currently playing audio
 */
export async function pauseAudio(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.pauseAsync();
    } catch (error) {
      console.error('Failed to pause audio:', error);
    }
  }
}

/**
 * Resume paused audio
 */
export async function resumeAudio(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.playAsync();
    } catch (error) {
      console.error('Failed to resume audio:', error);
    }
  }
}

/**
 * Get the current playback status
 */
export async function getAudioStatus(): Promise<{
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
} | null> {
  if (!currentSound) return null;

  try {
    const status = await currentSound.getStatusAsync();
    if (status.isLoaded) {
      return {
        isPlaying: status.isPlaying,
        positionMillis: status.positionMillis,
        durationMillis: status.durationMillis || 0,
      };
    }
  } catch (error) {
    console.error('Failed to get audio status:', error);
  }

  return null;
}

/**
 * Set playback volume
 * 
 * @param volume - Volume level (0.0 to 1.0)
 */
export async function setVolume(volume: number): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }
}

/**
 * Example usage in alarm flow:
 * 
 * // 1. User sets alarm for 7:00 AM
 * scheduleAlarm({ time: '07:00', voiceMessage: 'Wake up, sleepy sheep!' });
 * 
 * // 2. At 7:00 AM, alarm triggers:
 * const audioUrl = await fishAudioService.generateSpeech('Wake up, sleepy sheep!');
 * await playAudioFromUrl(audioUrl, () => {
 *   console.log('Alarm finished playing');
 *   showAlarmDismissButton();
 * });
 * 
 * // 3. User dismisses alarm:
 * await stopAudio();
 */

