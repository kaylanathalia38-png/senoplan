import { useEffect, useState } from 'react';
import { supabase } from './useSupabaseAuth';

export const useRealTimeSync = (table: string, filter = {}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let query = supabase.from(table).select('*');

        // Apply filters if any
        Object.entries(filter).forEach(([key, value]) => {
          if (value) {
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
    const subscription = supabase
      .from(table)
      .on('*', (payload) => {
        if (payload.eventType === 'INSERT') {
          setData((currentData) => [...currentData, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setData((currentData) =>
            currentData.map((item) =>
              item.id === payload.new.id ? payload.new : item
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setData((currentData) =>
            currentData.filter((item) => item.id !== payload.old.id)
          );
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table]);

  return { data, loading, error };
};

// Specialized hooks for common use cases
export const useGameResults = () => {
  return useRealTimeSync('game_results', { status: 'completed' });
};

export const useChatMessages = (roomId: string) => {
  return useRealTimeSync('chat_messages', { room_id: roomId });
};

export const usePlayerBalance = (playerId: string) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = supabase
      .from('profiles')
      .select('balance')
      .eq('id', playerId)
      .on('UPDATE', (payload) => {
        if (payload.new.id === playerId) {
          setBalance(payload.new.balance);
        }
      })
      .subscribe();

    // Initial fetch
    const fetchBalance = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', playerId)
        .single();
      
      if (data) {
        setBalance(data.balance);
      }
      setLoading(false);
    };

    fetchBalance();

    return () => {
      subscription.unsubscribe();
    };
  }, [playerId]);

  return { balance, loading };
};
