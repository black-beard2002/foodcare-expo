import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Gift,
  Award,
  TrendingUp,
  Star,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLoyaltyStore } from '@/stores/loyaltyStore';
import { useAlert } from '@/providers/AlertProvider';

export default function RewardsScreen() {
  const { theme } = useTheme();
  const {
    loyaltyProgram,
    availableRewards,
    loadLoyaltyData,
    claimReward,
    calculateTierProgress,
    getNextTier,
  } = useLoyaltyStore();
  const { showAlert } = useAlert();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoyaltyData();
    setRefreshing(false);
  };

  const handleClaimReward = async (rewardId: string, rewardTitle: string) => {
    const success = await claimReward(rewardId);
    if (success) {
      showAlert('Reward Claimed!', `${rewardTitle} has been added to your account`, 'success');
    } else {
      showAlert('Cannot Claim', 'Not enough points or reward already claimed', 'error');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return theme.primary;
    }
  };

  const getTierIcon = (tier: string) => {
    return <Award color={getTierColor(tier)} size={24} fill={getTierColor(tier)} />;
  };

  const nextTier = getNextTier();
  const tierProgress = calculateTierProgress();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <LinearGradient
        colors={[theme.background, theme.backgroundSecondary]}
        className="flex-1"
      >
        <View
          className="flex-row items-center px-6 py-4 border-b"
          style={{ borderBottomColor: theme.border }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: theme.card }}
          >
            <ArrowLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Loyalty Rewards
            </Text>
            <Text className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>
              Earn points with every order
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        >
          <View className="px-6 py-6">
            <View
              className="rounded-2xl p-6 mb-6"
              style={{ backgroundColor: theme.card }}
            >
              <LinearGradient
                colors={[getTierColor(loyaltyProgram.tier) + '20', 'transparent']}
                className="absolute inset-0 rounded-2xl"
              />
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  {getTierIcon(loyaltyProgram.tier)}
                  <View>
                    <Text className="text-lg font-bold capitalize" style={{ color: theme.text }}>
                      {loyaltyProgram.tier} Member
                    </Text>
                    <Text className="text-sm" style={{ color: theme.textSecondary }}>
                      {loyaltyProgram.points} points
                    </Text>
                  </View>
                </View>
                <View
                  className="px-4 py-2 rounded-xl"
                  style={{ backgroundColor: theme.primary + '20' }}
                >
                  <Text className="text-2xl font-bold" style={{ color: theme.primary }}>
                    {loyaltyProgram.points}
                  </Text>
                </View>
              </View>

              {nextTier && (
                <View>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm" style={{ color: theme.textSecondary }}>
                      Progress to {nextTier.tier}
                    </Text>
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      {nextTier.pointsNeeded} points needed
                    </Text>
                  </View>
                  <View
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: theme.border }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${tierProgress}%`,
                        backgroundColor: getTierColor(nextTier.tier),
                      }}
                    />
                  </View>
                </View>
              )}

              <View className="flex-row items-center gap-4 mt-4 pt-4 border-t" style={{ borderTopColor: theme.border }}>
                <View className="flex-1">
                  <Text className="text-xs" style={{ color: theme.textSecondary }}>
                    Total Spent
                  </Text>
                  <Text className="text-lg font-bold" style={{ color: theme.text }}>
                    ${loyaltyProgram.total_spent.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs" style={{ color: theme.textSecondary }}>
                    Rewards Earned
                  </Text>
                  <Text className="text-lg font-bold" style={{ color: theme.text }}>
                    {loyaltyProgram.rewards_earned}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center gap-2 mb-4">
              <Sparkles color={theme.primary} size={20} />
              <Text className="text-lg font-bold" style={{ color: theme.text }}>
                Available Rewards
              </Text>
            </View>

            <View className="gap-4">
              {availableRewards.map((reward) => {
                const canClaim =
                  !reward.is_claimed && loyaltyProgram.points >= reward.points_required;
                const isLocked = loyaltyProgram.points < reward.points_required;

                return (
                  <View
                    key={reward.id}
                    className="rounded-2xl p-5 border-2"
                    style={{
                      backgroundColor: theme.card,
                      borderColor: canClaim ? theme.success : theme.border,
                      opacity: reward.is_claimed ? 0.5 : 1,
                    }}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center gap-2 mb-2">
                          <View
                            className="w-10 h-10 rounded-xl items-center justify-center"
                            style={{ backgroundColor: theme.warning + '20' }}
                          >
                            <Gift color={theme.warning} size={20} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg font-bold" style={{ color: theme.text }}>
                              {reward.title}
                            </Text>
                            <Text className="text-xs" style={{ color: theme.textSecondary }}>
                              {reward.points_required} points
                            </Text>
                          </View>
                        </View>
                        <Text
                          className="text-sm leading-5"
                          style={{ color: theme.textSecondary }}
                        >
                          {reward.description}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      className="py-3 rounded-xl items-center"
                      style={{
                        backgroundColor: reward.is_claimed
                          ? theme.border
                          : canClaim
                            ? theme.success
                            : theme.border,
                      }}
                      onPress={() => handleClaimReward(reward.id, reward.title)}
                      disabled={reward.is_claimed || isLocked}
                    >
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: reward.is_claimed || isLocked ? theme.textSecondary : '#fff' }}
                      >
                        {reward.is_claimed
                          ? 'Claimed'
                          : canClaim
                            ? 'Claim Reward'
                            : `Need ${reward.points_required - loyaltyProgram.points} more points`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
