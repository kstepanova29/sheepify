#!/usr/bin/env python3
"""
Fish Audio Integration - Example Usage

This script demonstrates how to:
1. Generate speech from text using Fish Audio API
2. Play the generated audio locally
3. Handle errors gracefully
4. Cache audio for faster replay

Prerequisites:
- Fish Audio API key in .env file
- Required packages installed (see requirements.txt)

Run:
    python example_usage.py
"""

import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from services import fish_audio_service, audio_player


def example_1_basic_tts():
    """Example 1: Basic text-to-speech generation"""
    print("\n" + "="*60)
    print("EXAMPLE 1: Basic Text-to-Speech")
    print("="*60)
    
    try:
        # Generate speech from simple text
        text = "Ewe nailed it! Great sleep, sleepy sheep!"
        print(f"\n📝 Input text: {text}")
        
        result = fish_audio_service.generate_speech(
            text=text,
            speed=1.0,
            emotion="excited"
        )
        
        print(f"✓ Audio generated successfully!")
        print(f"  URL: {result['audio_url']}")
        print(f"  Duration: {result['duration']} seconds")
        print(f"  Voice ID: {result['voice_id']}")
        
        # Play the audio
        print("\n▶ Playing audio...")
        audio_player.play_audio_from_url(result['audio_url'])
        
        print("✓ Example 1 completed!\n")
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}\n")
        return False


def example_2_custom_voice():
    """Example 2: Custom voice and speed settings"""
    print("\n" + "="*60)
    print("EXAMPLE 2: Custom Voice & Speed")
    print("="*60)
    
    try:
        text = "Wake up! Time to start your day!"
        print(f"\n📝 Input text: {text}")
        
        result = fish_audio_service.generate_speech(
            text=text,
            voice_id="default",  # Replace with your custom voice ID
            speed=1.2,           # 20% faster
            emotion="energetic",
            format="mp3"
        )
        
        print(f"✓ Audio generated with custom settings!")
        print(f"  Speed: 1.2x")
        print(f"  Emotion: energetic")
        
        print("\n▶ Playing audio...")
        audio_player.play_audio_from_url(result['audio_url'])
        
        print("✓ Example 2 completed!\n")
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}\n")
        return False


def example_3_save_local():
    """Example 3: Generate and save audio locally"""
    print("\n" + "="*60)
    print("EXAMPLE 3: Save Audio Locally")
    print("="*60)
    
    try:
        text = "Good night, sleepy sheep! Sweet dreams!"
        output_path = "/tmp/goodnight.mp3"
        
        print(f"\n📝 Input text: {text}")
        print(f"💾 Saving to: {output_path}")
        
        result = fish_audio_service.generate_speech(
            text=text,
            speed=0.9,        # Slower, more calming
            emotion="calm",
            save_to=output_path
        )
        
        print(f"✓ Audio saved successfully!")
        print(f"  File: {result['local_path']}")
        print(f"  Size: {os.path.getsize(output_path) / 1024:.1f} KB")
        
        # Play from local file
        print("\n▶ Playing from local file...")
        audio_player.play_local_audio(output_path)
        
        print("✓ Example 3 completed!\n")
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}\n")
        return False


def example_4_claude_integration():
    """Example 4: Simulate Claude + Fish Audio integration"""
    print("\n" + "="*60)
    print("EXAMPLE 4: Claude + Fish Audio Integration")
    print("="*60)
    
    try:
        # Simulate a message from Claude (with emojis)
        claude_message = "Ewe nailed it! 9 hours of sleep! You're un-BAAAA-lievable! 💕🐑✨"
        
        print(f"\n📝 Claude message: {claude_message}")
        print("🔧 Converting to speech (emojis will be stripped)...")
        
        result = fish_audio_service.claude_to_speech(
            claude_message=claude_message,
            speed=1.1
            # emotion is auto-detected from message content
        )
        
        print(f"✓ Converted Claude message to speech!")
        print(f"  Auto-detected emotion based on message tone")
        
        print("\n▶ Playing audio...")
        audio_player.play_audio_from_url(result['audio_url'])
        
        print("✓ Example 4 completed!\n")
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}\n")
        return False


def example_5_error_handling():
    """Example 5: Graceful error handling with safe wrapper"""
    print("\n" + "="*60)
    print("EXAMPLE 5: Safe Error Handling")
    print("="*60)
    
    try:
        text = "This might fail gracefully if there's an issue"
        
        print(f"\n📝 Input text: {text}")
        print("🛡️ Using safe wrapper (won't crash on errors)...")
        
        result = fish_audio_service.generate_speech_safe(
            text=text,
            speed=1.0
        )
        
        if result:
            print("✓ Speech generated successfully!")
            print("\n▶ Playing audio...")
            audio_player.play_audio_from_url(result['audio_url'])
        else:
            print("⚠ Speech generation failed, falling back to text")
            print(f"→ Text message: {text}")
        
        print("✓ Example 5 completed!\n")
        return True
        
    except Exception as e:
        print(f"✗ Unexpected error: {e}\n")
        return False


