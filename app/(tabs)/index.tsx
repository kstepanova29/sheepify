import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { useGameStore } from '../../store/gameStore';
import {
  getRandomPositionInDiamond,
  hasAvailableSpots,
  getOccupiedCount,
  getTotalSpots
} from '../../utils/sheepSpawner';
import { claudeService } from '../../services/ai/claudeService';
import { ShleepyContext } from '../../types/shleepy';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, initializeUser, addSheep, deleteAllSheep, sleepHistory } = useGameStore();
  const sheepPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [, forceUpdate] = useState(0); // Force re-render when positions are loaded
  const [windmillFrame, setWindmillFrame] = useState(0); // Windmill animation frame (0 or 1)
  const [isNightMode, setIsNightMode] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [moonFrame, setMoonFrame] = useState(0);
  const [sheepFrame, setSheepFrame] = useState(0);

  // Shleepy message state
  const [shleepyMessage, setShleepyMessage] = useState<string | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [lastSleepSessionShown, setLastSleepSessionShown] = useState<string | null>(null);

  // Load retro pixel font
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });

  // Check if current time is night (7pm-5am)
  const checkIsNightTime = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 19 || hour < 5; // 7pm (19:00) to 5am
  };

  // Update night mode based on actual time
  useEffect(() => {
    if (!manualOverride) {
      setIsNightMode(checkIsNightTime());

      // Update every minute to check for day/night changes
      const interval = setInterval(() => {
        setIsNightMode(checkIsNightTime());
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [manualOverride]);

  // Animate moon frames (switch every second)
  useEffect(() => {
    if (isNightMode) {
      const interval = setInterval(() => {
        setMoonFrame(prev => (prev === 0 ? 1 : 0));
      }, 1000); // Switch frames every 1 second

      return () => clearInterval(interval);
    } else {
      // Reset moon frame when switching to day
      setMoonFrame(0);
    }
  }, [isNightMode]);

  // Animate sheep frames (switch every second)
  useEffect(() => {
    const interval = setInterval(() => {
      setSheepFrame(prev => (prev === 0 ? 1 : 0));
    }, 1000); // Switch frames every 1 second

    return () => clearInterval(interval);
  }, []);

  // Toggle day/night for testing
  const toggleDayNight = () => {
    setManualOverride(true);
    setIsNightMode(!isNightMode);
  };

  const handleSpawnSheep = async () => {
    if (!user) return;

    // Check if there are available grid spots
    if (!hasAvailableSpots()) {
      console.log(`[HomeScreen] Grid is full! ${getOccupiedCount()}/${getTotalSpots()} spots occupied`);
      return;
    }

    const platformWidth = SCREEN_WIDTH * 0.84;
    const platformHeight = SCREEN_HEIGHT * 0.48;

    // Get random position from grid system
    const position = await getRandomPositionInDiamond(platformWidth, platformHeight);

    if (!position) {
      console.log('[HomeScreen] No position available - grid is full');
      return;
    }

    // Add new sheep with grid spot ID
    addSheep({
      name: `Sheep #${user.totalSheepEarned + 1}`,
      earnedDate: new Date(),
      woolProduction: 1,
      isAlive: true,
      gridSpotId: position.gridSpotId,
    });
  };

  const handleDeleteAllSheep = () => {
    if (!user) return;
    // Clear stored positions and delete all sheep
    sheepPositionsRef.current.clear();
    deleteAllSheep();
  };

  useEffect(() => {
    // Initialize user if not exists
    if (!user) {
      initializeUser('Shepherd');
    }
    // Clear all sheep on reload to start fresh
    deleteAllSheep();
    sheepPositionsRef.current.clear();
  }, []);

  // Windmill animation - toggle frames twice per second (every 500ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setWindmillFrame(prev => prev === 0 ? 1 : 0);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Load positions for sheep based on their grid spots
  useEffect(() => {
    const loadSheepPositions = async () => {
      if (!user) return;

      const aliveSheep = user.sheep.filter(s => s.isAlive);
      const platformWidth = SCREEN_WIDTH * 0.84;
      const platformHeight = SCREEN_HEIGHT * 0.48;

      // Load grid positions from JSON
      const gridData = require('../../utils/sheep_grid_positions.json');
      const imageWidth = gridData.imageDimensions.width;
      const imageHeight = gridData.imageDimensions.height;

      for (const sheep of aliveSheep) {
        if (!sheepPositionsRef.current.has(sheep.id)) {
          // If sheep has a grid spot, use that position
          if (sheep.gridSpotId !== undefined) {
            const spot = gridData.spots.find((s: any) => s.id === sheep.gridSpotId);
            if (spot) {
              // Convert from image coordinates to platform coordinates
              const x = (spot.x / imageWidth) * platformWidth - 30; // Center sheep (60/2)
              const y = (spot.y / imageHeight) * platformHeight - 30 - 10; // Move up 10 pixels total
              sheepPositionsRef.current.set(sheep.id, { x, y });
            }
          } else {
            // Fallback for sheep without grid spots (legacy)
            const position = await getRandomPositionInDiamond(platformWidth, platformHeight);
            if (position) {
              sheepPositionsRef.current.set(sheep.id, position);
            }
          }
        }
      }

      // Force re-render to show newly positioned sheep
      forceUpdate(prev => prev + 1);
    };

    loadSheepPositions();
  }, [user?.sheep.length]); // Re-run when sheep count changes

  const getStreakMessage = () => {
    if (!user) return 'Welcome to Sheepify!';

    if (user.streak >= 7) {
      return `Amazing! ${user.streak} night streak!`;
    } else if (user.streak >= 3) {
      return `Great job! ${user.streak} nights in a row!`;
    } else if (user.streak > 0) {
      return `Keep it up! ${user.streak} night streak!`;
    } else if (user.penalties.isInPenalty) {
      return 'Get back on track! 2 good nights needed';
    } else {
      return 'Start your sleep journey tonight!';
    }
  };

  // Check if there's a new sleep session we haven't shown a dream for
  const hasNewSleepSession = () => {
    if (!sleepHistory || sleepHistory.length === 0) return false;
    const latestSleep = sleepHistory[0];
    return latestSleep.id !== lastSleepSessionShown;
  };

  // Handle Shleepy click to generate messages
  const handleShleepyClick = async () => {
    if (!user) return;

    setIsLoadingMessage(true);
    setShleepyMessage('...');  // Show loading indicator

    try {
      let message = '';

      // Check if this is the first message after waking up from a new sleep session
      if (hasNewSleepSession()) {
        // Generate dream message - this is shown as the first message after waking
        const lastSleep = sleepHistory[0];
        const sleepQuality = lastSleep.quality;
        message = await claudeService.generateDream(sleepQuality);

        setLastSleepSessionShown(lastSleep.id);
      } else {
        // Generate message based on sleep quality
        const lastSleep = sleepHistory.length > 0 ? sleepHistory[0] : null;

        if (lastSleep) {
          const context: ShleepyContext = {
            sleepDuration: lastSleep.duration,
            sleepQuality: lastSleep.quality,
            streak: user.streak,
            penaltyWarning: user.penalties.lambChopWarning,
            totalSheep: user.sheep.filter(s => s.isAlive).length,
            lastSleepDate: user.lastSleepDate,
          };

          message = await claudeService.generateSleepMessage(context);
        } else {
          // No sleep history yet, generate a general message
          message = await claudeService.sendMessage(
            "Generate a motivational message about starting a good sleep routine. Be encouraging!"
          );
        }
      }

      setShleepyMessage(message);

      // Message stays visible until replaced by new message
    } catch (error) {
      console.error('Error generating message:', error);
      setShleepyMessage("Baaah! My wool-gathering thoughts are tangled! 🐑");
    } finally {
      setIsLoadingMessage(false);
    }
  };

  // Screen 1: Farm View
  const FarmScreen = () => {
    const aliveSheep = user?.sheep.filter(s => s.isAlive) || [];

    const containerProps = isNightMode
      ? {
          colors: ['#0f3785', '#211456', '#00142f'] as const,
          style: styles.screen,
        }
      : {
          colors: ['#97f0ff', '#e9ebee', '#b8d5fe'] as const,
          style: styles.screen,
        };

    return (
      <LinearGradient {...containerProps}>
        {/* Farm Name Cloud Header */}
        <View style={styles.cloudHeaderContainer}>
          <Image
            key="cloud-header"
            source={require('@/cloud.png')}
            style={styles.cloudHeader}
            resizeMode="contain"
          />
          <Text style={styles.farmName}>{user?.username}'s farm</Text>
        </View>

        {/* Sun/Moon Icon - Below Header */}
        <View style={styles.sunContainer}>
          <Image
            key="sun-moon-image"
            source={
              isNightMode
                ? moonFrame === 0
                  ? require('@/moon-frame1.png')
                  : require('@/moon-frame2.png')
                : require('@/sun.png.png')
            }
            style={isNightMode ? styles.moon : styles.sun}
            resizeMode="contain"
          />
        </View>

        {/* 3D Farm Platform with Animated Windmill */}
        <Image
          key="windmill-platform"
          source={windmillFrame === 0
            ? require('@/farm-windmill-1.png')
            : require('@/farm-windmill-2.png')}
          style={styles.farmPlatform}
          resizeMode="contain"
        />

        {/* Sheep on Farm - Diamond shaped grass block */}
        <View style={styles.sheepContainer}>
          {aliveSheep.map((sheep) => {
            // Get position from ref (loaded by useEffect)
            const position = sheepPositionsRef.current.get(sheep.id);
            if (!position) return null; // Don't render until position is loaded

            return (
              <Image
                key={sheep.id}
                source={
                  sheepFrame === 0
                    ? require('@/assets/sprites/sheep/sheep-frame1.png')
                    : require('@/assets/sprites/sheep/sheep-frame2.png')
                }
                style={[
                  styles.sheepSprite,
                  {
                    left: position.x,
                    top: position.y,
                  },
                ]}
                resizeMode="contain"
              />
            );
          })}
        </View>

        {/* Toggle Day/Night Button - Testing */}
        <TouchableOpacity
          style={styles.toggleDayNightButton}
          onPress={toggleDayNight}
          delayPressIn={0}
        >
          <Text style={styles.toggleDayNightText}>
            {isNightMode ? 'Dy' : 'Nt'}
          </Text>
        </TouchableOpacity>

        {/* Delete All Sheep Button - Testing */}
        <TouchableOpacity
          style={styles.deleteAllSheepButton}
          onPress={handleDeleteAllSheep}
          delayPressIn={0}
        >
          <Text style={styles.deleteAllSheepText}>Clr</Text>
        </TouchableOpacity>

        {/* Spawn Sheep Button - Testing */}
        <TouchableOpacity
          style={[styles.spawnSheepButton, !hasAvailableSpots() && styles.spawnButtonDisabled]}
          onPress={handleSpawnSheep}
          disabled={!hasAvailableSpots()}
          delayPressIn={0}
        >
          <Text style={styles.spawnSheepText}>
            Spn
          </Text>
        </TouchableOpacity>

        {/* Log Sleep Button - Bottom */}
        <TouchableOpacity
          style={styles.logSleepButton}
          onPress={() => router.push('/sleep-log')}
        >
          <Text style={styles.logSleepText}>Log Sleep</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  // Screen 2: Stats/Sleep View
  const StatsScreen = () => {
    const aliveSheep = user?.sheep.filter(s => s.isAlive).length || 0;

    const containerProps = isNightMode
      ? {
          colors: ['#0f3785', '#211456', '#00142f'] as const,
          style: styles.screen,
        }
      : {
          colors: ['#97f0ff', '#e9ebee', '#b8d5fe'] as const,
          style: styles.screen,
        };

    return (
      <LinearGradient {...containerProps}>
        {/* Large Shleepy Character - Now Clickable */}
        <View style={styles.shleepyContainer}>
          <TouchableOpacity
            onPress={handleShleepyClick}
            disabled={isLoadingMessage}
            activeOpacity={0.8}
          >
            <Image
              source={require('@/shleepy.png')}
              style={styles.shleepyCharacter}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Speech Bubble for Messages */}
          {shleepyMessage && (
            <View style={styles.speechBubble}>
              <Image
                source={require('@/speech-bubble.png')}
                style={styles.speechBubbleImage}
                resizeMode="contain"
              />
              <Text style={styles.speechBubbleText} numberOfLines={7}>
                {shleepyMessage}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Sleep Streak</Text>
            <Text style={styles.statValue}>
              {user?.streak || 0}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Wool Blocks</Text>
            <Text style={styles.statValue}>{user?.woolBlocks || 0}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Shepherd Tokens</Text>
            <Text style={styles.statValue}>{user?.shepherdTokens || 0}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Sheep</Text>
            <Text style={styles.statValue}>{aliveSheep}</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        bounces={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pageContainer}>
          <FarmScreen />
        </View>
        <View style={styles.pageContainer}>
          <StatsScreen />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    flexDirection: 'row',  // Lay out pages horizontally
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',  // Critical: prevents any content from bleeding between pages
  },
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#1a1a2e',
    overflow: 'hidden',
  },

  // Farm Screen Styles
  cloudHeaderContainer: {
    position: 'absolute',
    top: -20,  // Moving UP more (smaller value = higher on screen)
    left: SCREEN_WIDTH * -0.15,  // Even wider cloud
    right: SCREEN_WIDTH * -0.15,  // Even wider cloud
    height: 240,  // 2x original height for bigger cloud
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    
  },
  cloudHeader: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    transform: [{ scaleX: 1.2 }],
  },
  farmName: {
    fontSize: 14,  // Slightly bigger but still fits in cloud
    fontWeight: '400',  // Normal weight for pixel font
    color: '#2c2c2c',  // Slightly darker for better contrast
    textAlign: 'center',
    zIndex: 2,
    fontFamily: 'PressStart2P_400Regular',  // Retro 8-bit pixel font
    letterSpacing: 0,  // Normal spacing
    lineHeight: 18,  // Adjusted for font size
    transform: [{ translateY: 17 }],

  },
  sunContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.20,
    left: 30,
    zIndex: 10,
  },
  sun: {
    width: 240,
    height: 240,
  },
  moon: {
    width: 180,
    height: 180,
  },
  currencyBar: {
    position: 'absolute',
    left: 20,
    top: 150,
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: 12,
    padding: 12,
    zIndex: 10,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  currencyIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  currencyValue: {
    fontSize: 12,
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'PressStart2P_400Regular',
  },
  farmPlatform: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.28,
    left: SCREEN_WIDTH * 0.08,
    width: SCREEN_WIDTH * 0.84,
    height: SCREEN_HEIGHT * 0.48,
    overflow: 'visible',
  },
  sheepContainer: {
    position: 'absolute',
    // Position over the farmPlatform
    top: SCREEN_HEIGHT * 0.28,
    left: SCREEN_WIDTH * 0.08,
    width: SCREEN_WIDTH * 0.84,
    height: SCREEN_HEIGHT * 0.48,
    zIndex: 5,
    overflow: 'visible',
  },
  sheepSprite: {
    position: 'absolute',
    width: 60,
    height: 60,
  },

  // Stats Screen Styles
  shleepyContainer: {
    marginTop: 260,  // Adjusted to keep speech bubble fully within page bounds (260 - 250 = 10px from top)
    alignItems: 'center',
    position: 'relative',
  },
  shleepyCharacter: {
    width: 320,  // Made bigger
    height: 320, // Made bigger
  },
  speechBubble: {
    position: 'absolute',
    top: -280,  // Positioned above the bigger head
    alignSelf: 'center',  // Center horizontally
    width: 1400,  // WAY bigger bubble
    height: 350,  // WAY bigger height
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechBubbleImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: [
    { scaleX: 1.5 },  // widen
    { scaleY: 1.5 },  // make taller
],

  },
  speechBubbleText: {
    fontSize: 13,  // Bigger text for bigger bubble
    fontFamily: 'PressStart2P_400Regular',
    color: '#2c2c2c',
    textAlign: 'center',
    paddingHorizontal: 50,  // Lots of padding
    paddingVertical: 30,  // Lots of vertical padding
    lineHeight: 22,  // Better line spacing
    zIndex: 1,
    maxWidth: 370,  // Wide but text is short (100 chars)
  },
  statsCard: {
    marginHorizontal: 30,
    marginTop: -40,  // Increased to add more space
    padding: 20,
    backgroundColor: '#16213e',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 10,
    color: '#a8a8d1',
    fontFamily: 'PressStart2P_400Regular',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'PressStart2P_400Regular',
  },
  toggleDayNightButton: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: 40,
    height: 40,
    backgroundColor: '#9b59b6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  toggleDayNightText: {
    fontSize: 8,
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'PressStart2P_400Regular',
  },
  deleteAllSheepButton: {
    position: 'absolute',
    top: 100,
    right: 10,
    width: 40,
    height: 40,
    backgroundColor: '#ff6b6b',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteAllSheepText: {
    fontSize: 8,
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'PressStart2P_400Regular',
  },
  spawnSheepButton: {
    position: 'absolute',
    top: 150,
    right: 10,
    width: 40,
    height: 40,
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  spawnSheepText: {
    fontSize: 8,
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'PressStart2P_400Regular',
  },
  spawnButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  logSleepButton: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    padding: 20,
    backgroundColor: '#e94560',
    borderRadius: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  logSleepText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'PressStart2P_400Regular',
  },
});
