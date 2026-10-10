import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export const ADMIN_DEMO_CREDENTIALS = {
  email: 'admin@brandsway.com',
  password: 'admin123',
};

const MOCK_ADMIN_USER = {
  id: 'admin-001',
  email: 'admin@brandsway.com',
  role: 'admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local admin session first
    const saved = localStorage.getItem('brandsway_admin_session');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
        setLoading(false);
        return;
      } catch (e) {
        // Continue to Supabase check
      }
    }

    // 2. Check Supabase auth session if available
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
        }
      });

      return () => subscription?.unsubscribe?.();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    // Fast-path: organizer demo credentials always work seamlessly
    if (cleanEmail === ADMIN_DEMO_CREDENTIALS.email && password === ADMIN_DEMO_CREDENTIALS.password) {
      const u = { ...MOCK_ADMIN_USER, email: cleanEmail };
      localStorage.setItem('brandsway_admin_session', JSON.stringify(u));
      setUser(u);
      return u;
    }

    // Try Supabase auth if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          return data.user;
        }
      } catch (err) {
        // If Supabase auth failed and credentials match demo, fallback
        if (cleanEmail === ADMIN_DEMO_CREDENTIALS.email && password === ADMIN_DEMO_CREDENTIALS.password) {
          const u = { ...MOCK_ADMIN_USER, email: cleanEmail };
          localStorage.setItem('brandsway_admin_session', JSON.stringify(u));
          setUser(u);
          return u;
        }
        throw err;
      }
    }

    throw new Error('Invalid credentials. Use admin: admin@brandsway.com / admin123');
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // Ignore signOut error
      }
    }
    localStorage.removeItem('brandsway_admin_session');
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
