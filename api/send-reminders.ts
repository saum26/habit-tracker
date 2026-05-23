import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL ?? 'admin@habittracker.app'}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role bypasses RLS — only used server-side
);

function shouldFireToday(repeat: string, day: number): boolean {
  if (repeat === 'daily') return true;
  if (repeat === 'weekdays') return day >= 1 && day <= 5;
  if (repeat === 'weekends') return day === 0 || day === 6;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Protect — only allow calls with the correct secret (set in Vercel env vars)
  const auth = req.headers['authorization'];
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const currentTime = `${hh}:${mm}:00`;
  const currentDay = now.getUTCDay();

  // Get all enabled reminders due right now
  const { data: reminders, error } = await supabase
    .from('habit_reminders')
    .select('user_id, habit_id, repeat')
    .eq('enabled', true)
    .eq('reminder_time', currentTime);

  if (error) return res.status(500).json({ error: error.message });
  if (!reminders?.length) return res.json({ sent: 0 });

  // Get push subscriptions for all involved users
  const userIds = [...new Set(reminders.map(r => r.user_id as string))];
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('user_id, subscription')
    .in('user_id', userIds);

  const subMap = new Map((subs ?? []).map(s => [s.user_id as string, s.subscription]));

  let sent = 0;
  for (const reminder of reminders) {
    if (!shouldFireToday(reminder.repeat as string, currentDay)) continue;

    const subscription = subMap.get(reminder.user_id as string);
    if (!subscription) continue;

    // Get habit name + icon
    const { data: habit } = await supabase
      .from('habits')
      .select('name, icon')
      .eq('id', reminder.habit_id)
      .single();

    if (!habit) continue;

    try {
      await webpush.sendNotification(
        subscription as webpush.PushSubscription,
        JSON.stringify({
          title: 'Habit Reminder 🌱',
          body: `Time to ${habit.name} ${habit.icon}`,
          habitId: reminder.habit_id,
          url: `/habit/${reminder.habit_id}`,
        })
      );
      sent++;
    } catch (err) {
      // Subscription expired — remove it
      if ((err as { statusCode?: number }).statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('user_id', reminder.user_id);
      }
    }
  }

  return res.json({ sent });
}
