import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { BudgetTracker } from '@/types/appTypes';

const BUDGET_STORAGE_KEY = '@budget_tracker_storage';

interface BudgetState {
  budgetData: BudgetTracker;
  isLoading: boolean;
  loadBudgetData: () => Promise<void>;
  setMonthlyLimit: (limit: number) => Promise<void>;
  addExpense: (
    category: string,
    originalAmount: number,
    discountedAmount?: number
  ) => Promise<void>;
  addSavings: (category: string, amount: number) => Promise<void>;
  isOverBudget: () => boolean;
  getRemainingBudget: () => number;
  getSpendingPercentage: () => number;
  getTotalSavings: () => number;
  getSavingsPercentage: () => number;
  clearBudgetData: () => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgetData: {
    monthly_limit: undefined,
    current_month_spending: 0,
    current_month_savings: 0,
    overall_spending: 0,
    overall_savings: 0,
    spending_by_category: [],
    savings_by_category: [],
    spending_history: [],
    savings_history: [],
  },
  isLoading: false,

  loadBudgetData: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Handle migration of old data
        set({
          budgetData: {
            ...get().budgetData,
            ...parsed,
            current_month_savings: parsed.current_month_savings || 0,
            overall_savings: parsed.overall_savings || 0,
            savings_by_category: parsed.savings_by_category || [],
            savings_history: parsed.savings_history || [],
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
      set({ isLoading: false });
    }
  },

  clearBudgetData: async () => {
    try {
      await AsyncStorage.removeItem(BUDGET_STORAGE_KEY);
      set({
        budgetData: {
          monthly_limit: undefined,
          current_month_spending: 0,
          current_month_savings: 0,
          overall_spending: 0,
          overall_savings: 0,
          spending_by_category: [],
          savings_by_category: [],
          spending_history: [],
          savings_history: [],
        },
      });
    } catch (error) {
      console.error('Error clearing budget data:', error);
    }
  },

  setMonthlyLimit: async (limit) => {
    const { budgetData } = get();
    const updated = { ...budgetData, monthly_limit: limit };
    set({ budgetData: updated });

    try {
      await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error setting monthly limit:', error);
    }
  },

  addExpense: async (category, originalAmount, discountedAmount) => {
    const { budgetData } = get();
    const spentAmount = discountedAmount || originalAmount;
    const savings = discountedAmount ? originalAmount - discountedAmount : 0;

    const newSpending = budgetData.current_month_spending + spentAmount;
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Update spending by category
    const spendingCategoryIndex = budgetData.spending_by_category.findIndex(
      (c) => c.category === category
    );

    let updatedSpendingCategories = [...budgetData.spending_by_category];
    if (spendingCategoryIndex >= 0) {
      updatedSpendingCategories[spendingCategoryIndex].amount += spentAmount;
    } else {
      updatedSpendingCategories.push({ category, amount: spentAmount });
    }

    // Update spending history
    let updatedSpendingHistory = [...budgetData.spending_history];
    const spendingHistoryIndex = updatedSpendingHistory.findIndex(
      (h) => h.month === currentMonth
    );

    if (spendingHistoryIndex >= 0) {
      updatedSpendingHistory[spendingHistoryIndex].amount += spentAmount;
    } else {
      updatedSpendingHistory.push({ month: currentMonth, amount: spentAmount });
    }

    // Prepare updated object with common fields
    const updated: BudgetTracker = {
      ...budgetData,
      overall_spending: budgetData.overall_spending + spentAmount,
      current_month_spending: newSpending,
      spending_by_category: updatedSpendingCategories,
      spending_history: updatedSpendingHistory,
    };

    // Update savings data if there are savings
    if (savings > 0) {
      // Update savings by category
      const savingsCategoryIndex = budgetData.savings_by_category.findIndex(
        (c) => c.category === category
      );

      let updatedSavingsCategories = [...budgetData.savings_by_category];
      if (savingsCategoryIndex >= 0) {
        updatedSavingsCategories[savingsCategoryIndex].amount += savings;
      } else {
        updatedSavingsCategories.push({ category, amount: savings });
      }

      // Update savings history
      let updatedSavingsHistory = [...budgetData.savings_history];
      const savingsHistoryIndex = updatedSavingsHistory.findIndex(
        (h) => h.month === currentMonth
      );

      if (savingsHistoryIndex >= 0) {
        updatedSavingsHistory[savingsHistoryIndex].amount += savings;
      } else {
        updatedSavingsHistory.push({ month: currentMonth, amount: savings });
      }

      // Add savings fields to updated object
      updated.overall_savings = budgetData.overall_savings + savings;
      updated.current_month_savings =
        budgetData.current_month_savings + savings;
      updated.savings_by_category = updatedSavingsCategories;
      updated.savings_history = updatedSavingsHistory;
    }

    set({ budgetData: updated });

    try {
      await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updated));
      console.log('Budget data saved successfully:', updated);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  },

  addSavings: async (category, amount) => {
    const { budgetData } = get();
    const newSavings = budgetData.current_month_savings + amount;

    // Update savings by category
    const savingsCategoryIndex = budgetData.savings_by_category.findIndex(
      (c) => c.category === category
    );

    let updatedSavingsCategories = [...budgetData.savings_by_category];
    if (savingsCategoryIndex >= 0) {
      updatedSavingsCategories[savingsCategoryIndex].amount += amount;
    } else {
      updatedSavingsCategories.push({ category, amount });
    }

    // Update savings history
    const currentMonth = new Date().toISOString().slice(0, 7);
    const savingsHistoryIndex = budgetData.savings_history.findIndex(
      (h) => h.month === currentMonth
    );

    let updatedSavingsHistory = [...budgetData.savings_history];
    if (savingsHistoryIndex >= 0) {
      updatedSavingsHistory[savingsHistoryIndex].amount += amount;
    } else {
      updatedSavingsHistory.push({ month: currentMonth, amount });
    }

    const updated: BudgetTracker = {
      ...budgetData,
      overall_savings: budgetData.overall_savings + amount,
      current_month_savings: newSavings,
      savings_by_category: updatedSavingsCategories,
      savings_history: updatedSavingsHistory,
    };

    set({ budgetData: updated });

    try {
      await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding savings:', error);
    }
  },

  isOverBudget: () => {
    const { budgetData } = get();
    if (!budgetData.monthly_limit) return false;
    return budgetData.current_month_spending > budgetData.monthly_limit;
  },

  getRemainingBudget: () => {
    const { budgetData } = get();
    if (!budgetData.monthly_limit) return Infinity;
    return budgetData.monthly_limit - budgetData.current_month_spending;
  },

  getSpendingPercentage: () => {
    const { budgetData } = get();
    if (!budgetData.monthly_limit) return 0;
    return (budgetData.current_month_spending / budgetData.monthly_limit) * 100;
  },

  getTotalSavings: () => {
    const { budgetData } = get();
    return budgetData.current_month_savings;
  },

  getSavingsPercentage: () => {
    const { budgetData } = get();
    if (budgetData.current_month_spending === 0) return 0;
    return (
      (budgetData.current_month_savings / budgetData.current_month_spending) *
      100
    );
  },
}));
