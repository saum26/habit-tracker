import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

function shouldFireToday(repeat: string): boolean {
  const day = new Date().getDay(); // 0 = Sun, 6 = Sat
  if (repeat === 'daily') return true;
  if (repeat === 'weekdays') return day >= 1 && day <= 5;
  if (repeat === 'weekends') return day === 0 || day === 6;
  return true;
}

export function ReminderScheduler() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    async function schedule() {
      const { data: reminders } = await supabase
        .from('habit_reminders')
        .select('*, habits(name, icon)')
        .eq('user_id', user!.id)
        .eq('enabled', true);

      if (!reminders) return;

      const now = new Date();

      for (const r of reminders) {
        if (!shouldFireToday(r.repeat as string)) continue;

        const timeStr = (r.reminder_time as string).slice(0, 5); // "HH:MM"
        const [hours, minutes] = timeStr.split(':').map(Number);
        const fireAt = new Date();
        fireAt.setHours(hours, minutes, 0, 0);

        const msUntil = fireAt.getTime() - now.getTime();
        if (msUntil <= 0) continue; // already passed today

        const habit = r.habits as { name: string; icon: string } | null;
        if (!habit) continue;

        const t = setTimeout(() => {
          new Notification('Habit Reminder 🌱', {
            body: `Time to complete ${habit.icon} ${habit.name}!`,
            icon: '/src/assets/icons/AppLogo.png',
          });
        }, msUntil);

        timeouts.push(t);
      }
    }

    void schedule();

    return () => { timeouts.forEach(clearTimeout); };
  }, [user]);

  return null;
}
