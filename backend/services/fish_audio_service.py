"""
Fish Audio API Service (Python)

Provides text-to-speech (TTS) capabilities using the Fish Audio API.
This service converts text messages into natural-sounding speech audio files.

Integration with Claude AI:
- Claude generates witty sleep messages → Fish Audio converts to speech
- Claude generates dream snippets → Fish Audio narrates them
- Claude generates roasts/affirmations → Fish Audio delivers with personality

Example flow:
1. Claude generates message: "Ewe nailed it! 9 hours of sleep! 🐑"
2. fish_audio_service.generate_speech() → Downloads/returns audio URL
3. audio_player.play_audio_from_url() → Plays the audio

Documentation: https://fish.audio/docs/api/
"""

import os
import time
import re
import requests
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Configuration
FISH_AUDIO_API_URL = "https://api.fish.audio/v1/voice"
MAX_RETRIES = 3
BASE_DELAY_MS = 1000


class FishAudioError(Exception):
    """Custom exception for Fish Audio API errors"""
    pass


class FishAudioRateLimitError(FishAudioError):
    """Raised when rate limit is exceeded"""
    pass


class FishAudioNoCreditsError(FishAudioError):
    """Raised when API credits are depleted"""
    pass


def get_api_key() -> str:
    """
    Get Fish Audio API key from environment variables.
    
    Returns:
        str: Fish Audio API key
        
    Raises:
        FishAudioError: If API key is not found in environment
    """
    api_key = os.getenv('FISH_AUDIO_API_KEY')
    
    if not api_key:
        raise FishAudioError(
            "Fish Audio API key not found. "
            "Please set FISH_AUDIO_API_KEY in your .env file."
        )
    
    return api_key


def calculate_backoff_delay(attempt: int) -> float:
    """
    Calculate exponential backoff delay for retry attempts.
    
    Args:
        attempt: Current retry attempt number (0-indexed)
        
    Returns:
        float: Delay in seconds
    """
    return (BASE_DELAY_MS / 1000) * (2 ** attempt)


def strip_emojis(text: str) -> str:
    """
    Remove emoji characters from text for cleaner speech output.
    
    Fish Audio may not handle emojis well, so we strip them before sending.
    
    Args:
        text: Input text potentially containing emojis
        
    Returns:
        str: Text with emojis removed
    """
    # Unicode ranges for common emoji
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F700-\U0001F77F"  # alchemical symbols
        "\U0001F780-\U0001F7FF"  # Geometric Shapes Extended
        "\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
        "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
        "\U0001FA00-\U0001FA6F"  # Chess Symbols
        "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
        "\U00002600-\U000026FF"  # Miscellaneous Symbols
        "\U00002700-\U000027BF"  # Dingbats
        "]+",
        flags=re.UNICODE
    )
    return emoji_pattern.sub('', text).strip()


