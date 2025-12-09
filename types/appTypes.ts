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
  description?: string;
  main_image?: string;
  icon?: string;
  color?: string;
  created_at?: string;
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
export type PropertyType =
  | 'select'
  | 'multiselect'
  | 'exclude'
  | 'multiexclude'
  | 'addon'
  | 'readonly'
  | 'multireadonly';

export type AddOn = {
  id: string;
  name: string;
  price: number;
  description?: string;
  available?: boolean;
};

export type CustomProperty = {
  id: string;
  label: string;
  type: PropertyType;
  options?: string | string[] | number | number[] | boolean | AddOn[];
  available?: boolean;
  icon?: string;
};
export interface Offer {
  id: string;
  name?: string;
  title: string;
  description: string;
  specifications?: string;
  serial_number?: string;
  model_number?: string;
  item_date?: string;
  author?: string;
  tags?: string[];
  main_image?: string | null;
  images?: string[] | null;
  price: number;
  sale_price?: number;
  discount?: number;
  qty: number;
  stock_status: string;
  address?: string;
  city?: string;
  state?: string;
  is_featured?: boolean;
  is_Near?: boolean;
  rating?: number;
  country?: string;
  latitude?: number;
  longitude?: number;
  pickup_start_time?: string;
  pickup_end_time?: string;
  location?: string;
  serialNumber: string;
  modelNumber: string;
  currency?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  item_type?: string;
  custom_properties?: Record<string, CustomProperty>;
  category_id: string;
  type_id?: string;
  brand_id?: string;
  provider_id?: string;
  created_at?: string;
  tenant_id?: string;
  updated_at?: string;
  created_by?: string;
  provider?: Provider;
}
export type SocialMedia = {
  name?: string;
  url?: string;
};
export type ProviderType =
  | 'retail'
  | 'service'
  | 'food'
  | 'tech'
  | 'home'
  | 'other'
  | '';
export interface Address {
  street: string;
  city: string;
  state: string;
  longitude: number;
  latitude: number;
  zipcode: string;
  country: string;
  is_primary: boolean;
}
export type Provider = {
  id: string;
  name: string;
  provider_type: ProviderType;
  founded_year: string;
  employee_count: string;
  addresses: Address[];
  primary_email: string;
  primary_phone: string;
  website: string;
  description: string;
  social_media: SocialMedia[];
  created_at: string;
  updated_at: string;
  settings: Record<string, string | number>;
  created_by: string;
  logo_path: string;
  cover_image: string;
  whatsapp_number: string;
};
export type SelectedPropertyValue =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | AddOn[];

export type SelectedProperties = Record<string, SelectedPropertyValue>;

export type CartItem = {
  id: string;
  item: Offer;
  quantity: number;
  selectedProperties?: SelectedProperties;
};
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
  created_by: string;
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
  favorited: Offer;
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
  overall_spending: number;
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
// Enums as union types
export type TransactionType =
  | 'RESERVATION'
  | 'ORDER'
  | 'SALE'
  | 'REFUND'
  | 'EXCHANGE'
  | 'RETURN'
  | 'OTHER';

export type TransactionStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PROCESSING'
  | 'DELIVERED';

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'PAYPAL'
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'CRYPTO'
  | 'OTHER';

export type PaymentStatus =
  | 'PAID'
  | 'PENDING'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_PAID';

export type OrderClientData = {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  address: string;
};
export type OrderItem = {
  item: Partial<Offer>;
  quantity: number;
  total: number;
  selectedProperties?: SelectedProperties;
};
// TransactionBase model
export type TransactionBase = {
  id: string;
  user_id?: string;
  transaction_type?: TransactionType;
  status?: TransactionStatus;
  unit_price?: number;
  currency?: string;
  total_price?: number;
  items?: OrderItem[]; // list of dicts
  total_items: number;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  confirmation_code?: string;
  qr_code_url?: string;
  expiry?: string;
  date_trx?: string;
  delivered_at?: string;
  provider_id?: string;
  client_data?: OrderClientData;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string;
  created_by?: string;
};
