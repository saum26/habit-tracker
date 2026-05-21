import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STARTER_HABITS = [
  { name: 'Drink Water', description: 'Drink 8 glasses of water', color: '#9BF6FF', icon: '💧', sort_order: 0 },
  { name: 'Exercise', description: '30 minutes of movement', color: '#FFD6A5', icon: '🏃', sort_order: 1 },
  { name: 'Read', description: 'Read for 20 minutes', color: '#F0A6CA', icon: '📚', sort_order: 2 },
  { name: 'Meditate', description: '10 minutes of mindfulness', color: '#C9B8E8', icon: '🧘', sort_order: 3 },
  { name: 'Sleep Early', description: 'Be in bed by 10 pm', color: '#CAFFBF', icon: '🌙', sort_order: 4 },
];

const AVATAR_COLORS = ['#9C89B8', '#F0A6CA', '#FFD6A5', '#95D5B2', '#9BF6FF', '#C9B8E8'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, displayName: string) {
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, avatar_color: avatarColor } },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Sign up failed. Please try again.' };

    // Upsert so this is safe whether the trigger already created the row or not
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      display_name: displayName,
      avatar_color: avatarColor,
    });
    if (profileError && profileError.code !== '42501') return { error: profileError.message };

    await supabase.from('habits').insert(
      STARTER_HABITS.map(h => ({ ...h, user_id: data.user!.id }))
    );

    await fetchProfile(data.user.id);
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
