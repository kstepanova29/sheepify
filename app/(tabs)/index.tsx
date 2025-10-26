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
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../store/gameStore';
import { getRandomPositionInDiamond } from '../../utils/sheepSpawner';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, initializeUser, addSheep, deleteAllSheep } = useGameStore();
  const flatListRef = useRef<FlatList>(null);
  const sheepPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [, forceUpdate] = useState(0); // Force re-render when positions are loaded
  const [isNightMode, setIsNightMode] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [moonFrame, setMoonFrame] = useState(0);
  const [sheepFrame, setSheepFrame] = useState(0);

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

    const platformWidth = SCREEN_WIDTH * 0.84;
    const platformHeight = SCREEN_HEIGHT * 0.48;

    // Get random position within the diamond grass block (now async!)
    const position = await getRandomPositionInDiamond(platformWidth, platformHeight);

    // Add new sheep at random position
    addSheep({
      name: `Sheep #${user.totalSheepEarned + 1}`,
      earnedDate: new Date(),
      woolProduction: 1,
      isAlive: true,
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

  // Load positions for sheep that don't have them yet
  useEffect(() => {
    const loadMissingPositions = async () => {
      if (!user) return;

      const aliveSheep = user.sheep.filter(s => s.isAlive);
      const platformWidth = SCREEN_WIDTH * 0.84;
      const platformHeight = SCREEN_HEIGHT * 0.48;

      for (const sheep of aliveSheep) {
        if (!sheepPositionsRef.current.has(sheep.id)) {
          const position = await getRandomPositionInDiamond(platformWidth, platformHeight);
          sheepPositionsRef.current.set(sheep.id, position);
        }
      }

      // Force re-render to show newly positioned sheep
      forceUpdate(prev => prev + 1);
    };

    loadMissingPositions();
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

    const Container = isNightMode ? View : LinearGradient;
    const containerProps = isNightMode
      ? { style: [styles.screen, styles.nightBackground] }
      : {
          colors: ['#97f0ff', '#e9ebee', '#b8d5fe'],
          style: styles.screen,
        };

    return (
      <Container {...containerProps}>
        {/* Farm Name Cloud Header */}
        <View style={styles.cloudHeaderContainer}>
          <Image
            source={require('@/cloud.png')}
            style={styles.cloudHeader}
            resizeMode="contain"
          />
          <Text style={styles.farmName}>{user?.username}'s farm</Text>
        </View>

        {/* Sun/Moon Icon - Below Header */}
        <View style={styles.sunContainer}>
          <Image
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

        {/* 3D Farm Platform */}
        <Image
          source={require('@/blockofdirt.png')}
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
                key={`${sheep.id}-${sheepFrame}`}
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
        >
          <Text style={styles.toggleDayNightText}>
            {isNightMode ? '☀️ Switch to Day' : '🌙 Switch to Night'}
          </Text>
        </TouchableOpacity>

        {/* Delete All Sheep Button - Testing */}
        <TouchableOpacity
          style={styles.deleteAllSheepButton}
          onPress={handleDeleteAllSheep}
        >
          <Text style={styles.deleteAllSheepText}>🗑️ Delete All</Text>
        </TouchableOpacity>

        {/* Spawn Sheep Button - Testing */}
        <TouchableOpacity
          style={styles.spawnSheepButton}
          onPress={handleSpawnSheep}
        >
          <Text style={styles.spawnSheepText}>🐑 Spawn Sheep</Text>
        </TouchableOpacity>

        {/* Log Sleep Button - Bottom */}
        <TouchableOpacity
          style={styles.logSleepButton}
          onPress={() => router.push('/sleep-log')}
        >
          <Text style={styles.logSleepText}>💤 Log Sleep</Text>
        </TouchableOpacity>
      </Container>
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
  },
  nightBackground: {
    backgroundColor: '#1a1a2e', // Dark blue (current)
  },
  dayBackground: {
    backgroundColor: '#87CEEB', // Sky blue
  },

  // Farm Screen Styles
  cloudHeaderContainer: {
    position: 'absolute',
    top: 60,
    left: SCREEN_WIDTH * 0.05,
    right: SCREEN_WIDTH * 0.05,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cloudHeader: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    tintColor: undefined, // Ensure no tinting
  },
  farmName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
    zIndex: 2,
    paddingHorizontal: 20,
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
  toggleDayNightButton: {
    position: 'absolute',
    bottom: 250,
    left: 30,
    right: 30,
    padding: 15,
    backgroundColor: '#9b59b6',
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  toggleDayNightText: {
    fontSize: 16,
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
