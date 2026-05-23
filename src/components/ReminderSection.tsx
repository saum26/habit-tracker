import { useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, FormControl, MenuItem, Select, Switch, Typography } from '@mui/material';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { notificationsSupported, registerServiceWorker, getExistingSubscription, subscribeToPush } from '../lib/pushNotifications';

interface Reminder {
  id?: string;
  enabled: boolean;
  reminder_time: string;
  repeat: string;
}

export function ReminderSection({ habitId }: { habitId: string }) {
  const { user } = useAuth();
  const [reminder, setReminder] = useState<Reminder>({ enabled: false, reminder_time: '09:00:00', repeat: 'daily' });
  const [saving, setSaving] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const supported = notificationsSupported();

  useEffect(() => {
    if (!user) return;
    void supabase
      .from('habit_reminders')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setReminder({
          id: data.id as string,
          enabled: data.enabled as boolean,
          reminder_time: data.reminder_time as string,
          repeat: data.repeat as string,
        });
      });
  }, [habitId, user]);

  async function persist(updated: Reminder) {
    if (!user) return;
    const payload = {
      habit_id: habitId,
      user_id: user.id,
      enabled: updated.enabled,
      reminder_time: updated.reminder_time,
      repeat: updated.repeat,
    };
    if (updated.id) {
      await supabase.from('habit_reminders').update(payload).eq('id', updated.id);
    } else {
      const { data } = await supabase.from('habit_reminders').insert(payload).select().single();
      if (data) setReminder(prev => ({ ...prev, id: data.id as string }));
    }
  }

  async function handleToggle(enabled: boolean) {
    if (!user) return;
    setSaving(true);
    setPermissionDenied(false);

    if (enabled) {
      if (!supported) { setSaving(false); return; }
      if (Notification.permission === 'denied') { setPermissionDenied(true); setSaving(false); return; }

      await registerServiceWorker();
      let sub = await getExistingSubscription();
      if (!sub) sub = await subscribeToPush();
      if (!sub) { setPermissionDenied(true); setSaving(false); return; }

      await supabase.from('push_subscriptions').upsert(
        { user_id: user.id, subscription: sub.toJSON() },
        { onConflict: 'user_id' }
      );
    }

    const updated = { ...reminder, enabled };
    await persist(updated);
    setReminder(updated);
    setSaving(false);
  }

  async function handleField(field: 'reminder_time' | 'repeat', value: string) {
    const updated = { ...reminder, [field]: field === 'reminder_time' ? value + ':00' : value };
    setReminder(updated);
    await persist(updated);
  }

  const displayTime = reminder.reminder_time.slice(0, 5);

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ color: '#3D2C5C', mb: 2 }}>Reminder 🔔</Typography>

        {!supported && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: 12 }}>
            Push notifications aren't supported in this browser. Try Chrome or Safari on iOS 16.4+.
          </Alert>
        )}
        {permissionDenied && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: 12 }}>
            Notifications are blocked. Go to Settings → Notifications and allow this site.
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: reminder.enabled ? 2.5 : 0 }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#3D2C5C', fontWeight: 600 }}>Enable Reminder</Typography>
            <Typography variant="caption" sx={{ color: '#9A89B4' }}>
              {reminder.enabled ? "You'll be notified at the set time" : 'Tap to set a daily reminder'}
            </Typography>
          </Box>
          <Switch
            checked={reminder.enabled}
            onChange={e => { void handleToggle(e.target.checked); }}
            disabled={saving || !supported}
            color="success"
          />
        </Box>

        {reminder.enabled && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#9A89B4', fontWeight: 600, display: 'block', mb: 0.75 }}>Time</Typography>
              <input
                type="time"
                value={displayTime}
                onChange={e => { void handleField('reminder_time', e.target.value); }}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  border: '1.5px solid #D4C8F0', fontSize: 16, color: '#3D2C5C',
                  outline: 'none', background: '#F8F4FF', boxSizing: 'border-box',
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#9A89B4', fontWeight: 600, display: 'block', mb: 0.75 }}>Repeat</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={reminder.repeat}
                  onChange={e => { void handleField('repeat', e.target.value); }}
                  sx={{ borderRadius: 2, background: '#F8F4FF', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D4C8F0' } }}
                >
                  <MenuItem value="daily">Every Day</MenuItem>
                  <MenuItem value="weekdays">Weekdays only</MenuItem>
                  <MenuItem value="weekends">Weekends only</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Typography variant="caption" sx={{ color: '#BBA9D1', textAlign: 'center' }}>
              Notifications fire even when your phone is locked 🔒
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
