import { useEffect, useState } from 'react';
import { supabaseAdmin } from './useAdminAuth';

export const useRealTimeAdmin = (table: string, filter = {}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let query = supabaseAdmin.from(table).select('*');

        // Apply filters
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });

        const { data: fetchedData, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setData(fetchedData || []);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, [table, JSON.stringify(filter)]);

  // Realtime subscription
  useEffect(() => {
    const subscription = supabaseAdmin
      .channel('table-db-changes')
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public',
          table: table
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(currentData => [...currentData, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setData(currentData =>
              currentData.map(item => 
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData(currentData =>
              currentData.filter(item => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table]);

  // CRUD operations
  const create = async (item: any) => {
    const { data: newItem, error } = await supabaseAdmin
      .from(table)
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return newItem;
  };

  const update = async (id: string, updates: any) => {
    const { data: updatedItem, error } = await supabaseAdmin
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedItem;
  };

  const remove = async (id: string) => {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  };

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
  };
};

// Specialized hooks for admin dashboard
export const usePlayers = () => {
  const { data: players, ...rest } = useRealTimeAdmin('profiles');
  
  const updatePlayerStatus = async (playerId: string, isActive: boolean) => {
    return await supabaseAdmin
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', playerId);
  };

  const updatePlayerBalance = async (playerId: string, amount: number) => {
    return await supabaseAdmin.rpc('update_player_balance', {
      player_id: playerId,
      amount: amount
    });
  };

  return {
    players,
    updatePlayerStatus,
    updatePlayerBalance,
    ...rest
  };
};

export const useWithdrawals = (status = 'pending') => {
  const { data: withdrawals, ...rest } = useRealTimeAdmin('withdrawals', { status });
  
  const updateWithdrawalStatus = async (withdrawalId: string, status: string, adminNote?: string) => {
    return await supabaseAdmin
      .from('withdrawals')
      .update({ 
        status,
        processed_at: status === 'completed' ? new Date().toISOString() : null,
        admin_note: adminNote
      })
      .eq('id', withdrawalId);
  };

  return {
    withdrawals,
    updateWithdrawalStatus,
    ...rest
  };
};

export const useGames = () => {
  const { data: games, ...rest } = useRealTimeAdmin('games');
  
  const createNewGame = async () => {
    return await supabaseAdmin
      .from('games')
      .insert([{
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
  };

  const updateGameResult = async (gameId: string, result: number) => {
    return await supabaseAdmin
      .from('games')
      .update({ 
        result,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', gameId);
  };

  return {
    games,
    createNewGame,
    updateGameResult,
    ...rest
  };
};
