import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { LoyaltyProgram, Reward } from '@/types/appTypes';

const LOYALTY_STORAGE_KEY = '@loyalty_program_storage';
const REWARDS_STORAGE_KEY = '@rewards_storage';

const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000,
};

const POINTS_PER_DOLLAR = 10;

interface LoyaltyState {
  loyaltyProgram: LoyaltyProgram;
  availableRewards: Reward[];
  isLoading: boolean;

  loadLoyaltyData: () => Promise<void>;
  addPoints: (orderAmount: number) => Promise<void>;
  claimReward: (rewardId: string) => Promise<boolean>;
  calculateTierProgress: () => number;
  getNextTier: () => { tier: string; pointsNeeded: number } | null;
  getReferralBonus: () => Promise<void>;
}

export const useLoyaltyStore = create<LoyaltyState>((set, get) => ({
  loyaltyProgram: {
    points: 0,
    tier: 'bronze',
    points_to_next_tier: 500,
    total_spent: 0,
    rewards_earned: 0,
  },
  availableRewards: [],
  isLoading: false,

  loadLoyaltyData: async () => {
    try {
      set({ isLoading: true });
      const loyaltyData = await AsyncStorage.getItem(LOYALTY_STORAGE_KEY);
      const rewardsData = await AsyncStorage.getItem(REWARDS_STORAGE_KEY);

      if (loyaltyData) {
        set({ loyaltyProgram: JSON.parse(loyaltyData) });
      }

      if (rewardsData) {
        set({ availableRewards: JSON.parse(rewardsData) });
      } else {
        const { dummyRewards } = await import('@/data/dummyData');
        set({ availableRewards: dummyRewards });
        await AsyncStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(dummyRewards));
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Error loading loyalty data:', error);
      set({ isLoading: false });
    }
  },

  addPoints: async (orderAmount) => {
    const { loyaltyProgram } = get();
    const pointsEarned = Math.floor(orderAmount * POINTS_PER_DOLLAR);
    const newPoints = loyaltyProgram.points + pointsEarned;
    const newTotalSpent = loyaltyProgram.total_spent + orderAmount;

    let newTier = loyaltyProgram.tier;
    if (newPoints >= TIER_THRESHOLDS.platinum) {
      newTier = 'platinum';
    } else if (newPoints >= TIER_THRESHOLDS.gold) {
      newTier = 'gold';
    } else if (newPoints >= TIER_THRESHOLDS.silver) {
      newTier = 'silver';
    }

    const nextTierInfo = get().getNextTier();
    const pointsToNextTier = nextTierInfo ? nextTierInfo.pointsNeeded : 0;

    const updated: LoyaltyProgram = {
      ...loyaltyProgram,
      points: newPoints,
      tier: newTier,
      points_to_next_tier: pointsToNextTier,
      total_spent: newTotalSpent,
    };

    set({ loyaltyProgram: updated });

    try {
      await AsyncStorage.setItem(LOYALTY_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving loyalty data:', error);
    }
  },

  claimReward: async (rewardId) => {
    const { loyaltyProgram, availableRewards } = get();
    const reward = availableRewards.find((r) => r.id === rewardId);

    if (!reward) {
      return false;
    }

    if (reward.is_claimed) {
      return false;
    }

    if (loyaltyProgram.points < reward.points_required) {
      return false;
    }

    const newPoints = loyaltyProgram.points - reward.points_required;
    const updatedLoyalty: LoyaltyProgram = {
      ...loyaltyProgram,
      points: newPoints,
      rewards_earned: loyaltyProgram.rewards_earned + 1,
    };

    const updatedRewards = availableRewards.map((r) =>
      r.id === rewardId ? { ...r, is_claimed: true } : r
    );

    set({
      loyaltyProgram: updatedLoyalty,
      availableRewards: updatedRewards,
    });

    try {
      await AsyncStorage.setItem(LOYALTY_STORAGE_KEY, JSON.stringify(updatedLoyalty));
      await AsyncStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(updatedRewards));
    } catch (error) {
      console.error('Error claiming reward:', error);
    }

    return true;
  },

  calculateTierProgress: () => {
    const { loyaltyProgram } = get();
    const currentTierThreshold = TIER_THRESHOLDS[loyaltyProgram.tier];
    const nextTierInfo = get().getNextTier();

    if (!nextTierInfo) {
      return 100;
    }

    const nextTierThreshold =
      TIER_THRESHOLDS[nextTierInfo.tier as keyof typeof TIER_THRESHOLDS];
    const progress =
      ((loyaltyProgram.points - currentTierThreshold) /
        (nextTierThreshold - currentTierThreshold)) *
      100;

    return Math.min(Math.max(progress, 0), 100);
  },

  getNextTier: () => {
    const { loyaltyProgram } = get();
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(loyaltyProgram.tier);

    if (currentIndex === tiers.length - 1) {
      return null;
    }

    const nextTier = tiers[currentIndex + 1];
    const nextTierThreshold =
      TIER_THRESHOLDS[nextTier as keyof typeof TIER_THRESHOLDS];
    const pointsNeeded = nextTierThreshold - loyaltyProgram.points;

    return {
      tier: nextTier,
      pointsNeeded: Math.max(pointsNeeded, 0),
    };
  },

  getReferralBonus: async () => {
    const { loyaltyProgram } = get();
    const bonusPoints = 100;
    const updated: LoyaltyProgram = {
      ...loyaltyProgram,
      points: loyaltyProgram.points + bonusPoints,
    };

    set({ loyaltyProgram: updated });

    try {
      await AsyncStorage.setItem(LOYALTY_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding referral bonus:', error);
    }
  },
}));