def generate_speech(
    text: str,
    voice_id: Optional[str] = None,
    speed: float = 1.0,
    emotion: Optional[str] = None,
    format: str = "mp3",
    save_to: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate speech from text using Fish Audio API.
    
    Args:
        text: Text to convert to speech
        voice_id: Fish Audio voice ID (default: None uses default voice)
        speed: Speech speed (0.5 to 2.0, default: 1.0)
        emotion: Emotion tag (e.g., "happy", "sad", "excited", "calm")
        format: Audio format - "mp3", "wav", or "opus" (default: mp3)
        save_to: Optional local path to save the audio file
        
    Returns:
        dict: {
            'audio_url': str - URL to generated audio,
            'duration': float - Duration in seconds,
            'voice_id': str - Voice ID used,
            'local_path': str - Local file path if saved (optional)
        }
        
    Raises:
        FishAudioError: For general API errors
        FishAudioNoCreditsError: When API credits are depleted (402)
        FishAudioRateLimitError: When rate limit is exceeded (429)
        ValueError: For invalid input parameters
        
    Example:
        >>> result = generate_speech(
        ...     text="Wake up, sleepy sheep!",
        ...     voice_id="shleepy-voice-001",
        ...     speed=1.1,
        ...     emotion="excited"
        ... )
        >>> print(result['audio_url'])
        'https://api.fish.audio/files/abc123.mp3'
    """
    # Validate inputs
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")
    
    if speed < 0.5 or speed > 2.0:
        raise ValueError("Speed must be between 0.5 and 2.0")
    
    if format not in ["mp3", "wav", "opus"]:
        raise ValueError("Format must be 'mp3', 'wav', or 'opus'")
    
    # Clean text (remove emojis)
    clean_text = strip_emojis(text)
    
    # Prepare request
    api_key = get_api_key()
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    payload = {
        'text': clean_text,
        'speed': speed,
        'format': format
    }
    
    # Add optional parameters
    if voice_id:
        payload['voice_id'] = voice_id
    if emotion:
        payload['emotion'] = emotion
    
    # Retry logic with exponential backoff
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.post(
                FISH_AUDIO_API_URL,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            # Handle successful response
            if response.ok:
                data = response.json()
                
                result = {
                    'audio_url': data.get('audio_url') or data.get('url'),
                    'duration': data.get('duration', 0),
                    'voice_id': data.get('voice_id', voice_id or 'default')
                }
                
                # Download and save file if requested
                if save_to:
                    audio_url = result['audio_url']
                    audio_response = requests.get(audio_url, timeout=30)
                    
                    if audio_response.ok:
                        with open(save_to, 'wb') as f:
                            f.write(audio_response.content)
                        result['local_path'] = save_to
                        print(f"✓ Audio saved to: {save_to}")
                    else:
                        print(f"⚠ Failed to download audio file: {audio_response.status_code}")
                
                return result
            
            # Handle error responses
            error_data = response.json() if response.text else {}
            
            # 429 - Rate limit (retry with backoff)
            if response.status_code == 429:
                if attempt < MAX_RETRIES - 1:
                    delay = calculate_backoff_delay(attempt)
                    print(f"⚠ Rate limited. Retrying in {delay:.1f}s (attempt {attempt + 1}/{MAX_RETRIES})...")
                    time.sleep(delay)
                    continue  # Retry
                else:
                    raise FishAudioRateLimitError(
                        "Fish Audio is temporarily busy. Please try again in a moment! 🐑"
                    )
            
            # 402 - Payment required (no credits)
            if response.status_code == 402:
                raise FishAudioNoCreditsError(
                    "Shleepy is out of vocal energy! 🐑💤 (Fish Audio credits depleted)"
                )
            
            # 401 - Unauthorized (invalid API key)
            if response.status_code == 401:
                raise FishAudioError(
                    "Fish Audio API key is invalid. Please check your .env configuration."
                )
            
            # 400 - Bad request
            if response.status_code == 400:
                error_msg = error_data.get('message', 'Invalid request parameters')
                raise FishAudioError(f"Bad request: {error_msg}")
            
            # Generic error
            error_msg = error_data.get('message', f'API error ({response.status_code})')
            raise FishAudioError(f"Fish Audio API error: {error_msg}")
            
        except requests.exceptions.Timeout:
            if attempt < MAX_RETRIES - 1:
                delay = calculate_backoff_delay(attempt)
                print(f"⚠ Request timeout. Retrying in {delay:.1f}s...")
                time.sleep(delay)
                continue
            else:
                raise FishAudioError("Request timeout. Please check your connection and try again.")
        
        except requests.exceptions.RequestException as e:
            raise FishAudioError(f"Network error: {str(e)}")
    
    # Should never reach here due to raises above, but just in case
    raise FishAudioError("Max retries exceeded")


def generate_speech_safe(
    text: str,
    voice_id: Optional[str] = None,
    speed: float = 1.0,
    emotion: Optional[str] = None,
    format: str = "mp3",
    save_to: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Safe wrapper for generate_speech() that won't crash on errors.
    
    Use this in production code where audio is optional and you want
    to gracefully fallback to text display if TTS fails.
    
    Args:
        Same as generate_speech()
        
    Returns:
        dict or None: Speech result or None if generation failed
        
    Example:
        >>> result = generate_speech_safe("Good morning!")
        >>> if result:
        ...     play_audio(result['audio_url'])
        ... else:
        ...     print("Good morning!")  # Fallback to text
    """
    try:
        return generate_speech(text, voice_id, speed, emotion, format, save_to)
    except Exception as e:
        print(f"⚠ Fish Audio generation failed: {e}")
        print("→ Falling back to text display")
        return None


def claude_to_speech(
    claude_message: str,
    voice_id: Optional[str] = None,
    speed: float = 1.0,
    emotion: Optional[str] = None,
    save_to: Optional[str] = None
) -> Dict[str, Any]:
    """
    Convert Claude AI generated message to speech.
    
    This is a convenience function that combines Claude text generation
    with Fish Audio TTS in one call. It automatically strips emojis
    and handles common Claude message patterns.
    
    Args:
        claude_message: Text message from Claude AI (can contain emojis)
        voice_id: Optional voice ID
        speed: Speech speed
        emotion: Optional emotion (auto-detected if None)
        save_to: Optional local path to save audio
        
    Returns:
        dict: Same as generate_speech()
        
    Example usage in sleep feedback:
        >>> # 1. Generate message with Claude
        >>> message = claude_generate_sleep_message(context)
        >>> # "Ewe nailed it! 9 hours of sleep! 🐑✨"
        >>> 
        >>> # 2. Convert to speech
        >>> result = claude_to_speech(message, emotion="excited")
        >>> 
        >>> # 3. Play audio
        >>> play_audio_from_url(result['audio_url'])
    """
    # Auto-detect emotion from message if not provided
    if emotion is None:
        message_lower = claude_message.lower()
        if any(word in message_lower for word in ['great', 'amazing', 'nailed', 'perfect']):
            emotion = 'excited'
        elif any(word in message_lower for word in ['poor', 'bad', 'terrible']):
            emotion = 'disappointed'
        else:
            emotion = 'neutral'
    
    return generate_speech(
        text=claude_message,
        voice_id=voice_id,
        speed=speed,
        emotion=emotion,
        save_to=save_to
    )


# ============================================================================
# FUTURE ENHANCEMENTS (TODO)
# ============================================================================

"""
1. Audio Caching System:
   - Cache generated audio files to reduce API calls
   - Store common phrases ("Good morning!", "Great sleep!")
   - Use hash of (text + voice_id + speed) as cache key
   - Implement LRU cache with size limit (e.g., 100 MB)
   
   Example:
   def generate_speech_cached(text, **kwargs):
       cache_key = hash((text, kwargs.get('voice_id'), kwargs.get('speed')))
       if cache_key in cache:
           return cache[cache_key]
       result = generate_speech(text, **kwargs)
       cache[cache_key] = result
       return result

2. Batch Generation:
   - Pre-generate common alarm messages at night
   - Store for offline morning playback
   - Reduces API latency at wake-up time
   
   Example:
   def batch_generate_alarms(messages: List[str]):
       for msg in messages:
           generate_speech(msg, save_to=f"/tmp/alarm_{hash(msg)}.mp3")

3. Streaming Audio (if API supports):
   - Start playback before full generation completes
   - Improves perceived performance
   - Better user experience

4. Voice Profiles:
   - Store user's preferred voice settings
   - "Gentle Shleepy", "Sassy Shleepy", "Energetic Shleepy"
   - Load from database or config file

5. Advanced Error Recovery:
   - Implement circuit breaker pattern
   - Fallback to alternative TTS service
   - Queue failed requests for retry
"""

