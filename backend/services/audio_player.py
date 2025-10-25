"""
Audio Player Service (Python)

Provides audio playback capabilities for testing Fish Audio generated speech.
This module handles playing audio from URLs (Fish Audio API) or local files.

Use cases:
- Testing Fish Audio TTS output
- Playing alarm sounds
- Local development/debugging
- Backend audio preview

Note: For production mobile app, use expo-av in React Native.
This Python player is primarily for backend testing and development.

Dependencies:
- pygame: Audio playback engine (required)
- requests: For downloading remote audio files

Compatible with Python 3.14 and later. No playsound dependency required.
"""

import os
import tempfile
import hashlib
import requests
from typing import Optional
from pathlib import Path

# Import pygame (required dependency)
try:
    import pygame
    import pygame.mixer
    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False
    print("❌ ERROR: pygame not installed. Install with: pip install pygame")
    print("   This is required for audio playback.")


class AudioPlayerError(Exception):
    """Custom exception for audio playback errors"""
    pass


def get_cache_dir() -> str:
    """
    Get the cache directory for downloaded audio files.
    
    Creates the directory if it doesn't exist.
    
    Returns:
        str: Path to cache directory
    """
    cache_dir = os.path.join(tempfile.gettempdir(), 'sheepify_audio_cache')
    os.makedirs(cache_dir, exist_ok=True)
    return cache_dir


def get_cache_path(url: str, format: str = 'mp3') -> str:
    """
    Generate a cache file path for a given URL.
    
    Uses MD5 hash of URL as filename to avoid collisions.
    
    Args:
        url: Remote audio URL
        format: Audio format extension (default: mp3)
        
    Returns:
        str: Full path to cache file
    """
    url_hash = hashlib.md5(url.encode()).hexdigest()
    cache_dir = get_cache_dir()
    return os.path.join(cache_dir, f"{url_hash}.{format}")


def download_audio(url: str, save_path: Optional[str] = None) -> str:
    """
    Download audio file from URL.
    
    If save_path is not provided, saves to cache directory.
    
    Args:
        url: Remote audio URL
        save_path: Optional custom save path
        
    Returns:
        str: Path to downloaded file
        
    Raises:
        AudioPlayerError: If download fails
    """
    # Use cache path if no custom path provided
    if save_path is None:
        save_path = get_cache_path(url)
    
    # Check if already cached
    if os.path.exists(save_path):
        print(f"✓ Using cached audio: {save_path}")
        return save_path
    
    try:
        print(f"⬇ Downloading audio from: {url}")
        response = requests.get(url, timeout=30, stream=True)
        response.raise_for_status()
        
        # Save to file
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"✓ Audio downloaded to: {save_path}")
        return save_path
        
    except requests.exceptions.RequestException as e:
        raise AudioPlayerError(f"Failed to download audio: {e}")


def play_audio_from_url(url: str, cache: bool = True) -> None:
    """
    Play audio from a remote URL using pygame.
    
    Downloads the audio file first, optionally caches it, then plays it.
    This is the primary method for playing Fish Audio generated speech.
    
    Args:
        url: Remote audio URL (e.g., from Fish Audio API)
        cache: Whether to cache the downloaded file (default: True)
        
    Raises:
        AudioPlayerError: If download or playback fails
        
    Example:
        >>> # After generating speech with Fish Audio
        >>> result = fish_audio_service.generate_speech("Wake up!")
        >>> play_audio_from_url(result['audio_url'])
    """
    if not PYGAME_AVAILABLE:
        raise AudioPlayerError(
            "pygame not available. Install with: pip install pygame"
        )
    
    # Download audio (will use cache if enabled)
    if cache:
        local_path = download_audio(url)
    else:
        # Download to temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        local_path = download_audio(url, temp_file.name)
    
    # Play the downloaded file
    try:
        play_local_audio(local_path)
    finally:
        # Clean up if not caching
        if not cache and os.path.exists(local_path):
            os.remove(local_path)


def play_local_audio(file_path: str) -> None:
    """
    Play audio from a local file using pygame.
    
    Supports common audio formats: mp3, wav, ogg, etc.
    
    Args:
        file_path: Path to local audio file
        
    Raises:
        AudioPlayerError: If file doesn't exist or playback fails
        
    Example:
        >>> play_local_audio('/tmp/alarm.mp3')
        >>> play_local_audio('./assets/sheep_bleat.wav')
    """
    # Validate file exists
    if not os.path.exists(file_path):
        raise AudioPlayerError(f"Audio file not found: {file_path}")
    
    if not PYGAME_AVAILABLE:
        raise AudioPlayerError(
            "pygame not available. Install with: pip install pygame"
        )
    
    print(f"▶ Playing: {file_path}")
    
    try:
        # Initialize pygame mixer
        pygame.mixer.init(frequency=44100, size=-16, channels=2, buffer=512)
        
        # Load and play audio
        pygame.mixer.music.load(file_path)
        pygame.mixer.music.play()
        
        # Wait for playback to finish
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
        
        print("✓ Playback finished")
        
        # Clean up
        pygame.mixer.music.unload()
        pygame.mixer.quit()
        
    except pygame.error as e:
        raise AudioPlayerError(f"pygame playback error: {e}")
    except Exception as e:
        raise AudioPlayerError(f"Failed to play audio: {e}")


