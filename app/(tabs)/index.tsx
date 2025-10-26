import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { useGameStore } from '../../store/gameStore';
import {
  getRandomPositionInDiamond,
  hasAvailableSpots,
  getOccupiedCount,
  getTotalSpots
} from '../../utils/sheepSpawner';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, initializeUser, addSheep, deleteAllSheep } = useGameStore();
  const flatListRef = useRef<FlatList>(null);
  const sheepPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [, forceUpdate] = useState(0); // Force re-render when positions are loaded
  const [windmillFrame, setWindmillFrame] = useState(0); // Windmill animation frame (0 or 1)

  // Load retro pixel font
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });

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
    if (!user) return 'Welcome to Sheepify! 🐑';

    if (user.streak >= 7) {
      return `Amazing! ${user.streak} night streak! 🌟✨`;
    } else if (user.streak >= 3) {
      return `Great job! ${user.streak} nights in a row! 🔥`;
    } else if (user.streak > 0) {
      return `Keep it up! ${user.streak} night streak! 💪`;
    } else if (user.penalties.isInPenalty) {
      return 'Get back on track! 2 good nights needed 🍳';
    } else {
      return 'Start your sleep journey tonight! 🌙';
    }
  };

  // Screen 1: Farm View
  const FarmScreen = () => {
    const aliveSheep = user?.sheep.filter(s => s.isAlive) || [];

    return (
      <View style={styles.screen}>
        {/* Farm Name Cloud Header */}
        <View style={styles.cloudHeaderContainer}>
          <Image
            source={require('@/cloud.png')}
            style={styles.cloudHeader}
            resizeMode="contain"
          />
          <Text style={styles.farmName}>{user?.username}'s farm</Text>
        </View>

        {/* Sun Icon - Below Header */}
        <View style={styles.sunContainer}>
          <Text style={styles.sun}>☀️</Text>
        </View>

        {/* 3D Farm Platform with Animated Windmill */}
        <Image
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
                source={require('@/assets/sprites/sheep/default.png')}
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

        {/* Delete All Sheep Button - Testing */}
        <TouchableOpacity
          style={styles.deleteAllSheepButton}
          onPress={handleDeleteAllSheep}
        >
          <Text style={styles.deleteAllSheepText}>🗑️ Delete All</Text>
        </TouchableOpacity>

        {/* Spawn Sheep Button - Testing */}
        <TouchableOpacity
          style={[styles.spawnSheepButton, !hasAvailableSpots() && styles.spawnButtonDisabled]}
          onPress={handleSpawnSheep}
          disabled={!hasAvailableSpots()}
        >
          <Text style={styles.spawnSheepText}>
            🐑 Spawn Sheep ({getOccupiedCount()}/{getTotalSpots()})
          </Text>
        </TouchableOpacity>

        {/* Log Sleep Button - Bottom */}
        <TouchableOpacity
          style={styles.logSleepButton}
          onPress={() => router.push('/sleep-log')}
        >
          <Text style={styles.logSleepText}>💤 Log Sleep</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Screen 2: Stats/Sleep View
  const StatsScreen = () => {
    const aliveSheep = user?.sheep.filter(s => s.isAlive).length || 0;

    return (
      <View style={styles.screen}>
        {/* Dynamic Header Text */}
        <View style={styles.messageHeader}>
          <Text style={styles.messageText}>{getStreakMessage()}</Text>
        </View>

        {/* Large Shleepy Character */}
        <View style={styles.shleepyContainer}>
          <Image
            source={require('@/assets/sprites/sheep/default.png')}
            style={styles.shleepyCharacter}
            resizeMode="contain"
          />
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Sleep Streak</Text>
            <Text style={styles.statValue}>
              {user?.streak || 0} {user?.streak ? '🔥' : ''}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Wool Blocks</Text>
            <Text style={styles.statValue}>{user?.woolBlocks || 0} 🧶</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Shepherd Tokens</Text>
            <Text style={styles.statValue}>{user?.shepherdTokens || 0} 🏆</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Sheep</Text>
            <Text style={styles.statValue}>{aliveSheep} 🐑</Text>
          </View>
        </View>
      </View>
    );
  };

  const screens = [
    { key: 'farm', component: FarmScreen },
    { key: 'stats', component: StatsScreen },
  ];

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        pagingEnabled
        data={screens}
        renderItem={({ item }) => <item.component />}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#1a1a2e',
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
    top: SCREEN_HEIGHT * 0.22,  // Moved down slightly to avoid larger cloud
    right: 30,
    zIndex: 10,
  },
  sun: {
    fontSize: 40,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
  messageHeader: {
    marginTop: 80,
    marginHorizontal: 30,
    padding: 20,
    backgroundColor: '#16213e',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  messageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  shleepyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  shleepyCharacter: {
    width: 200,
    height: 200,
  },
  statsCard: {
    marginHorizontal: 30,
    marginTop: 30,
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
    fontSize: 16,
    color: '#a8a8d1',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  deleteAllSheepButton: {
    position: 'absolute',
    bottom: 180,
    left: 30,
    right: 30,
    padding: 15,
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  deleteAllSheepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  spawnSheepButton: {
    position: 'absolute',
    bottom: 110,
    left: 30,
    right: 30,
    padding: 15,
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  spawnSheepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});
