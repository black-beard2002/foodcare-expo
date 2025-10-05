export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rating: number;
  delivery_time: string;
  delivery_fee: number;
  minimum_order: number;
  cuisine_type: string;
  address: string;
  phone: string;
  is_open: boolean;
  opening_hours: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface Item {
  id: string;
  offer_id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  ingredients: string[];
  allergens: string[];
  calories: number;
  prep_time: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  spice_level: 'mild' | 'medium' | 'hot' | 'very_hot';
  nutrition_facts: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  created_at: string;
}

export interface Offer {
  id: string;
  restaurant_id: string;
  restaurant: Restaurant;
  title: string;
  description: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  category_id: string;
  category: Category;
  items: Item[];
  rating: number;
  review_count: number;
  tags: string[];
  is_featured: boolean;
  is_available: boolean;
  isNear: boolean;
  expires_at: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  offer: Offer;
  quantity: number;
  customizations?: string[];
  special_instructions?: string;
}
export interface Order {
  id: string; // unique order id
  customerName: string;
  customerPhone: string;
  pickupTime?: string;
  specialInstructions?: string;
  offers: CartItem[];
  status: 'pending' | 'completed' | 'cancelled';
  total: number;
  createdAt: string;
}
export interface FilterOptions {
  priceRange: string[];
  rating: number | null;
  deliveryTime: string[];
  sortBy: string;
  cuisine: string[];
}

export interface Review {
  id: string;
  offer_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  photos?: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface FavoriteItem {
  id: string;
  favorited: Offer | Item;
  added_at: string;
  price_alert_enabled: boolean;
  original_price_tracked: number;
}

export interface RecentlyViewedItem {
  id: string;
  offer: Offer;
  viewed_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount?: number;
  expires_at: string;
  is_active: boolean;
  usage_limit?: number;
  used_count: number;
}

export interface Notification {
  id: string;
  type: 'order' | 'promo' | 'price_alert' | 'general' | 'reward';
  title: string;
  message: string;
  image_url?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  order_updates: boolean;
  promotions: boolean;
  price_alerts: boolean;
  rewards: boolean;
  general: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export interface LoyaltyProgram {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points_to_next_tier: number;
  total_spent: number;
  rewards_earned: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  discount_value: number;
  is_claimed: boolean;
  expires_at?: string;
}

export interface FlashSale {
  id: string;
  offer: Offer;
  flash_price: number;
  original_price: number;
  discount_percentage: number;
  starts_at: string;
  ends_at: string;
  quantity_available: number;
  quantity_sold: number;
}

export interface BudgetTracker {
  monthly_limit?: number;
  current_month_spending: number;
  spending_by_category: {
    category: string;
    amount: number;
  }[];
  spending_history: {
    month: string;
    amount: number;
  }[];
}

export interface SearchHistory {
  id: string;
  query: string;
  searched_at: string;
}

export interface OrderTracking {
  order_id: string;
  status:
    | 'confirmed'
    | 'preparing'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  estimated_delivery_time: string;
  actual_delivery_time?: string;
  driver_name?: string;
  driver_phone?: string;
  tracking_updates: {
    status: string;
    message: string;
    timestamp: string;
  }[];
}
