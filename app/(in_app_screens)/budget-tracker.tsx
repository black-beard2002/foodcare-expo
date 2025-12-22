import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  AlertTriangle,
  PieChart,
  HandCoins,
  Trash2,
  PiggyBank,
  TrendingDown,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useBudgetStore } from '@/stores/budgetStore';
import { useAlert } from '@/providers/AlertProvider';

export default function BudgetTrackerScreen() {
  const { theme } = useTheme();
  const {
    budgetData,
    loadBudgetData,
    setMonthlyLimit,
    getRemainingBudget,
    getSpendingPercentage,
    getTotalSavings,
    getSavingsPercentage,
    isOverBudget,
    clearBudgetData,
  } = useBudgetStore();
  const { showAlert } = useAlert();
  const [clearConfirmModal, setClearConfirmModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState('');
  const [showSavings, setShowSavings] = useState(false);
  const [showSpendings, setShowSpendings] = useState(true);

  useEffect(() => {
    loadBudgetData();
  }, []);

  useEffect(() => {
    if (budgetData.monthly_limit) {
      setLimitInput(budgetData.monthly_limit.toString());
    }
  }, [budgetData.monthly_limit]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBudgetData();
    setRefreshing(false);
  };

  const handleClearConfirm = () => {
    clearBudgetData();
    setClearConfirmModal(false);
    showAlert(
      'Budget Data Cleared',
      'All budget data has been reset.',
      'success'
    );
  };

  const handleSaveLimit = async () => {
    const limit = parseFloat(limitInput);
    if (isNaN(limit) || limit <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid budget limit', 'error');
      return;
    }
    await setMonthlyLimit(limit);
    setEditingLimit(false);
    showAlert(
      'Budget Updated',
      `Monthly budget set to $${limit.toFixed(2)}`,
      'success'
    );
  };

  const remaining = getRemainingBudget();
  const percentage = getSpendingPercentage();
  const overBudget = isOverBudget();
  const totalSavings = getTotalSavings();
  const savingsPercentage = getSavingsPercentage();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <LinearGradient
        colors={[theme.background, theme.backgroundSecondary]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          paddingTop: 40,
        }}
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
            <Text
              className="text-2xl "
              style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
            >
              Budget Tracker
            </Text>
            <Text
              className="text-sm mt-0.5"
              style={{
                color: theme.textSecondary,
                fontFamily: 'PoppinsMedium',
              }}
            >
              Track your spending & savings from discounts
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
            {/* Budget Overview Card */}
            <View
              className="rounded-2xl p-6 mb-6"
              style={{ backgroundColor: theme.card }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <Wallet color={theme.primary} size={24} />
                  <Text
                    className="text-lg"
                    style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
                  >
                    Monthly Overview
                  </Text>
                </View>

                {/* Savings Indicator */}
                {totalSavings > 0 && (
                  <View
                    className="flex-row items-center gap-1 px-3 py-1 rounded-full"
                    style={{ backgroundColor: theme.success + '20' }}
                  >
                    <PiggyBank color={theme.success} size={16} />
                    <Text
                      style={{
                        color: theme.success,
                        fontFamily: 'PoppinsMedium',
                        fontSize: 12,
                      }}
                    >
                      Saved ${totalSavings.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              {editingLimit ? (
                <View>
                  <TextInput
                    className="px-4 py-3 rounded-xl mb-3 text-lg"
                    style={{
                      backgroundColor: theme.inputBackground,
                      fontFamily: 'PoppinsMedium',
                      color: theme.text,
                      borderWidth: 1,
                      borderColor: theme.inputBorder,
                    }}
                    placeholder="Enter budget limit"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="decimal-pad"
                    value={limitInput}
                    onChangeText={setLimitInput}
                  />
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-xl items-center"
                      style={{ backgroundColor: theme.primary }}
                      onPress={handleSaveLimit}
                    >
                      <Text
                        className="text-white"
                        style={{ fontFamily: 'FredokaMedium' }}
                      >
                        Save
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-xl items-center"
                      style={{ backgroundColor: theme.border }}
                      onPress={() => setEditingLimit(false)}
                    >
                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontFamily: 'FredokaMedium',
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  {budgetData.monthly_limit ? (
                    <>
                      {/* Spending vs Limit */}
                      <View className="mb-4">
                        <Text
                          className="text-sm mb-2"
                          style={{
                            color: theme.textSecondary,
                            fontFamily: 'PoppinsMedium',
                          }}
                        >
                          Budget Progress
                        </Text>
                        <View className="flex-row items-baseline gap-2 mb-2">
                          <Text
                            className="text-3xl"
                            style={{
                              color: theme.text,
                              fontFamily: 'PoppinsMedium',
                            }}
                          >
                            ${budgetData.current_month_spending.toFixed(2)}
                          </Text>
                          <Text
                            className="text-lg"
                            style={{
                              color: theme.textSecondary,
                              fontFamily: 'PoppinsMedium',
                            }}
                          >
                            / ${budgetData.monthly_limit.toFixed(2)}
                          </Text>
                        </View>

                        {/* Progress Bar */}
                        <View
                          className="h-3 rounded-full overflow-hidden mb-2"
                          style={{ backgroundColor: theme.border }}
                        >
                          <View
                            className="h-full"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: overBudget
                                ? theme.error
                                : percentage > 80
                                ? theme.warning
                                : theme.success,
                            }}
                          />
                        </View>

                        <Text
                          className="text-sm"
                          style={{
                            color: theme.textSecondary,
                            fontFamily: 'PoppinsMedium',
                          }}
                        >
                          {overBudget
                            ? `Exceeded by $${Math.abs(remaining).toFixed(2)}`
                            : `$${remaining.toFixed(2)} remaining`}
                        </Text>
                      </View>

                      {/* Savings Section */}
                      <View
                        className="mt-4 pt-4 border-t"
                        style={{ borderTopColor: theme.border }}
                      >
                        <Text
                          className="text-sm mb-2"
                          style={{
                            color: theme.textSecondary,
                            fontFamily: 'PoppinsMedium',
                          }}
                        >
                          Savings from Discounts
                        </Text>
                        <View className="flex-row items-baseline gap-2 mb-2">
                          <Text
                            className="text-3xl"
                            style={{
                              color: theme.success,
                              fontFamily: 'PoppinsMedium',
                            }}
                          >
                            ${totalSavings.toFixed(2)}
                          </Text>
                          <Text
                            className="text-sm"
                            style={{
                              color: theme.textSecondary,
                              fontFamily: 'PoppinsMedium',
                            }}
                          >
                            saved this month
                          </Text>
                        </View>

                        {/* Savings Percentage Bar */}
                        <View
                          className="h-2 rounded-full overflow-hidden mb-2"
                          style={{ backgroundColor: theme.border }}
                        >
                          <View
                            className="h-full"
                            style={{
                              width: `${Math.min(savingsPercentage, 100)}%`,
                              backgroundColor: theme.success,
                            }}
                          />
                        </View>

                        <Text
                          className="text-sm"
                          style={{
                            color: theme.textSecondary,
                            fontFamily: 'PoppinsMedium',
                          }}
                        >
                          {savingsPercentage.toFixed(1)}% of your spending came
                          from discounts
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text
                      className="text-sm mb-3"
                      style={{
                        color: theme.textSecondary,
                        fontFamily: 'PoppinsMedium',
                      }}
                    >
                      No budget limit set
                    </Text>
                  )}

                  <TouchableOpacity
                    className="py-3 rounded-xl items-center mt-4"
                    style={{ backgroundColor: theme.primary }}
                    onPress={() => setEditingLimit(true)}
                  >
                    <Text className="text-white font-semibold">
                      {budgetData.monthly_limit
                        ? 'Update Budget'
                        : 'Set Budget Limit'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Savings/Spendings by Category */}
            <View className="mb-5">
              <View>
                <View className="flex-row items-center gap-2 mb-2">
                  <PieChart color={theme.primary} size={20} />
                  <Text
                    className="text-lg"
                    style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
                  >
                    Savings/Spendings by Category
                  </Text>
                </View>

                {/* Toggle Buttons */}
                <View
                  style={{
                    backgroundColor: theme.card,
                    width: 164,
                    borderRadius: 10,
                  }}
                  className="flex-row rounded-lg p-1 mb-2"
                >
                  <TouchableOpacity
                    className="px-3 py-1 rounded "
                    style={{
                      backgroundColor: showSpendings
                        ? theme.backgroundSecondary
                        : 'transparent',
                    }}
                    onPress={() => {
                      setShowSpendings(true);
                      setShowSavings(false);
                    }}
                  >
                    <Text
                      style={{
                        color: showSpendings
                          ? theme.primary
                          : theme.textSecondary,
                        fontFamily: 'PoppinsMedium',
                        fontSize: 12,
                      }}
                    >
                      Spendings
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-3 py-1 rounded "
                    style={{
                      backgroundColor: showSavings
                        ? theme.backgroundSecondary
                        : 'transparent',
                    }}
                    onPress={() => {
                      setShowSavings(true);
                      setShowSpendings(false);
                    }}
                  >
                    <Text
                      style={{
                        color: showSavings
                          ? theme.success
                          : theme.textSecondary,
                        fontFamily: 'PoppinsMedium',
                        fontSize: 12,
                      }}
                    >
                      Savings
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Show Spending by Category */}
              {showSpendings && budgetData.spending_by_category.length > 0 ? (
                <View className="gap-3 mb-6">
                  {budgetData.spending_by_category
                    .sort((a, b) => b.amount - a.amount)
                    .map((category) => {
                      const categoryPercentage =
                        (category.amount / budgetData.current_month_spending) *
                        100;
                      return (
                        <View
                          key={category.category}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: theme.card }}
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            <Text
                              style={{
                                color: theme.text,
                                fontFamily: 'FredokaMedium',
                              }}
                            >
                              {category.category}
                            </Text>
                            <Text
                              style={{
                                color: theme.primary,
                                fontFamily: 'PoppinsMedium',
                              }}
                            >
                              ${category.amount.toFixed(2)}
                            </Text>
                          </View>
                          <View
                            className="h-2 rounded-full overflow-hidden"
                            style={{ backgroundColor: theme.border }}
                          >
                            <View
                              className="h-full rounded-full"
                              style={{
                                width: `${categoryPercentage}%`,
                                backgroundColor: theme.primary,
                              }}
                            />
                          </View>
                          <Text
                            className="text-xs mt-2"
                            style={{
                              color: theme.textSecondary,
                              fontFamily: 'PoppinsMedium',
                            }}
                          >
                            {categoryPercentage.toFixed(1)}% of total spending
                          </Text>
                        </View>
                      );
                    })}
                </View>
              ) : (
                showSpendings && (
                  <View
                    className="p-6 rounded-xl items-center"
                    style={{ backgroundColor: theme.card }}
                  >
                    <Text
                      className="text-sm"
                      style={{
                        color: theme.textSecondary,
                        fontFamily: 'FredokaMedium',
                      }}
                    >
                      No spending data yet
                    </Text>
                  </View>
                )
              )}

              {/* Show Savings by Category */}
              {showSavings && budgetData.savings_by_category.length > 0 ? (
                <View className="gap-3 mb-6">
                  {budgetData.savings_by_category
                    .sort((a, b) => b.amount - a.amount)
                    .map((category) => {
                      const categoryPercentage =
                        (category.amount / totalSavings) * 100;
                      return (
                        <View
                          key={category.category}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: theme.card }}
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            <Text
                              style={{
                                color: theme.text,
                                fontFamily: 'FredokaMedium',
                              }}
                            >
                              {category.category}
                            </Text>
                            <Text
                              style={{
                                color: theme.success,
                                fontFamily: 'PoppinsMedium',
                              }}
                            >
                              Saved ${category.amount.toFixed(2)}
                            </Text>
                          </View>
                          <View
                            className="h-2 rounded-full overflow-hidden"
                            style={{ backgroundColor: theme.border }}
                          >
                            <View
                              className="h-full rounded-full"
                              style={{
                                width: `${categoryPercentage}%`,
                                backgroundColor: theme.success,
                              }}
                            />
                          </View>
                          <Text
                            className="text-xs mt-2"
                            style={{
                              color: theme.textSecondary,
                              fontFamily: 'PoppinsMedium',
                            }}
                          >
                            {categoryPercentage.toFixed(1)}% of total savings
                          </Text>
                        </View>
                      );
                    })}
                </View>
              ) : (
                showSavings && (
                  <View
                    className="p-6 rounded-xl items-center"
                    style={{ backgroundColor: theme.card }}
                  >
                    <Text
                      className="text-sm"
                      style={{
                        color: theme.textSecondary,
                        fontFamily: 'FredokaMedium',
                      }}
                    >
                      No savings data yet
                    </Text>
                  </View>
                )
              )}
            </View>

            {/* Combined History */}
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-4">
                <TrendingUp color={theme.primary} size={20} />
                <Text
                  className="text-lg"
                  style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
                >
                  Monthly History
                </Text>
              </View>

              {budgetData.spending_history.length > 0 ||
              budgetData.savings_history.length > 0 ? (
                <View className="gap-3">
                  {/* Get unique months from both histories */}
                  {Array.from(
                    new Set([
                      ...budgetData.spending_history.map((h) => h.month),
                      ...budgetData.savings_history.map((h) => h.month),
                    ])
                  )
                    .sort((a, b) => b.localeCompare(a))
                    .slice(0, 6)
                    .map((month) => {
                      const spending =
                        budgetData.spending_history.find(
                          (h) => h.month === month
                        )?.amount || 0;
                      const savings =
                        budgetData.savings_history.find(
                          (h) => h.month === month
                        )?.amount || 0;

                      return (
                        <View
                          key={month}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: theme.card }}
                        >
                          <Text
                            className="mb-2"
                            style={{
                              color: theme.text,
                              fontFamily: 'FredokaMedium',
                            }}
                          >
                            {new Date(month + '-01').toLocaleDateString(
                              'en-US',
                              {
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </Text>

                          <View className="flex-row justify-between items-center">
                            <View>
                              <Text
                                className="text-xs"
                                style={{
                                  color: theme.textSecondary,
                                  fontFamily: 'PoppinsMedium',
                                }}
                              >
                                Spent
                              </Text>
                              <Text
                                style={{
                                  color: theme.primary,
                                  fontFamily: 'PoppinsMedium',
                                }}
                              >
                                ${spending.toFixed(2)}
                              </Text>
                            </View>

                            <View className="items-end">
                              <Text
                                className="text-xs"
                                style={{
                                  color: theme.textSecondary,
                                  fontFamily: 'PoppinsMedium',
                                }}
                              >
                                Saved
                              </Text>
                              <Text
                                style={{
                                  color: theme.success,
                                  fontFamily: 'PoppinsMedium',
                                }}
                              >
                                ${savings.toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                </View>
              ) : (
                <View
                  className="p-6 rounded-xl items-center"
                  style={{ backgroundColor: theme.card }}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: theme.textSecondary,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    No history data yet
                  </Text>
                </View>
              )}
            </View>

            {/* Total Summary */}
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-4">
                <HandCoins color={theme.primary} size={20} />
                <Text
                  className="text-lg"
                  style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
                >
                  Total Summary
                </Text>
              </View>

              <View className="flex-row gap-3">
                {/* Overall Spending Card */}
                <View className="flex-1">
                  <View
                    className="p-4 rounded-2xl items-center"
                    style={{ backgroundColor: theme.card }}
                  >
                    <HandCoins color={theme.primary} size={24} />
                    <Text
                      className="text-xl mt-2"
                      style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
                    >
                      ${budgetData.overall_spending.toFixed(2)}
                    </Text>
                    <Text
                      className="text-xs mt-1 text-center"
                      style={{
                        color: theme.textSecondary,
                        fontFamily: 'PoppinsMedium',
                      }}
                    >
                      Total spent
                    </Text>
                  </View>
                </View>

                {/* Overall Savings Card */}
                <View className="flex-1">
                  <View
                    className="p-4 rounded-2xl items-center"
                    style={{ backgroundColor: theme.card }}
                  >
                    <PiggyBank color={theme.success} size={24} />
                    <Text
                      className="text-xl mt-2"
                      style={{
                        color: theme.success,
                        fontFamily: 'PoppinsMedium',
                      }}
                    >
                      ${budgetData.overall_savings.toFixed(2)}
                    </Text>
                    <Text
                      className="text-xs mt-1 text-center"
                      style={{
                        color: theme.textSecondary,
                        fontFamily: 'PoppinsMedium',
                      }}
                    >
                      Total saved
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Clear budget data button */}
            <TouchableOpacity
              className="py-3 rounded-xl items-center"
              style={{ backgroundColor: theme.error }}
              onPress={() => setClearConfirmModal(true)}
              disabled={clearConfirmModal}
            >
              <View className="flex-row items-center gap-2">
                <Trash2 color="white" size={20} className="mb-1" />
                <Text
                  style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
                >
                  Clear Budget Data
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Clear Confirmation Modal */}
      {clearConfirmModal && (
        <View
          className="absolute inset-0 bg-black/70 bg-opacity-50 items-center justify-center px-6"
          style={{ zIndex: 10 }}
        >
          <View
            className="w-full p-6 rounded-xl"
            style={{ backgroundColor: theme.card }}
          >
            <Text className="text-lg  mb-4" style={{ color: theme.text }}>
              Confirm Clear Data
            </Text>
            <Text
              className="text-sm mb-6"
              style={{ color: theme.textSecondary }}
            >
              Are you sure you want to clear all budget data? This action cannot
              be undone.
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: theme.error }}
                onPress={handleClearConfirm}
              >
                <Text className="text-white font-semibold">Clear Data</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: theme.border }}
                onPress={() => setClearConfirmModal(false)}
              >
                <Text
                  style={{ color: theme.textSecondary }}
                  className="font-semibold"
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
