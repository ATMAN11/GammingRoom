/*
  # Gaming Platform Database Schema

  ## Overview
  Complete database schema for a gaming platform with user management, game rooms, enrollments, and withdrawal system.

  ## Tables Created

  ### 1. users
  - `id` (uuid, primary key) - User unique identifier
  - `email` (text, unique) - User email for login
  - `username` (text, unique) - Display username
  - `coins` (integer) - User wallet balance
  - `is_admin` (boolean) - Admin privilege flag
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. pubg_accounts
  - `id` (uuid, primary key) - Account unique identifier
  - `user_id` (uuid, foreign key) - References users table
  - `pubg_username` (text) - PUBG game username
  - `created_at` (timestamptz) - Account addition timestamp

  ### 3. game_rooms
  - `id` (uuid, primary key) - Room unique identifier
  - `title` (text) - Room title/name
  - `game` (text) - Game type
  - `entry_fee` (integer) - Coins required to join
  - `room_id_code` (text) - Game room ID code
  - `room_password` (text) - Room password
  - `is_active` (boolean) - Room availability status
  - `created_at` (timestamptz) - Room creation timestamp

  ### 4. enrollments
  - `id` (uuid, primary key) - Enrollment unique identifier
  - `user_id` (uuid, foreign key) - References users table
  - `room_id` (uuid, foreign key) - References game_rooms table
  - `pubg_username` (text) - Username used for this enrollment
  - `enrolled_at` (timestamptz) - Enrollment timestamp

  ### 5. withdrawal_requests
  - `id` (uuid, primary key) - Request unique identifier
  - `user_id` (uuid, foreign key) - References users table
  - `amount` (integer) - Withdrawal amount
  - `gpay_number` (text) - Google Pay phone number
  - `status` (text) - Request status (pending/approved/rejected)
  - `payment_screenshot_url` (text) - Admin uploaded proof
  - `requested_at` (timestamptz) - Request creation timestamp
  - `processed_at` (timestamptz) - Admin action timestamp

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to manage their own data
  - Admin-only policies for sensitive operations
  - Public read access for active game rooms
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  coins integer DEFAULT 0,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create pubg_accounts table
CREATE TABLE IF NOT EXISTS pubg_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  pubg_username text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create game_rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  game text NOT NULL,
  entry_fee integer DEFAULT 0,
  room_id_code text,
  room_password text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
  pubg_username text NOT NULL,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(user_id, room_id)
);

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  gpay_number text NOT NULL,
  status text DEFAULT 'pending',
  payment_screenshot_url text,
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pubg_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- PUBG accounts policies
CREATE POLICY "Users can view own PUBG accounts"
  ON pubg_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add own PUBG accounts"
  ON pubg_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own PUBG accounts"
  ON pubg_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Game rooms policies
CREATE POLICY "Anyone can view active game rooms"
  ON game_rooms FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can create game rooms"
  ON game_rooms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update game rooms"
  ON game_rooms FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can view all game rooms"
  ON game_rooms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Enrollments policies
CREATE POLICY "Users can view own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enrolled users can view room enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.room_id = enrollments.room_id AND e.user_id = auth.uid()
    )
  );

-- Withdrawal requests policies
CREATE POLICY "Users can view own withdrawal requests"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawal requests"
  ON withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawal requests"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update withdrawal requests"
  ON withdrawal_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );