import { supabase } from '../hooks/useSupabaseAuth';

// Player related operations
export const PlayerService = {
  // Get player profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update player profile
  updateProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    return data;
  },

  // Get player's balance
  getBalance: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data.balance;
  },

  // Update player's balance (use with caution, prefer transactions)
  updateBalance: async (userId: string, amount: number) => {
    // Use RPC for atomic operations
    const { data, error } = await supabase.rpc('update_player_balance', {
      player_id: userId,
      amount
    });
    
    if (error) throw error;
    return data;
  }
};

// Betting related operations
export const BettingService = {
  // Place a new bet
  placeBet: async (betData: {
    playerId: string;
    gameId: string;
    betType: string;
    betAmount: number;
    betNumber?: number;
  }) => {
    const { data, error } = await supabase
      .from('bets')
      .insert([{
        player_id: betData.playerId,
        game_id: betData.gameId,
        bet_type: betData.betType,
        bet_amount: betData.betAmount,
        bet_number: betData.betNumber || null,
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    return data;
  },

  // Get player's betting history
  getBettingHistory: async (playerId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('bets')
      .select(`
        *,
        games (result, status, created_at)
      `)
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get current active game
  getCurrentGame: async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }
};

// Chat related operations
export const ChatService = {
  // Send a chat message
  sendMessage: async (messageData: {
    roomId: string;
    senderId: string;
    message: string;
    imageUrl?: string;
  }) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: messageData.roomId,
        sender_id: messageData.senderId,
        message: messageData.message,
        image_url: messageData.imageUrl || null,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    return data;
  },

  // Upload chat image
  uploadImage: async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `chat_images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const { publicURL, error: urlError } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath);

    if (urlError) throw urlError;
    return publicURL;
  },

  // Get chat messages for a room
  getMessages: async (roomId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data.reverse(); // Return oldest first
  }
};

// Withdrawal related operations
export const WithdrawalService = {
  // Request a withdrawal
  requestWithdrawal: async (withdrawalData: {
    playerId: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => {
    const { data, error } = await supabase
      .from('withdrawals')
      .insert([{
        player_id: withdrawalData.playerId,
        amount: withdrawalData.amount,
        status: 'pending',
        bank_name: withdrawalData.bankName,
        account_number: withdrawalData.accountNumber,
        account_name: withdrawalData.accountName,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    return data;
  },

  // Get player's withdrawal history
  getWithdrawalHistory: async (playerId: string) => {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
