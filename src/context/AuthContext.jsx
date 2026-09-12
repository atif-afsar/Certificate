import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

const MOCK_ADMIN_USER = {
  id: 'admin-001',
  email: 'admin@brandsway.com',
  role: 'admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local fallback: check localStorage
      const saved = localStorage.getItem('brandsway_admin_session');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data.user;
    }

    // Local fallback: accept demo credentials
    if (email.trim().toLowerCase() === 'admin@brandsway.com' && password === 'admin123') {
      const u = { ...MOCK_ADMIN_USER, email: email.trim() };
      localStorage.setItem('brandsway_admin_session', JSON.stringify(u));
      setUser(u);
      return u;
    } else {
      throw new Error('Invalid credentials. Use demo: admin@brandsway.com / admin123');
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('brandsway_admin_session');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
