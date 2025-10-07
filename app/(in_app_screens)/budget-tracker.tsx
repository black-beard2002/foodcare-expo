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
  DollarSign,
  PieChart,
  HandCoins,
  Trash2,
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
    isOverBudget,
    clearBudgetData,
  } = useBudgetStore();
  const { showAlert } = useAlert();
  const [clearConfirmModal, setClearConfirmModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState('');

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

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
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
              Budget Tracker
            </Text>
            <Text
              className="text-sm mt-0.5"
              style={{ color: theme.textSecondary }}
            >
              Monitor your spending
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
              <View className="flex-row items-center gap-2 mb-4">
                <Wallet color={theme.primary} size={24} />
                <Text
                  className="text-lg font-bold"
                  style={{ color: theme.text }}
                >
                  Monthly Budget
                </Text>
              </View>

              {editingLimit ? (
                <View>
                  <TextInput
                    className="px-4 py-3 rounded-xl mb-3 text-lg"
                    style={{
                      backgroundColor: theme.inputBackground,
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
                      <Text className="text-white font-semibold">Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-xl items-center"
                      style={{ backgroundColor: theme.border }}
                      onPress={() => setEditingLimit(false)}
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
              ) : (
                <View>
                  {budgetData.monthly_limit ? (
                    <>
                      <View className="flex-row items-baseline gap-2 mb-2">
                        <Text
                          className="text-4xl font-bold"
                          style={{ color: theme.text }}
                        >
                          ${budgetData.current_month_spending.toFixed(2)}
                        </Text>
                        <Text
                          className="text-lg"
                          style={{ color: theme.textSecondary }}
                        >
                          / ${budgetData.monthly_limit.toFixed(2)}
                        </Text>
                      </View>

                      <View
                        className="h-3 rounded-full overflow-hidden mb-3"
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

                      {overBudget ? (
                        <View
                          className="flex-row items-center gap-2 p-3 rounded-xl mb-3"
                          style={{ backgroundColor: theme.error + '20' }}
                        >
                          <AlertTriangle color={theme.error} size={20} />
                          <Text
                            className="text-sm flex-1"
                            style={{ color: theme.error }}
                          >
                            You've exceeded your budget by $
                            {Math.abs(remaining).toFixed(2)}
                          </Text>
                        </View>
                      ) : (
                        <Text
                          className="text-sm mb-3"
                          style={{ color: theme.textSecondary }}
                        >
                          ${remaining.toFixed(2)} remaining this month
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text
                      className="text-sm mb-3"
                      style={{ color: theme.textSecondary }}
                    >
                      No budget limit set
                    </Text>
                  )}

                  <TouchableOpacity
                    className="py-3 rounded-xl items-center"
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
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-4">
                <PieChart color={theme.primary} size={20} />
                <Text
                  className="text-lg font-bold"
                  style={{ color: theme.text }}
                >
                  Spending by Category
                </Text>
              </View>

              {budgetData.spending_by_category.length > 0 ? (
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
                              className="font-semibold"
                              style={{ color: theme.text }}
                            >
                              {category.category}
                            </Text>
                            <Text
                              className="font-bold"
                              style={{ color: theme.primary }}
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
                            className="text-xs mt-1"
                            style={{ color: theme.textSecondary }}
                          >
                            {categoryPercentage.toFixed(1)}% of total spending
                          </Text>
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
                    style={{ color: theme.textSecondary }}
                  >
                    No spending data yet
                  </Text>
                </View>
              )}
            </View>
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-4">
                <TrendingUp color={theme.primary} size={20} />
                <Text
                  className="text-lg font-bold"
                  style={{ color: theme.text }}
                >
                  Spending History
                </Text>
              </View>

              {budgetData.spending_history.length > 0 ? (
                <View className="gap-3">
                  {budgetData.spending_history
                    .sort((a, b) => b.month.localeCompare(a.month))
                    .slice(0, 6)
                    .map((history) => (
                      <View
                        key={history.month}
                        className="flex-row items-center justify-between p-4 rounded-xl"
                        style={{ backgroundColor: theme.card }}
                      >
                        <Text
                          className="font-semibold"
                          style={{ color: theme.text }}
                        >
                          {new Date(history.month + '-01').toLocaleDateString(
                            'en-US',
                            {
                              month: 'long',
                              year: 'numeric',
                            }
                          )}
                        </Text>
                        <Text
                          className="font-bold"
                          style={{ color: theme.primary }}
                        >
                          ${history.amount.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                </View>
              ) : (
                <View
                  className="p-6 rounded-xl items-center"
                  style={{ backgroundColor: theme.card }}
                >
                  <Text
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    No history data yet
                  </Text>
                </View>
              )}
            </View>
            <View className="mb-5">
              <View className="flex-row items-center gap-2 mb-4">
                <HandCoins color={theme.primary} size={20} />
                <Text
                  className="text-lg font-bold"
                  style={{ color: theme.text }}
                >
                  Total Spending
                </Text>
              </View>
              <View>
                {/* Overall Spending Card */}
                {budgetData.overall_spending !== undefined ? (
                  <View
                    className="p-6 rounded-2xl items-center"
                    style={{ backgroundColor: theme.card }}
                  >
                    <HandCoins color={theme.primary} size={32} />
                    <Text
                      className="text-3xl font-bold mt-2"
                      style={{ color: theme.text }}
                    >
                      ${budgetData.overall_spending.toFixed(2)}
                    </Text>
                    <Text
                      className="text-sm mt-1"
                      style={{ color: theme.textSecondary }}
                    >
                      Overall spending to date
                    </Text>
                  </View>
                ) : (
                  <View
                    className="p-6 rounded-xl items-center"
                    style={{ backgroundColor: theme.card }}
                  >
                    <Text
                      className="text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      No overall spending data yet
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {/* clear budget data button*/}
            <TouchableOpacity
              className="py-3 rounded-xl items-center"
              style={{ backgroundColor: theme.error }}
              onPress={() => setClearConfirmModal(true)}
              disabled={clearConfirmModal}
            >
              <View className="flex-row items-center gap-2">
                <Trash2 color="white" size={20} className="mb-1" />
                <Text className="font-semibold" style={{ color: theme.text }}>
                  Clear Budget Data
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
      {clearConfirmModal && (
        <View
          className="absolute inset-0 bg-black/70 bg-opacity-50 items-center justify-center px-6"
          style={{ zIndex: 10 }}
        >
          <View
            className="w-full p-6 rounded-xl"
            style={{ backgroundColor: theme.card }}
          >
            <Text
              className="text-lg font-bold mb-4"
              style={{ color: theme.text }}
            >
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
