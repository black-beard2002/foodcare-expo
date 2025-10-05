import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { PromoCode } from '@/types/appTypes';

const PROMO_CODES_STORAGE_KEY = '@promo_codes_storage';

interface PromoCodesState {
  promoCodes: PromoCode[];
  appliedPromoCode: PromoCode | null;
  isLoading: boolean;

  loadPromoCodes: () => Promise<void>;
  applyPromoCode: (code: string, orderTotal: number) => { success: boolean; message: string; discount: number };
  removePromoCode: () => void;
  getDiscountAmount: (promoCode: PromoCode, orderTotal: number) => number;
  getBestPromoCode: (orderTotal: number) => PromoCode | null;
  autoApplyBestDiscount: (orderTotal: number) => void;
}

export const usePromoCodesStore = create<PromoCodesState>((set, get) => ({
  promoCodes: [],
  appliedPromoCode: null,
  isLoading: false,

  loadPromoCodes: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(PROMO_CODES_STORAGE_KEY);
      if (stored) {
        const promoCodes = JSON.parse(stored);
        set({ promoCodes, isLoading: false });
      } else {
        const { dummyPromoCodes } = await import('@/data/dummyData');
        set({ promoCodes: dummyPromoCodes, isLoading: false });
        await AsyncStorage.setItem(PROMO_CODES_STORAGE_KEY, JSON.stringify(dummyPromoCodes));
      }
    } catch (error) {
      console.error('Error loading promo codes:', error);
      set({ isLoading: false });
    }
  },

  applyPromoCode: (code, orderTotal) => {
    const { promoCodes } = get();
    const promoCode = promoCodes.find(
      (pc) => pc.code.toLowerCase() === code.toLowerCase() && pc.is_active
    );

    if (!promoCode) {
      return {
        success: false,
        message: 'Invalid promo code',
        discount: 0,
      };
    }

    const now = new Date();
    const expiryDate = new Date(promoCode.expires_at);
    if (now > expiryDate) {
      return {
        success: false,
        message: 'This promo code has expired',
        discount: 0,
      };
    }

    if (orderTotal < promoCode.min_order_value) {
      return {
        success: false,
        message: `Minimum order value of $${promoCode.min_order_value} required`,
        discount: 0,
      };
    }

    if (
      promoCode.usage_limit &&
      promoCode.used_count >= promoCode.usage_limit
    ) {
      return {
        success: false,
        message: 'This promo code has reached its usage limit',
        discount: 0,
      };
    }

    const discount = get().getDiscountAmount(promoCode, orderTotal);
    set({ appliedPromoCode: promoCode });

    return {
      success: true,
      message: `Promo code applied! You saved $${discount.toFixed(2)}`,
      discount,
    };
  },

  removePromoCode: () => {
    set({ appliedPromoCode: null });
  },

  getDiscountAmount: (promoCode, orderTotal) => {
    let discount = 0;

    if (promoCode.discount_type === 'percentage') {
      discount = (orderTotal * promoCode.discount_value) / 100;
      if (promoCode.max_discount && discount > promoCode.max_discount) {
        discount = promoCode.max_discount;
      }
    } else {
      discount = promoCode.discount_value;
    }

    return Math.min(discount, orderTotal);
  },

  getBestPromoCode: (orderTotal) => {
    const { promoCodes } = get();
    const now = new Date();

    const validCodes = promoCodes.filter((pc) => {
      const expiryDate = new Date(pc.expires_at);
      return (
        pc.is_active &&
        now <= expiryDate &&
        orderTotal >= pc.min_order_value &&
        (!pc.usage_limit || pc.used_count < pc.usage_limit)
      );
    });

    if (validCodes.length === 0) {
      return null;
    }

    let bestCode = validCodes[0];
    let maxDiscount = get().getDiscountAmount(bestCode, orderTotal);

    for (const code of validCodes) {
      const discount = get().getDiscountAmount(code, orderTotal);
      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestCode = code;
      }
    }

    return bestCode;
  },

  autoApplyBestDiscount: (orderTotal) => {
    const bestCode = get().getBestPromoCode(orderTotal);
    if (bestCode) {
      set({ appliedPromoCode: bestCode });
    }
  },
}));
