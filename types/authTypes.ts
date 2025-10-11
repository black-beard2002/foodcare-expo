export type UserPermissions = {
  read: boolean;
  write: boolean;
  update: boolean;
};
export type User = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  role: 'super_admin' | 'admin' | 'user'; // assuming these are possible roles
  tenant_id: string | null;
  bio: string;
  profile_completed: boolean;
  verified: boolean;
  birthdate: string | null; // use `Date | null` if it's parsed
  address: string | null;
  address_optional?: string | null;
  major: string | null;
  job_title: string | null;
  email_address: string;
  email_address_optional?: string | null;
  password: string;
  confirm_password: string;
  permissions: UserPermissions;
  phone_number: string | null;
  phone_number_optional: string | null;
  status: 'active' | 'inactive'; // assuming these are the statuses
  availability: 'freelance' | 'full_time' | 'part_time'; // assumed values
  avatar_path: string | null;
  created_at: string; // or Date if parsed
  updated_at: string; // or Date if parsed
  created_by: string | null;
};
