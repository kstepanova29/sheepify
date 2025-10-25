import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Sheep, SleepSession, User } from '../types/game';

interface GameState {
  user: User | null;
  sleepHistory: SleepSession[];
  activeSleepSession: {
    bedTime: Date;
    isActive: boolean;
  } | null;
  
  // Actions
  initializeUser: (username: string) => void;
  startSleep: () => void;
  endSleep: () => void;
  addSleepSession: (session: Omit<SleepSession, 'id'>) => void;
  addSheep: (sheep: Omit<Sheep, 'id'>) => void;
  addWool: (amount: number) => void;
  spendWool: (amount: number) => boolean;
  updateStreak: (isGoodNight: boolean) => void;
  applyLambChopPenalty: () => void;
  resetPenalty: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      user: null,
      sleepHistory: [],
      activeSleepSession: null,

      initializeUser: (username: string) => {
        // For testing: Initialize with 1 sheep
        const testSheep: Sheep = {
          id: 'test-sheep-1',
          name: 'Fluffy',
          earnedDate: new Date(),
          woolProduction: 1,
          isAlive: true,
        };

        set({
          user: {
            id: Date.now().toString(),
            username,
            sheep: [testSheep],
            woolBlocks: 5,
            shepherdTokens: 0,
            prankTokens: 0,
            streak: 1,
            totalSheepEarned: 1,
            lastSleepDate: null,
            penalties: {
              lambChopWarning: 0,
              isInPenalty: false,
            },
          },
        });
      },

      startSleep: () => {
        const now = new Date();
        set({
          activeSleepSession: {
            bedTime: now,
            isActive: true,
          },
        });
      },

      endSleep: () => {
        const { activeSleepSession } = get();
        if (!activeSleepSession || !activeSleepSession.isActive) return;

        const wakeTime = new Date();
        const bedTime = new Date(activeSleepSession.bedTime);
        const duration = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60 * 60);

        // Add the completed sleep session
        get().addSleepSession({
          date: new Date(),
          bedTime,
          wakeTime,
          duration,
          quality: duration < 6 ? 'poor' : duration < 8 ? 'good' : 'perfect',
        });

        // Clear active session
        set({ activeSleepSession: null });
      },

      addSleepSession: (session) => {
        const newSession: SleepSession = {
          ...session,
          id: Date.now().toString(),
        };

        const { user } = get();
        if (!user) return;

        // Determine sleep quality
        let quality: 'poor' | 'good' | 'perfect';
        if (session.duration < 6) quality = 'poor';
        else if (session.duration < 8) quality = 'good';
        else quality = 'perfect';

        newSession.quality = quality;

        set((state) => ({
          sleepHistory: [newSession, ...state.sleepHistory],
        }));

        // Update streak and penalties
        if (quality === 'poor') {
          get().updateStreak(false);
        } else {
          get().updateStreak(true);
          
          // Earn sheep for good sleep (8-10 hours)
          if (quality === 'perfect') {
            const newSheep: Omit<Sheep, 'id'> = {
              name: `Sheep #${user.totalSheepEarned + 1}`,
              earnedDate: new Date(),
              woolProduction: 1,
              isAlive: true,
            };
            get().addSheep(newSheep);
          }
        }

        // Update last sleep date
        set((state) => ({
          user: state.user ? { ...state.user, lastSleepDate: new Date() } : null,
        }));
      },

      addSheep: (sheep) => {
        const newSheep: Sheep = {
          ...sheep,
          id: Date.now().toString(),
        };

        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                sheep: [...state.user.sheep, newSheep],
                totalSheepEarned: state.user.totalSheepEarned + 1,
              }
            : null,
        }));
      },

      addWool: (amount) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, woolBlocks: state.user.woolBlocks + amount }
            : null,
        }));
      },

      spendWool: (amount) => {
        const { user } = get();
        if (!user || user.woolBlocks < amount) return false;

        set((state) => ({
          user: state.user
            ? { ...state.user, woolBlocks: state.user.woolBlocks - amount }
            : null,
        }));
        return true;
      },

      updateStreak: (isGoodNight) => {
        set((state) => {
          if (!state.user) return state;

          if (isGoodNight) {
            // Good night: increment streak, reduce penalty warning
            const newStreak = state.user.streak + 1;
            const newPenaltyWarning = Math.max(0, state.user.penalties.lambChopWarning - 1);

            // Award Shepherd Token every 10 perfect nights
            const newShepherdTokens =
              newStreak % 10 === 0
                ? state.user.shepherdTokens + 1
                : state.user.shepherdTokens;

            return {
              user: {
                ...state.user,
                streak: newStreak,
                shepherdTokens: newShepherdTokens,
                penalties: {
                  ...state.user.penalties,
                  lambChopWarning: newPenaltyWarning,
                  isInPenalty: newPenaltyWarning >= 3,
                },
              },
            };
          } else {
            // Bad night: reset streak, increment penalty
            const newPenaltyWarning = state.user.penalties.lambChopWarning + 1;

            // Trigger Lamb Chop penalty if 3 bad nights
            if (newPenaltyWarning >= 3) {
              setTimeout(() => get().applyLambChopPenalty(), 0);
            }

            return {
              user: {
                ...state.user,
                streak: 0,
                penalties: {
                  ...state.user.penalties,
                  lambChopWarning: newPenaltyWarning,
                  isInPenalty: newPenaltyWarning >= 3,
                },
              },
            };
          }
        });
      },

      applyLambChopPenalty: () => {
        set((state) => {
          if (!state.user || state.user.sheep.length === 0) return state;

          // Remove one sheep
          const updatedSheep = [...state.user.sheep];
          updatedSheep[0].isAlive = false;

          return {
            user: {
              ...state.user,
              sheep: updatedSheep,
            },
          };
        });
      },

      resetPenalty: () => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                penalties: {
                  lambChopWarning: 0,
                  isInPenalty: false,
                },
              }
            : null,
        }));
      },
    }),
    {
      name: 'sheepify-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        sleepHistory: state.sleepHistory,
        activeSleepSession: state.activeSleepSession,
      }),
    }
  )
);