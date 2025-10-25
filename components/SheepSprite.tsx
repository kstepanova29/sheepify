import React from 'react';
import { Image, StyleSheet, Text, ViewStyle } from 'react-native';

interface SheepSpriteProps {
  size?: number;
  style?: ViewStyle;
  isAlive?: boolean;
}

export default function SheepSprite({ size = 60, style, isAlive = true }: SheepSpriteProps) {
  // Fallback to emoji if image doesn't exist
  try {
    return (
      <Image
        source={require('../assets/sheep/sheep-ver1.png')}
        style={[
          styles.sheep,
          {
            width: size,
            height: size,
            opacity: isAlive ? 1 : 0.3,
          },
          style,
        ]}
        resizeMode="contain"
      />
    );
  } catch (error) {
    // Fallback to emoji if image file doesn't exist
    return (
      <Text
        style={[
          styles.fallbackEmoji,
          {
            fontSize: size * 0.8,
            opacity: isAlive ? 1 : 0.3,
          },
          style,
        ]}
      >
        🐑
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  sheep: {
    // Base styles for the sheep sprite
  },
  fallbackEmoji: {
    textAlign: 'center',
  },
});