import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Review } from '@/types/appTypes';

const REVIEWS_STORAGE_KEY = '@reviews_storage';

interface ReviewsState {
  reviews: Review[];
  isLoading: boolean;

  loadReviews: () => Promise<void>;
  getReviewsByOfferId: (offerId: string) => Review[];
  addReview: (review: Omit<Review, 'id' | 'created_at' | 'helpful_count'>) => Promise<void>;
  markReviewHelpful: (reviewId: string) => Promise<void>;
  getAverageRating: (offerId: string) => number;
}

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  reviews: [],
  isLoading: false,

  loadReviews: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored) {
        set({ reviews: JSON.parse(stored), isLoading: false });
      } else {
        const { dummyReviews } = await import('@/data/dummyData');
        set({ reviews: dummyReviews, isLoading: false });
        await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(dummyReviews));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      set({ isLoading: false });
    }
  },

  getReviewsByOfferId: (offerId) => {
    const { reviews } = get();
    return reviews
      .filter((r) => r.offer_id === offerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addReview: async (reviewData) => {
    const { reviews } = get();
    const newReview: Review = {
      ...reviewData,
      id: `review_${Date.now()}`,
      created_at: new Date().toISOString(),
      helpful_count: 0,
    };

    const updated = [newReview, ...reviews];
    set({ reviews: updated });

    try {
      await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving review:', error);
    }
  },

  markReviewHelpful: async (reviewId) => {
    const { reviews } = get();
    const updated = reviews.map((r) =>
      r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
    );
    set({ reviews: updated });

    try {
      await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  },

  getAverageRating: (offerId) => {
    const offerReviews = get().getReviewsByOfferId(offerId);
    if (offerReviews.length === 0) return 0;
    const sum = offerReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / offerReviews.length;
  },
}));