def stop_audio() -> None:
    """
    Stop currently playing audio using pygame.
    
    Call this to interrupt audio playback before it finishes naturally.
    """
    if not PYGAME_AVAILABLE:
        print("⚠ pygame not available, cannot stop audio")
        return
    
    try:
        if pygame.mixer.get_init():
            pygame.mixer.music.stop()
            pygame.mixer.music.unload()
            print("⏹ Playback stopped")
    except Exception as e:
        print(f"⚠ Error stopping audio: {e}")


def clear_cache() -> int:
    """
    Clear all cached audio files.
    
    Returns:
        int: Number of files deleted
        
    Example:
        >>> deleted = clear_cache()
        >>> print(f"Cleared {deleted} cached files")
    """
    cache_dir = get_cache_dir()
    deleted = 0
    
    try:
        for file in Path(cache_dir).glob('*.*'):
            file.unlink()
            deleted += 1
        
        print(f"✓ Cleared {deleted} cached audio files")
        return deleted
        
    except Exception as e:
        print(f"⚠ Error clearing cache: {e}")
        return deleted


def get_cache_size() -> int:
    """
    Get total size of cached audio files in bytes.
    
    Returns:
        int: Total cache size in bytes
        
    Example:
        >>> size_mb = get_cache_size() / (1024 * 1024)
        >>> print(f"Cache size: {size_mb:.2f} MB")
    """
    cache_dir = get_cache_dir()
    total_size = 0
    
    try:
        for file in Path(cache_dir).glob('*.*'):
            total_size += file.stat().st_size
    except Exception as e:
        print(f"⚠ Error calculating cache size: {e}")
    
    return total_size


def list_cached_files() -> list:
    """
    List all cached audio files.
    
    Returns:
        list: List of cached file paths
    """
    cache_dir = get_cache_dir()
    
    try:
        files = list(Path(cache_dir).glob('*.*'))
        return [str(f) for f in files]
    except Exception as e:
        print(f"⚠ Error listing cache: {e}")
        return []


# ============================================================================
# INTEGRATION EXAMPLES
# ============================================================================

"""
Example 1: Play Fish Audio generated speech
-------------------------------------------
from services import fish_audio_service, audio_player

# Generate speech
result = fish_audio_service.generate_speech(
    text="Wake up, sleepy sheep!",
    voice_id="shleepy-voice-001",
    emotion="excited"
)

# Play audio
audio_player.play_audio_from_url(result['audio_url'])


Example 2: Play cached audio for faster replay
----------------------------------------------
# First play (downloads and caches)
audio_player.play_audio_from_url(audio_url, cache=True)

# Second play (uses cache, instant)
audio_player.play_audio_from_url(audio_url, cache=True)


Example 3: Play local alarm sound
---------------------------------
audio_player.play_local_audio('./assets/alarm.mp3')


Example 4: Flask/FastAPI endpoint
---------------------------------
from flask import Flask, jsonify
from services import fish_audio_service, audio_player

app = Flask(__name__)

@app.route('/api/test-tts', methods=['POST'])
def test_tts():
    text = request.json.get('text', 'Hello!')
    
    # Generate speech
    result = fish_audio_service.generate_speech(text)
    
    # Optionally play locally for testing
    if request.json.get('play_local', False):
        audio_player.play_audio_from_url(result['audio_url'])
    
    return jsonify({
        'audio_url': result['audio_url'],
        'duration': result['duration']
    })


Example 5: Batch pre-generation for alarms
------------------------------------------
import time

alarm_messages = [
    "Good morning, sleepy sheep!",
    "Time to wake up!",
    "Rise and shine!"
]

for msg in alarm_messages:
    result = fish_audio_service.generate_speech(
        text=msg,
        save_to=f"./alarms/{hash(msg)}.mp3"
    )
    print(f"Generated: {msg}")
    time.sleep(1)  # Rate limit


Example 6: Cache management
---------------------------
# Check cache size
size_mb = audio_player.get_cache_size() / (1024 * 1024)
print(f"Cache size: {size_mb:.2f} MB")

# List cached files
files = audio_player.list_cached_files()
print(f"Cached files: {len(files)}")

# Clear cache if too large
if size_mb > 100:  # Clear if > 100 MB
    audio_player.clear_cache()
"""

