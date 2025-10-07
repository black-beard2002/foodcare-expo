export interface User {
  id: string;
  phone_number: string;
  full_name?: string;
  date_of_birth?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  avatar_url?: string;
  has_completed_onboarding?: boolean;
  created_at: string;
  updated_at: string;
}
