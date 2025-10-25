// Game balance and feature rules for Sheepify

export const GAME_RULES = {
  // Sleep Requirements
  SLEEP: {
    POOR_THRESHOLD: 6, // hours - below this is poor sleep
    GOOD_THRESHOLD: 8, // hours - 6-8 is good, 8-10 is perfect
    PERFECT_MAX: 10, // hours - above this is too much
    SHEEP_EARN_MIN: 8, // minimum hours to earn sheep
    SHEEP_EARN_MAX: 10, // maximum hours to earn sheep
  },

  // Streaks & Rewards
  STREAKS: {
    SHEPHERD_TOKEN_REQUIREMENT: 10, // perfect nights needed for 1 token
    PRANK_UNLOCK_STREAK: 3, // minimum streak to unlock pranking
  },

  // Penalties
  PENALTIES: {
    BAD_NIGHTS_FOR_LAMB_CHOP: 3, // consecutive bad nights before losing sheep
    LAMB_CHOP_REVIVAL_NIGHTS: 2, // good nights needed to revive sheep
    PENALTY_ICON_DURATION: 24, // hours to show 🍳 icon
  },

  // Prank System (Baa-larm Attack)
  PRANKS: {
    WOOL_COST: 10, // wool blocks to send prank
    TOKEN_COST: 1, // or 1 prank token
    TARGET_BAD_NIGHTS: 2, // friend must have 2 bad nights to be prankable
    TYPES: [
      { id: 'screaming-sheep', name: 'Screaming Sheep', unlockStreak: 3 },
      { id: 'distorted-meme', name: 'Distorted Meme', unlockStreak: 5 },
      { id: 'airhorn-blast', name: 'Airhorn Blast', unlockStreak: 7 },
      { id: 'baby-crying', name: 'Baby Crying', unlockStreak: 10 },
    ],
  },

  // Woolwave Studio
  WOOLWAVE: {
    SOUND_PACKS: [
      { id: 'peaceful-pasture', name: 'Peaceful Pasture', unlockStreak: 0 },
      { id: 'meme-meadow', name: 'Meme Meadow', unlockStreak: 5 },
      { id: 'zen-garden', name: 'Zen Garden', unlockStreak: 10 },
      { id: 'chaos-farm', name: 'Chaos Farm', unlockStreak: 15 },
    ],
    SHEEP_OUTFITS: [
      { id: 'default', name: 'Classic Sheep', woolCost: 0 },
      { id: 'cowboy', name: 'Cowboy Hat', woolCost: 50 },
      { id: 'crown', name: 'Golden Crown', woolCost: 100 },
      { id: 'glasses', name: 'Cool Glasses', woolCost: 75 },
      { id: 'bowtie', name: 'Fancy Bowtie', woolCost: 60 },
    ],
    CUSTOM_MESSAGES: [
      { id: 'flirty', text: 'Sleep tight, cutie 😘', unlockStreak: 3 },
      { id: 'savage', text: 'Go sleep ho 💀', unlockStreak: 5 },
      { id: 'motivational', text: 'You got this, champ! 💪', unlockStreak: 0 },
      { id: 'chaotic', text: 'The sheep demand rest 🐑🔫', unlockStreak: 7 },
    ],
  },

  // Shepherd Tokens
  SHEPHERD_TOKENS: {
    STEAL_PERCENTAGE_SHEEP: 0.1, // can steal 10% of friend's sheep
    STEAL_PERCENTAGE_WOOL: 0.1, // can steal 10% of friend's wool
  },

  // Sleep Wars
  SLEEP_WARS: {
    DURATION_DAYS: 7, // weekly competitions
    WINNER_WOOL_STEAL: 0.05, // can shear 5% of someone's wool
    BADGES: [
      { id: 'golden-fleece', name: 'Golden Fleece', requirement: 'win_war' },
      { id: 'sleep-champion', name: 'Sleep Champion', requirement: '3_wins' },
      { id: 'night-owl', name: 'Night Owl', requirement: '10_perfect_nights' },
    ],
  },

  // Dream Mode (Easter Egg)
  DREAMS: {
    TRIGGER_CHANCE: 0.3, // 30% chance to get dream snippet
    SNIPPETS: [
      'You chased a golden sheep into a cotton candy void',
      'Your sheep started a revolution and crowned you their king',
      'You found a wool block the size of a house',
      'All your sheep learned to fly and took you to the clouds',
      'You were running through a field of infinite pillows',
      'A sheep whispered the secrets of the universe to you',
      'You discovered your sheep could talk and they were British',
      'You turned into a sheep and nobody noticed',
    ],
  },

  // Wool Production
  WOOL: {
    BASE_PRODUCTION: 1, // wool per sheep per day
    COLLECTION_INTERVAL: 24, // hours between collections
  },
};

export default GAME_RULES;
