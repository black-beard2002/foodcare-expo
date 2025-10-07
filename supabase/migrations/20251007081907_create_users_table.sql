/*
  # Create Users Table

  ## Summary
  Creates the users table to store user profile information for the food delivery app.
  This table will store personal information collected during onboarding and throughout
  the user's journey.

  ## Changes
  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique user identifier
      - `phone_number` (text, unique, not null) - User's phone number for authentication
      - `full_name` (text) - User's complete name
      - `date_of_birth` (date) - User's date of birth
      - `email` (text, unique) - User's email address
      - `address` (text) - User's location address
      - `latitude` (decimal) - Address latitude coordinate
      - `longitude` (decimal) - Address longitude coordinate
      - `avatar_url` (text) - URL to user's profile picture
      - `has_completed_onboarding` (boolean) - Flag indicating onboarding completion status
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data
    - Add policy for authenticated users to insert their own data

  ## Notes
  - Phone number is required and unique for authentication
  - Email is optional during onboarding but required by step 3
  - Address fields (address, latitude, longitude) are collected in step 2
  - has_completed_onboarding tracks if user finished all onboarding steps
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  full_name text,
  date_of_birth date,
  email text UNIQUE,
  address text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  avatar_url text,
  has_completed_onboarding boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid()::uuid);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid()::uuid);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::uuid)
  WITH CHECK (id = auth.uid()::uuid);

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();