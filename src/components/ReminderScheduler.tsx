import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { registerServiceWorker, getExistingSubscription, subscribeToPush } from '../lib/pushNotifications';

export function ReminderScheduler() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    void (async () => {
      await registerServiceWorker();

      // Only subscribe to push if user has at least one enabled reminder
      const { data } = await supabase
        .from('habit_reminders')
        .select('id')
        .eq('user_id', user.id)
        .eq('enabled', true)
        .limit(1);

      if (!data?.length) return;

      let sub = await getExistingSubscription();
      if (!sub) sub = await subscribeToPush();
      if (!sub) return;

      // Persist the push subscription so the server can send to it
      await supabase.from('push_subscriptions').upsert(
        { user_id: user.id, subscription: sub.toJSON() },
        { onConflict: 'user_id' }
      );
    })();
  }, [user]);

  return null;
}
