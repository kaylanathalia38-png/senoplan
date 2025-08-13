import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Admin login with ID and password (custom auth)
  const login = async (adminId: string, password: string) => {
    try {
      setLoading(true);
      
      // Check admin credentials
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('admins')
        .select('*')
        .eq('admin_id', adminId)
        .eq('password', password) // In production, use hashed passwords
        .single();

      if (adminError || !adminData) {
        throw new Error('Invalid admin ID or password');
      }

      // Set admin session
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
        email: adminData.email,
        password: adminData.password_hash // Use the hashed password from the database
      });

      if (sessionError) throw sessionError;

      setAdmin(adminData);
      localStorage.setItem('adminSession', JSON.stringify(adminData));
      
      return { admin: adminData, error: null };
    } catch (err) {
      setError(err as Error);
      return { admin: null, error: err as Error };
    } finally {
      setLoading(false);
    }
  };

  // Check if admin is logged in
  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Check local storage first
      const savedSession = localStorage.getItem('adminSession');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        setAdmin(session);
        return true;
      }

      // Check Supabase session
      const { data: { session }, error } = await supabaseAdmin.auth.getSession();
      
      if (error || !session) {
        throw new Error('No active session');
      }

      // Get admin data
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('admins')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (adminError) throw adminError;
      
      setAdmin(adminData);
      localStorage.setItem('adminSession', JSON.stringify(adminData));
      
      return true;
    } catch (err) {
      localStorage.removeItem('adminSession');
      setAdmin(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin logout
  const logout = async () => {
    try {
      setLoading(true);
      await supabaseAdmin.auth.signOut();
      localStorage.removeItem('adminSession');
      setAdmin(null);
      return { error: null };
    } catch (err) {
      setError(err as Error);
      return { error: err as Error };
    } finally {
      setLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    admin,
    loading,
    error,
    login,
    logout,
    checkAuth,
    supabase: supabaseAdmin
  };
};

export default useAdminAuth;
