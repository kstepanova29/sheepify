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
        <View style={styles.cloudHeader}>
          <Text style={styles.farmName}>{user?.username}'s farm</Text>
        </View>

        {/* Sun Icon - Below Header */}
        <View style={styles.sunContainer}>
          <Text style={styles.sun}>☀️</Text>
        </View>

        {/* 3D Farm Platform */}
        <View style={styles.farmPlatform}>
          {/* Grass Layer */}
          <View style={styles.grassLayer}>
            <Text style={styles.grassTexture}>🟩🟩🟩🟩🟩</Text>
          </View>

          {/* Sheep on Farm */}
          <View style={styles.sheepContainer}>
            {aliveSheep.map((sheep, index) => (
              <Image
                key={sheep.id}
                source={require('@/assets/sprites/sheep/default.png')}
                style={[
                  styles.sheepSprite,
                  {
                    left: 50 + (index * 40),
                    top: 20 + (index * 10),
                  },
                ]}
                resizeMode="contain"
              />
            ))}
          </View>

          {/* Platform Base */}
          <View style={styles.platformBase} />
        </View>

        {/* Trees/Decorations */}
        <Text style={styles.tree}>🌳</Text>
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

        {/* Log Sleep Button */}
        <TouchableOpacity
          style={styles.logSleepButton}
          onPress={() => router.push('/sleep-log')}
        >
          <Text style={styles.logSleepText}>💤 Log Sleep</Text>
        </TouchableOpacity>
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
  cloudHeader: {
    position: 'absolute',
    top: 60,
    left: SCREEN_WIDTH * 0.15,
    right: SCREEN_WIDTH * 0.15,
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 15,
    borderWidth: 3,
    borderColor: '#333',
    zIndex: 10,
    // Cloud shape via border radius
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  farmName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  sunContainer: {
    position: 'absolute',
    top: 100,
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
    top: SCREEN_HEIGHT * 0.35,
    left: SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_HEIGHT * 0.35,
    backgroundColor: '#8B4513',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#5D2E0C',
    // 3D effect
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 8,
  },
  grassLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: '#90EE90',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grassTexture: {
    fontSize: 12,
    opacity: 0.6,
  },
  sheepContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheepSprite: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  platformBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: '#654321',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  tree: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.25,
    right: 40,
    fontSize: 40,
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
    marginHorizontal: 30,
    marginTop: 30,
    padding: 20,
    backgroundColor: '#e94560',
    borderRadius: 16,
    alignItems: 'center',
  },
  logSleepText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});
