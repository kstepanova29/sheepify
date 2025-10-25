import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGameStore } from '../../store/gameStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, initializeUser } = useGameStore();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Initialize user if not exists
    if (!user) {
      initializeUser('Shepherd');
    }
  }, []);

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

        {/* 3D Farm Platform */}
        <Image
          source={require('@/blockofdirt.png')}
          style={styles.farmPlatform}
          resizeMode="contain"
        />

        {/* Sheep on Farm */}
        <View style={styles.sheepContainer}>
          {aliveSheep.map((sheep, index) => {
            // Container is now exactly the grass block bounds
            // Get container dimensions for positioning
            const containerWidth = SCREEN_WIDTH * 0.84 * (0.933 - 0.065);
            const containerHeight = SCREEN_HEIGHT * 0.48 * (0.782 - 0.134);
            const sheepSize = 60;

            // Position sheep in a grid pattern within the container
            const cols = Math.ceil(Math.sqrt(aliveSheep.length));
            const row = Math.floor(index / cols);
            const col = index % cols;

            // Calculate center of container
            const centerX = containerWidth / 2;
            const centerY = containerHeight / 2;

            // Spread sheep around center
            const offsetX = (col - (cols - 1) / 2) * 80;
            const offsetY = (row - (cols - 1) / 2) * 80;

            const posX = centerX - sheepSize / 2 + offsetX;
            const posY = centerY - sheepSize / 2 + offsetY;

            return (
              <Image
                key={sheep.id}
                source={require('@/assets/sprites/sheep/default.png')}
                style={[
                  styles.sheepSprite,
                  {
                    left: posX,
                    top: posY,
                  },
                ]}
                resizeMode="contain"
              />
            );
          })}
        </View>

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
    top: 40,
    left: SCREEN_WIDTH * 0.02,
    right: SCREEN_WIDTH * 0.02,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cloudHeader: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  farmName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    zIndex: 2,
  },
  sunContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.20,
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
    // Position relative to farmPlatform start + grass block offset
    top: SCREEN_HEIGHT * 0.28 + SCREEN_HEIGHT * 0.48 * 0.134,
    left: SCREEN_WIDTH * 0.08 + SCREEN_WIDTH * 0.84 * 0.065,
    // Size matches grass block bounds
    width: SCREEN_WIDTH * 0.84 * (0.933 - 0.065),
    height: SCREEN_HEIGHT * 0.48 * (0.782 - 0.134),
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
