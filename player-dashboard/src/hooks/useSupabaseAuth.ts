import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useSupabaseAuth = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const session = supabase.auth.session();
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);

    // Listen for changes on auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  // Sign up a new user
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { user, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Save additional user data to profiles table
      if (user) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: user.id,
              username: userData.username,
              full_name: userData.fullName,
              balance: 0, // Default balance
              created_at: new Date(),
            },
          ]);

        if (profileError) throw profileError;
      }

      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  };

  // Sign in a user
  const signIn = async (email: string, password: string) => {
    try {
      const { user, error } = await supabase.auth.signIn({
        email,
        password,
      });
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  };

  // Sign out the current user
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    supabase,
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
};

export default useSupabaseAuth;