def example_6_cache_management():
    """Example 6: Audio caching demonstration"""
    print("\n" + "="*60)
    print("EXAMPLE 6: Audio Caching")
    print("="*60)
    
    try:
        text = "This audio will be cached for faster replay"
        
        print(f"\n📝 Input text: {text}")
        
        # First generation (downloads and caches)
        print("\n🔄 First generation (downloading)...")
        result = fish_audio_service.generate_speech(text=text)
        
        import time
        start = time.time()
        audio_player.play_audio_from_url(result['audio_url'], cache=True)
        first_time = time.time() - start
        
        # Second play (uses cache)
        print("\n⚡ Second play (from cache)...")
        start = time.time()
        audio_player.play_audio_from_url(result['audio_url'], cache=True)
        second_time = time.time() - start
        
        print(f"\n📊 Performance comparison:")
        print(f"  First play:  {first_time:.2f}s (with download)")
        print(f"  Second play: {second_time:.2f}s (from cache)")
        
        # Show cache stats
        cache_size = audio_player.get_cache_size()
        cached_files = audio_player.list_cached_files()
        
        print(f"\n💾 Cache statistics:")
        print(f"  Files: {len(cached_files)}")
        print(f"  Size: {cache_size / 1024:.1f} KB")
        
        print("\n✓ Example 6 completed!\n")
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}\n")
        return False


def run_all_examples():
    """Run all examples in sequence"""
    print("\n" + "="*60)
    print("🐑 FISH AUDIO INTEGRATION - EXAMPLE USAGE")
    print("="*60)
    print("\nThis script demonstrates Fish Audio TTS integration")
    print("for the Sheepify sleep-tracking app.")
    
    # Check if API key is configured
    api_key = os.getenv('FISH_AUDIO_API_KEY')
    if not api_key:
        print("\n❌ ERROR: Fish Audio API key not found!")
        print("\nPlease set FISH_AUDIO_API_KEY in your .env file:")
        print("  1. Copy .env.example to .env")
        print("  2. Add your Fish Audio API key")
        print("  3. Run this script again")
        print("\nGet your API key at: https://fish.audio/")
        return
    
    print("\n✓ Fish Audio API key found")
    
    # Run examples
    examples = [
        ("Basic TTS", example_1_basic_tts),
        ("Custom Voice & Speed", example_2_custom_voice),
        ("Save Audio Locally", example_3_save_local),
        ("Claude Integration", example_4_claude_integration),
        ("Error Handling", example_5_error_handling),
        ("Caching", example_6_cache_management),
    ]
    
    results = []
    
    for name, example_func in examples:
        try:
            success = example_func()
            results.append((name, success))
        except KeyboardInterrupt:
            print("\n\n⚠ Examples interrupted by user")
            break
        except Exception as e:
            print(f"\n✗ Unexpected error in {name}: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    for name, success in results:
        status = "✓" if success else "✗"
        print(f"{status} {name}")
    
    total = len(results)
    passed = sum(1 for _, s in results if s)
    print(f"\nPassed: {passed}/{total}")
    
    # Cache cleanup option
    if passed > 0:
        print("\n💡 Tip: Clear cache with:")
        print("   python -c 'from services import audio_player; audio_player.clear_cache()'")


def interactive_mode():
    """Interactive mode for custom testing"""
    print("\n" + "="*60)
    print("🎤 INTERACTIVE MODE")
    print("="*60)
    print("\nEnter text to convert to speech (or 'quit' to exit)")
    
    while True:
        try:
            print("\n" + "-"*60)
            text = input("Enter text: ").strip()
            
            if text.lower() in ['quit', 'exit', 'q']:
                print("Goodbye! 🐑")
                break
            
            if not text:
                print("⚠ Please enter some text")
                continue
            
            # Optional parameters
            speed_input = input("Speed (0.5-2.0, default 1.0): ").strip()
            speed = float(speed_input) if speed_input else 1.0
            
            emotion = input("Emotion (happy/sad/excited/calm, default auto): ").strip()
            emotion = emotion if emotion else None
            
            # Generate and play
            print("\n🔄 Generating speech...")
            result = fish_audio_service.generate_speech(
                text=text,
                speed=speed,
                emotion=emotion
            )
            
            print("✓ Generated!")
            print("\n▶ Playing audio...")
            audio_player.play_audio_from_url(result['audio_url'])
            
        except KeyboardInterrupt:
            print("\n\nGoodbye! 🐑")
            break
        except Exception as e:
            print(f"\n✗ Error: {e}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Fish Audio TTS Integration Examples"
    )
    parser.add_argument(
        '--interactive', '-i',
        action='store_true',
        help="Run in interactive mode"
    )
    parser.add_argument(
        '--example', '-e',
        type=int,
        choices=range(1, 7),
        help="Run a specific example (1-6)"
    )
    
    args = parser.parse_args()
    
    if args.interactive:
        interactive_mode()
    elif args.example:
        examples = [
            example_1_basic_tts,
            example_2_custom_voice,
            example_3_save_local,
            example_4_claude_integration,
            example_5_error_handling,
            example_6_cache_management,
        ]
        examples[args.example - 1]()
    else:
        run_all_examples()

