'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  regiment?: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signInWithPassword: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithPassword: (
    email: string,
    pass: string,
    fullName?: string,
    regiment?: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'cantt_auth_demo_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check if Supabase live keys are active
    if (isSupabaseConfigured()) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id, session.user.email || '');
        } else {
          setIsLoading(false);
        }
      });

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 2. Offline / Demo Mode fallback (reads from localStorage)
      try {
        const saved = localStorage.getItem(DEMO_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setProfile(parsed);
          setUser({ id: parsed.id, email: parsed.email } as User);
        }
      } catch (e) {
        console.warn('Demo session load error:', e);
      }
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile({
          id: data.id,
          email: data.email || email,
          fullName: data.full_name,
          phone: data.phone,
          regiment: data.regiment,
          role: data.role === 'ADMIN' || data.role === 'SUPER_ADMIN' ? data.role : 'CUSTOMER',
        });
      } else {
        // Default fallback profile
        setProfile({
          id: userId,
          email,
          fullName: email.split('@')[0],
          role: email.includes('admin') ? 'ADMIN' : 'CUSTOMER',
        });
      }
    } catch (err) {
      setProfile({
        id: userId,
        email,
        role: email.includes('admin') ? 'ADMIN' : 'CUSTOMER',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithPassword = async (email: string, pass: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, data.user.email || email);
      }
      return {};
    } else {
      // Demo authentication simulation
      const isAdminUser = email.toLowerCase().includes('admin');
      const demoProfile: UserProfile = {
        id: 'demo-user-' + Date.now(),
        email,
        fullName: isAdminUser ? 'Commanding Officer (Admin)' : 'Sepoy Officer',
        phone: '+91 98765 43210',
        regiment: 'PARA SF (Special Forces)',
        role: isAdminUser ? 'ADMIN' : 'CUSTOMER',
      };

      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoProfile));
      setProfile(demoProfile);
      setUser({ id: demoProfile.id, email: demoProfile.email } as User);
      setIsLoading(false);
      return {};
    }
  };

  const signUpWithPassword = async (
    email: string,
    pass: string,
    fullName?: string,
    regiment?: string
  ) => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            regiment: regiment,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, data.user.email || email);
      }
      return {};
    } else {
      // Demo sign-up simulation
      const demoProfile: UserProfile = {
        id: 'demo-user-' + Date.now(),
        email,
        fullName: fullName || email.split('@')[0],
        regiment: regiment || 'Indian Army',
        phone: '+91 98765 00000',
        role: email.toLowerCase().includes('admin') ? 'ADMIN' : 'CUSTOMER',
      };

      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoProfile));
      setProfile(demoProfile);
      setUser({ id: demoProfile.id, email: demoProfile.email } as User);
      setIsLoading(false);
      return {};
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }
    setUser(null);
    setProfile(null);
    setIsLoading(false);
  };

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAdmin,
        signInWithPassword,
        signUpWithPassword,
        signOut,
      }}
    >
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
