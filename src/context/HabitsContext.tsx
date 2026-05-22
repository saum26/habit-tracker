import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Habit, HabitCompletion, HabitNote, HabitStats, WeeklyData } from '../types';
import { useAuth } from './AuthContext';

interface HabitsContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  todayCompletions: Set<string>;
  loading: boolean;
  toggleCompletion: (habitId: string, date?: string) => Promise<void>;
  addHabit: (habit: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  getHabitCompletions: (habitId: string) => Promise<HabitCompletion[]>;
  addNote: (habitId: string, note: string, noteDate?: string) => Promise<HabitNote | null>;
  getNotes: (habitId: string) => Promise<HabitNote[]>;
  getHabitStats: (habitId: string, allCompletions?: HabitCompletion[]) => HabitStats;
  getWeeklyData: () => WeeklyData[];
}

const HabitsContext = createContext<HabitsContextType | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('habits').select('*').eq('user_id', user.id).eq('is_active', true).order('sort_order');
    if (data) setHabits(data);
  }, [user]);

  const fetchRecentCompletions = useCallback(async () => {
    if (!user) return;
    const ninetyDaysAgo = format(subDays(new Date(), 90), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('habit_completions').select('*').eq('user_id', user.id).gte('completed_date', ninetyDaysAgo);
    if (data) setCompletions(data);
  }, [user]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    Promise.all([fetchHabits(), fetchRecentCompletions()]).finally(() => setLoading(false));
  }, [user, fetchHabits, fetchRecentCompletions]);

  const todayCompletions = new Set(
    completions.filter(c => c.completed_date === today).map(c => c.habit_id)
  );

  async function toggleCompletion(habitId: string, date: string = today) {
    if (!user) return;
    const isCompleted = completions.some(c => c.habit_id === habitId && c.completed_date === date);
    if (isCompleted) {
      await supabase.from('habit_completions').delete()
        .eq('habit_id', habitId).eq('completed_date', date).eq('user_id', user.id);
      setCompletions(prev => prev.filter(c => !(c.habit_id === habitId && c.completed_date === date)));
    } else {
      const { data } = await supabase.from('habit_completions')
        .insert({ habit_id: habitId, user_id: user.id, completed_date: date }).select().single();
      if (data) setCompletions(prev => [...prev, data]);
    }
  }

  async function addHabit(habit: Partial<Habit>) {
    if (!user) return;
    const { data } = await supabase.from('habits')
      .insert({ ...habit, user_id: user.id, sort_order: habits.length }).select().single();
    if (data) setHabits(prev => [...prev, data]);
  }

  async function updateHabit(id: string, updates: Partial<Habit>) {
    const { data } = await supabase.from('habits').update(updates).eq('id', id).select().single();
    if (data) setHabits(prev => prev.map(h => h.id === id ? data : h));
  }

  async function deleteHabit(id: string) {
    await supabase.from('habits').update({ is_active: false }).eq('id', id);
    setHabits(prev => prev.filter(h => h.id !== id));
  }

  async function getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
    if (!user) return [];
    const { data } = await supabase.from('habit_completions').select('*')
      .eq('habit_id', habitId).eq('user_id', user.id).order('completed_date', { ascending: false });
    return data ?? [];
  }

  async function addNote(habitId: string, note: string, noteDate: string = today): Promise<HabitNote | null> {
    if (!user) return null;
    const { data } = await supabase.from('habit_notes')
      .insert({ habit_id: habitId, user_id: user.id, note, note_date: noteDate }).select().single();
    return data;
  }

  async function getNotes(habitId: string): Promise<HabitNote[]> {
    if (!user) return [];
    const { data } = await supabase.from('habit_notes').select('*')
      .eq('habit_id', habitId).eq('user_id', user.id).order('note_date', { ascending: false });
    return data ?? [];
  }

  function getHabitStats(habitId: string, allCompletions?: HabitCompletion[]): HabitStats {
    const source = allCompletions ?? completions;
    const dates = source.filter(c => c.habit_id === habitId).map(c => c.completed_date).sort();
    const totalCompletions = dates.length;
    const completionSet = new Set(dates);

    let currentStreak = 0;
    let checkDate = today;
    while (completionSet.has(checkDate)) {
      currentStreak++;
      const d = new Date(checkDate + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      checkDate = format(d, 'yyyy-MM-dd');
    }
    if (currentStreak === 0) {
      checkDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      while (completionSet.has(checkDate)) {
        currentStreak++;
        const d = new Date(checkDate + 'T00:00:00');
        d.setDate(d.getDate() - 1);
        checkDate = format(d, 'yyyy-MM-dd');
      }
    }

    let longestStreak = 0;
    let streak = 0;
    let prevDate: string | null = null;
    for (const dateStr of dates) {
      if (!prevDate) { streak = 1; }
      else {
        const diff = Math.round(
          (new Date(dateStr + 'T00:00:00').getTime() - new Date(prevDate + 'T00:00:00').getTime()) / 86400000
        );
        streak = diff === 1 ? streak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, streak);
      prevDate = dateStr;
    }

    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const successRate = Math.round((dates.filter(d => d >= thirtyDaysAgo).length / 30) * 100);

    return { current_streak: currentStreak, longest_streak: longestStreak, success_rate: successRate, total_completions: totalCompletions };
  }

  function getWeeklyData(): WeeklyData[] {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const done = new Set(completions.filter(c => c.completed_date === dateStr).map(c => c.habit_id)).size;
      return { day: format(d, 'EEE'), completed: done, total: habits.length };
    });
  }

  return (
    <HabitsContext.Provider value={{
      habits, completions, todayCompletions, loading,
      toggleCompletion, addHabit, updateHabit, deleteHabit,
      getHabitCompletions, addNote, getNotes, getHabitStats, getWeeklyData,
    }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
}
