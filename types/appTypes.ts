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
  total: number;
  createdAt: string;
}