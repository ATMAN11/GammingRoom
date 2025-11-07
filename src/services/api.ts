import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  username: string;
  coins: number;
  is_admin: boolean;
  created_at: string;
}

export interface PubgAccount {
  id: string;
  user_id: string;
  pubg_username: string;
  created_at: string;
}

export interface GameRoom {
  id: string;
  title: string;
  game: string;
  entry_fee: number;
  room_id_code: string | null;
  room_password: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  room_id: string;
  pubg_username: string;
  enrolled_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  gpay_number: string;
  status: string;
  payment_screenshot_url: string | null;
  requested_at: string;
  processed_at: string | null;
}

export const api = {
  async signup(email: string, password: string, username: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          username,
          coins: 0,
          is_admin: false,
        },
      ])
      .select()
      .single();

    if (userError) throw userError;

    return userData;
  },

  async login(email: string, password: string) {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) throw authError;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (userError) throw userError;
    if (!userData) throw new Error('User not found');

    return userData;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getGameRooms(): Promise<GameRoom[]> {
    const { data, error } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getRoomDetails(roomId: string) {
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (roomError) throw roomError;
    if (!room) throw new Error('Room not found');

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('room_id', roomId);

    if (enrollmentsError) throw enrollmentsError;

    return {
      room,
      enrollments: enrollments || [],
    };
  },

  async enrollInRoom(roomId: string, pubgUsername: string, userId: string) {
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('entry_fee')
      .eq('id', roomId)
      .maybeSingle();

    if (roomError) throw roomError;
    if (!room) throw new Error('Room not found');

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) throw new Error('User not found');

    if (user.coins < room.entry_fee) {
      throw new Error('Insufficient coins');
    }

    const { error: enrollError } = await supabase.from('enrollments').insert([
      {
        user_id: userId,
        room_id: roomId,
        pubg_username: pubgUsername,
      },
    ]);

    if (enrollError) throw enrollError;

    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: user.coins - room.entry_fee })
      .eq('id', userId);

    if (updateError) throw updateError;
  },

  async getPubgAccounts(userId: string): Promise<PubgAccount[]> {
    const { data, error } = await supabase
      .from('pubg_accounts')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async addPubgAccount(userId: string, pubgUsername: string) {
    const { data, error } = await supabase
      .from('pubg_accounts')
      .insert([
        {
          user_id: userId,
          pubg_username: pubgUsername,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePubgAccount(accountId: string) {
    const { error } = await supabase
      .from('pubg_accounts')
      .delete()
      .eq('id', accountId);

    if (error) throw error;
  },

  async addCoins(userId: string, amount: number) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) throw new Error('User not found');

    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: user.coins + amount })
      .eq('id', userId);

    if (updateError) throw updateError;
  },

  async requestWithdrawal(userId: string, amount: number, gpayNumber: string) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) throw new Error('User not found');

    if (user.coins < amount) {
      throw new Error('Insufficient coins');
    }

    const { error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .insert([
        {
          user_id: userId,
          amount,
          gpay_number: gpayNumber,
          status: 'pending',
        },
      ]);

    if (withdrawalError) throw withdrawalError;

    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: user.coins - amount })
      .eq('id', userId);

    if (updateError) throw updateError;
  },

  async getWithdrawalHistory(userId: string): Promise<WithdrawalRequest[]> {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createRoom(roomData: {
    title: string;
    game: string;
    entry_fee: number;
    room_id_code: string;
    room_password: string;
  }) {
    const { data, error } = await supabase
      .from('game_rooms')
      .insert([roomData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async approveWithdrawal(requestId: string, screenshotUrl: string) {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({
        status: 'approved',
        payment_screenshot_url: screenshotUrl,
        processed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
  },
};
