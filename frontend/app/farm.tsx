import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useGameStore } from '../store/gameStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SKY_HEIGHT = 300;

export default function FarmScreen() {
  const router = useRouter();
  const { user } = useGameStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sunPosition] = useState(new Animated.ValueXY({ x: 0, y: 0 }));

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate time-based values
  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const getTimeProgress = () => {
    // Returns 0-1 representing progress through the day
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    return (hour + minute / 60) / 24;
  };

  const getSunPosition = () => {
    const progress = getTimeProgress();
    // Sun rises at 6am (0.25) and sets at 8pm (0.833)
    const dayStart = 0.25; // 6am
    const dayEnd = 0.833; // 8pm
    
    let sunProgress = 0;
    if (progress >= dayStart && progress <= dayEnd) {
      sunProgress = (progress - dayStart) / (dayEnd - dayStart);
    } else {
      // Sun is hidden (night time)
      return null;
    }

    // Create arc motion
    const x = sunProgress * (SCREEN_WIDTH - 60); // 60 for sun size
    const y = Math.sin(sunProgress * Math.PI) * -150 + 50; // Arc shape

    return { x, y };
  };

  const getSkyColors = () => {
    const timeOfDay = getTimeOfDay();
    
    switch (timeOfDay) {
      case 'morning':
        return {
          top: '#FFB347', // Orange
          bottom: '#87CEEB', // Sky blue
        };
      case 'afternoon':
        return {
          top: '#87CEEB', // Sky blue
          bottom: '#B0E0E6', // Powder blue
        };
      case 'evening':
        return {
          top: '#FF6B6B', // Sunset red
          bottom: '#FFD93D', // Sunset yellow
        };
      case 'night':
        return {
          top: '#0f1c3f', // Dark blue
          bottom: '#1a1a2e', // Dark purple
        };
      default:
        return {
          top: '#87CEEB',
          bottom: '#B0E0E6',
        };
    }
  };

  const getGroundColor = () => {
    const timeOfDay = getTimeOfDay();
    return timeOfDay === 'night' ? '#2d5016' : '#6bcf7f';
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    const hour = currentTime.getHours();
    
    switch (timeOfDay) {
      case 'morning':
        return '🌅 Good Morning!';
      case 'afternoon':
        return '☀️ Good Afternoon!';
      case 'evening':
        return '🌆 Good Evening!';
      case 'night':
        return '🌙 Good Night!';
      default:
        return '👋 Hello!';
    }
  };

  const sunPos = getSunPosition();
  const skyColors = getSkyColors();
  const groundColor = getGroundColor();
  const timeOfDay = getTimeOfDay();
  const isNight = timeOfDay === 'night';

  const liveSheep = user?.sheep.filter(s => s.isAlive) || [];
  const deadSheep = user?.sheep.filter(s => !s.isAlive) || [];

  // Position sheep in a grid
  const getSheepPosition = (index: number) => {
    const sheepPerRow = 3;
    const row = Math.floor(index / sheepPerRow);
    const col = index % sheepPerRow;
    
    const spacing = 100;
    const offsetX = 30;
    const offsetY = 350;

    return {
      left: offsetX + col * spacing,
      top: offsetY + row * 80,
    };
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: skyColors.bottom }]}>
      {/* Sky with gradient effect */}
      <View
        style={[
          styles.sky,
          {
            backgroundColor: skyColors.top,
          },
        ]}
      >
        {/* Sun (only during day) */}
        {sunPos && !isNight && (
          <View
            style={[
              styles.sun,
              {
                left: sunPos.x,
                top: sunPos.y,
              },
            ]}
          >
            <Text style={styles.sunEmoji}>☀️</Text>
          </View>
        )}

        {/* Moon (only at night) */}
        {isNight && (
          <View style={styles.moon}>
            <Text style={styles.moonEmoji}>🌙</Text>
          </View>
        )}

        {/* Stars (only at night) */}
        {isNight && (
          <>
            <Text style={[styles.star, { top: 30, left: 50 }]}>⭐</Text>
            <Text style={[styles.star, { top: 80, left: 150 }]}>✨</Text>
            <Text style={[styles.star, { top: 50, right: 80 }]}>⭐</Text>
            <Text style={[styles.star, { top: 100, right: 30 }]}>✨</Text>
          </>
        )}

        {/* Time Display */}
        <View style={styles.timeDisplay}>
          <Text style={[styles.greeting, { color: isNight ? '#fff' : '#333' }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.timeText, { color: isNight ? '#a8a8d1' : '#666' }]}>
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Ground/Farm Area */}
      <View style={[styles.ground, { backgroundColor: groundColor }]}>
        {/* Farm Stats */}
        <View style={styles.farmStats}>
          <View style={styles.statBubble}>
            <Text style={styles.statEmoji}>🐑</Text>
            <Text style={styles.statValue}>{liveSheep.length}</Text>
            <Text style={styles.statLabel}>Sheep</Text>
          </View>
          <View style={styles.statBubble}>
            <Text style={styles.statEmoji}>🧶</Text>
            <Text style={styles.statValue}>{user?.woolBlocks || 0}</Text>
            <Text style={styles.statLabel}>Wool</Text>
          </View>
          <View style={styles.statBubble}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{user?.streak || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Lamb Chop Warning */}
        {deadSheep.length > 0 && (
          <View style={styles.lambChopWarning}>
            <Text style={styles.warningEmoji}>🍳</Text>
            <Text style={styles.warningText}>
              {deadSheep.length} sheep lost to Lamb Chop
            </Text>
          </View>
        )}

        {/* Sheep Display */}
        <View style={styles.sheepContainer}>
          {liveSheep.length === 0 ? (
            <View style={styles.emptyFarm}>
              <Text style={styles.emptyText}>🌾</Text>
              <Text style={styles.emptyLabel}>Your farm is empty!</Text>
              <Text style={styles.emptySubtext}>
                Sleep 8-10 hours to earn sheep
              </Text>
            </View>
          ) : (
            <>
              {liveSheep.map((sheep, index) => (
                <View
                  key={sheep.id}
                  style={[styles.sheep, getSheepPosition(index)]}
                >
                  <Text style={styles.sheepEmoji}>🐑</Text>
                  <View style={styles.woolBadge}>
                    <Text style={styles.woolBadgeText}>
                      +{sheep.woolProduction}🧶
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/sleep-log')}
          >
            <Text style={styles.actionEmoji}>💤</Text>
            <Text style={styles.actionText}>Sleep Log</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // TODO: Open shop/customization
              alert('Coming soon: Woolwave Studio & Shop! 🎨');
            }}
          >
            <Text style={styles.actionEmoji}>🏪</Text>
            <Text style={styles.actionText}>Shop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // TODO: Open friends/wars
              alert('Coming soon: Sleep Wars! ⚔️');
            }}
          >
            <Text style={styles.actionEmoji}>👥</Text>
            <Text style={styles.actionText}>Friends</Text>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sky: {
    height: SKY_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  sun: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunEmoji: {
    fontSize: 50,
  },
  moon: {
    position: 'absolute',
    top: 40,
    right: 40,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonEmoji: {
    fontSize: 50,
  },
  star: {
    position: 'absolute',
    fontSize: 20,
  },
  timeDisplay: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
  },
  ground: {
    minHeight: 600,
    paddingTop: 20,
    paddingBottom: 40,
  },
  farmStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  lambChopWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  warningEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  statBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sheepContainer: {
    position: 'relative',
    minHeight: 400,
    paddingHorizontal: 20,
  },
  sheep: {
    position: 'absolute',
    alignItems: 'center',
  },
  sheepEmoji: {
    fontSize: 60,
  },
  woolBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  woolBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyFarm: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 30,
    padding: 12,
  },
  backText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
});
