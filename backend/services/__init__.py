"""
Sheepify Backend Services

This package contains backend services for the Sheepify app:
- fish_audio_service: Fish Audio TTS API client
- audio_player: Audio playback for testing

Import examples:
    from services import fish_audio_service, audio_player
    
    result = fish_audio_service.generate_speech("Hello!")
    audio_player.play_audio_from_url(result['audio_url'])
"""

from . import fish_audio_service
from . import audio_player

__all__ = ['fish_audio_service', 'audio_player']

