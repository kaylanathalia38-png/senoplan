import { supabaseAdmin } from '../hooks/useAdminAuth';

// Admin dashboard services
export const AdminService = {
  // Player Management
  getPlayers: async (page = 1, pageSize = 20) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, count, error } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data, count };
  },

  searchPlayers: async (query: string) => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);

    if (error) throw error;
    return data;
  },

  updatePlayer: async (playerId: string, updates: any) => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', playerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Game Management
  createGame: async (gameData: any) => {
    const { data, error } = await supabaseAdmin
      .from('games')
      .insert([{
        ...gameData,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateGame: async (gameId: string, updates: any) => {
    const { data, error } = await supabaseAdmin
      .from('games')
      .update(updates)
      .eq('id', gameId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Withdrawal Management
  getWithdrawals: async (status = 'pending', page = 1, pageSize = 20) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    let query = supabaseAdmin
      .from('withdrawals')
      .select('*, profiles(username, email, phone)', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query.range(from, to);
    
    if (error) throw error;
    return { data, count };
  },

  processWithdrawal: async (withdrawalId: string, status: 'approved' | 'rejected', adminNote?: string) => {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .update({
        status,
        processed_at: status === 'approved' ? new Date().toISOString() : null,
        admin_note: adminNote
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Reports & Analytics
  getDailyReport: async (date: string) => {
    const { data, error } = await supabaseAdmin.rpc('get_daily_report', {
      report_date: date
    });

    if (error) throw error;
    return data;
  },

  getPlayerBets: async (playerId: string, startDate?: string, endDate?: string) => {
    let query = supabaseAdmin
      .from('bets')
      .select('*, games(result, created_at)')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  // System Settings
  updateSettings: async (settings: Record<string, any>) => {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabaseAdmin
      .from('settings')
      .upsert(updates, { onConflict: 'key' })
      .select();

    if (error) throw error;
    return data;
  },

  getSettings: async (keys?: string[]) => {
    let query = supabaseAdmin.from('settings').select('*');
    
    if (keys && keys.length > 0) {
      query = query.in('key', keys);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Convert to settings object
    return data.reduce((acc: Record<string, any>, { key, value }) => {
      try {
        acc[key] = JSON.parse(value);
      } catch (e) {
        acc[key] = value;
      }
      return acc;
    }, {});
  },

  // System Utilities
  backupDatabase: async () => {
    const { data, error } = await supabaseAdmin.rpc('backup_database');
    if (error) throw error;
    return data;
  },

  // Chat Moderation
  deleteMessage: async (messageId: string) => {
    const { error } = await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return true;
  },

  banPlayer: async (playerId: string, reason: string, durationHours: number = 24) => {
    const { data, error } = await supabaseAdmin
      .from('bans')
      .insert([{
        player_id: playerId,
        reason,
        expires_at: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Export for convenience
export default AdminService;
