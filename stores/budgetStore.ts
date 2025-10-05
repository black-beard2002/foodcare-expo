import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { BudgetTracker } from '@/types/appTypes';

const BUDGET_STORAGE_KEY = '@budget_tracker_storage';

interface BudgetState {
  budgetData: BudgetTracker;
  isLoading: boolean;

  loadBudgetData: () => Promise<void>;
  setMonthlyLimit: (limit: number) => Promise<void>;
  addExpense: (category: string, amount: number) => Promise<void>;
  isOverBudget: () => boolean;
  getRemainingBudget: () => number;
  getSpendingPercentage: () => number;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgetData: {
    monthly_limit: undefined,
    current_month_spending: 0,
    spending_by_category: [],
    spending_history: [],
  },
  isLoading: false,

  loadBudgetData: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
      if (stored) {
        set({ budgetData: JSON.parse(stored), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
      set({ isLoading: false });
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

  addExpense: async (category, amount) => {
    const { budgetData } = get();
    const newSpending = budgetData.current_month_spending + amount;

    const categoryIndex = budgetData.spending_by_category.findIndex(
      (c) => c.category === category
    );

    let updatedCategories = [...budgetData.spending_by_category];
    if (categoryIndex >= 0) {
      updatedCategories[categoryIndex].amount += amount;
    } else {
      updatedCategories.push({ category, amount });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const historyIndex = budgetData.spending_history.findIndex(
      (h) => h.month === currentMonth
    );

    let updatedHistory = [...budgetData.spending_history];
    if (historyIndex >= 0) {
      updatedHistory[historyIndex].amount += amount;
    } else {
      updatedHistory.push({ month: currentMonth, amount });
    }

    const updated: BudgetTracker = {
      ...budgetData,
      current_month_spending: newSpending,
      spending_by_category: updatedCategories,
      spending_history: updatedHistory,
    };

    set({ budgetData: updated });

    try {
      await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding expense:', error);
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
}));
