export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email?: string;
          phone_number?: string;
          full_name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string;
          phone_number?: string;
          full_name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone_number?: string;
          full_name?: string;
          avatar_url?: string;
          updated_at?: string;
        };
      };
      restaurants: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          image_url: string;
          rating?: number;
          delivery_time: string;
          delivery_fee: number;
          minimum_order: number;
          cuisine_type: string;
          address: string;
          phone: string;
          is_open?: boolean;
          opening_hours: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          image_url?: string;
          rating?: number;
          delivery_time?: string;
          delivery_fee?: number;
          minimum_order?: number;
          cuisine_type?: string;
          address?: string;
          phone?: string;
          is_open?: boolean;
          opening_hours?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          image_url: string;
          icon: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          image_url: string;
          icon: string;
          color: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          image_url?: string;
          icon?: string;
          color?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          restaurant_id: string;
          title: string;
          description: string;
          image_url: string;
          original_price: number;
          discounted_price: number;
          discount_percentage: number;
          category_id: string;
          rating: number;
          review_count: number;
          tags: string[];
          is_featured: boolean;
          is_available: boolean;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          title: string;
          description: string;
          image_url: string;
          original_price: number;
          discounted_price: number;
          discount_percentage: number;
          category_id: string;
          rating?: number;
          review_count?: number;
          tags?: string[];
          is_featured?: boolean;
          is_available?: boolean;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          title?: string;
          description?: string;
          image_url?: string;
          original_price?: number;
          discounted_price?: number;
          discount_percentage?: number;
          category_id?: string;
          rating?: number;
          review_count?: number;
          tags?: string[];
          is_featured?: boolean;
          is_available?: boolean;
          expires_at?: string;
        };
      };
      items: {
        Row: {
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
          spice_level: string;
          nutrition_facts: {
            protein: number;
            carbs: number;
            fat: number;
            fiber: number;
            sugar: number;
            sodium: number;
          };
          created_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          name: string;
          description: string;
          image_url: string;
          price: number;
          category: string;
          ingredients: string[];
          allergens?: string[];
          calories?: number;
          prep_time?: number;
          is_vegetarian?: boolean;
          is_vegan?: boolean;
          is_gluten_free?: boolean;
          spice_level?: string;
          nutrition_facts?: {
            protein: number;
            carbs: number;
            fat: number;
            fiber: number;
            sugar: number;
            sodium: number;
          };
          created_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          name?: string;
          description?: string;
          image_url?: string;
          price?: number;
          category?: string;
          ingredients?: string[];
          allergens?: string[];
          calories?: number;
          prep_time?: number;
          is_vegetarian?: boolean;
          is_vegan?: boolean;
          is_gluten_free?: boolean;
          spice_level?: string;
          nutrition_facts?: {
            protein: number;
            carbs: number;
            fat: number;
            fiber: number;
            sugar: number;
            sodium: number;
          };
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          items: any[];
          total_amount: number;
          status: string;
          payment_method: string;
          delivery_address: string;
          special_instructions?: string;
          estimated_pickup_time: string;
          order_number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          items: any[];
          total_amount: number;
          status?: string;
          payment_method: string;
          delivery_address: string;
          special_instructions?: string;
          estimated_pickup_time: string;
          order_number: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          restaurant_id?: string;
          items?: any[];
          total_amount?: number;
          status?: string;
          payment_method?: string;
          delivery_address?: string;
          special_instructions?: string;
          estimated_pickup_time?: string;
          order_number?: string;
        };
      };
    };
  };
}