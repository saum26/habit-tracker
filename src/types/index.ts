export interface Profile {
  id: string;
  display_name: string;
  avatar_color: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
  is_active: boolean;
  sort_order: number;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  completed_at?: string;
  late_check_in: boolean;
  original_due_date?: string;
  notes?: string;
  created_at: string;
}

export interface HabitNote {
  id: string;
  habit_id: string;
  user_id: string;
  note: string;
  note_date: string;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_color: string;
  habits_done_today: number;
  total_habits: number;
  rings_closed_today: boolean;
  completion_percentage: number;
  rank: number;
}

export interface WeeklyData {
  day: string;
  completed: number;
  total: number;
}

export interface HabitStats {
  current_streak: number;
  longest_streak: number;
  success_rate: number;
  total_completions: number;
}
