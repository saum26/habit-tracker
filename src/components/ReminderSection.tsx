import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, MenuItem, Select, Switch, TextField, Typography } from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Reminder {
  id?: string;
  habit_id: string;
  user_id?: string;
  enabled: boolean;
  reminder_time: string;
  repeat: string;
}

const REPEAT_OPTIONS = [
  { value: 'daily',    label: 'Every Day' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekends', label: 'Weekends (Sat–Sun)' },
];

interface Props {
  habitId: string;
  habitName: string;
  habitIcon: string;
}

export function ReminderSection({ habitId, habitName, habitIcon }: Props) {
  const { user } = useAuth();
  const [reminder, setReminder] = useState<Reminder>({
    habit_id: habitId,
    enabled: false,
    reminder_time: '09:00',
    repeat: 'daily',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from('habit_reminders')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          // reminder_time comes back as "HH:MM:SS", trim to "HH:MM"
          setReminder({ ...data, reminder_time: (data.reminder_time as string).slice(0, 5) });
        }
      });
  }, [habitId, user]);

  async function handleToggle() {
    const newEnabled = !reminder.enabled;
    if (newEnabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
    }
    setReminder(prev => ({ ...prev, enabled: newEnabled }));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await supabase.from('habit_reminders').upsert(
      { ...reminder, user_id: user.id, habit_id: habitId },
      { onConflict: 'habit_id,user_id' },
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Format time for display
  const [h, m] = reminder.reminder_time.split(':').map(Number);
  const displayTime = `${((h % 12) || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <NotificationsNoneRoundedIcon sx={{ color: '#9C89B8' }} />
          <Typography variant="h6" sx={{ color: '#3D2C5C' }}>Reminder</Typography>
        </Box>

        {/* Enable toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#5C4C7A', fontWeight: 500 }}>Enable Reminder</Typography>
          <Switch
            checked={reminder.enabled}
            onChange={() => { void handleToggle(); }}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#9C89B8' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#9C89B8' },
            }}
          />
        </Box>

        {reminder.enabled && (
          <>
            {/* Time picker */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#9A89B4', fontWeight: 600, display: 'block', mb: 0.75 }}>
                Time
              </Typography>
              <TextField
                type="time"
                value={reminder.reminder_time}
                onChange={e => setReminder(prev => ({ ...prev, reminder_time: e.target.value }))}
                size="small"
                fullWidth
                sx={{ '& input': { fontWeight: 600, color: '#3D2C5C' } }}
              />
            </Box>

            {/* Repeat picker */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#9A89B4', fontWeight: 600, display: 'block', mb: 0.75 }}>
                Repeat
              </Typography>
              <Select
                value={reminder.repeat}
                onChange={e => setReminder(prev => ({ ...prev, repeat: e.target.value }))}
                size="small"
                fullWidth
              >
                {REPEAT_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </Box>
          </>
        )}

        {permissionDenied && (
          <Typography variant="caption" sx={{ color: '#FF6B35', display: 'block', mb: 1.5 }}>
            Notifications are blocked. Enable them in your browser settings and try again.
          </Typography>
        )}

        <Typography variant="caption" sx={{ color: '#BBA9D1', display: 'block', mb: 2, lineHeight: 1.5 }}>
          {reminder.enabled
            ? `You'll receive a notification at ${displayTime} to complete ${habitIcon} ${habitName}.`
            : 'Enable to get reminded to complete this habit.'}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={() => { void handleSave(); }}
          disabled={saving}
          sx={{ borderRadius: 3, py: 1.25 }}
        >
          {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Reminder'}
        </Button>
      </CardContent>
    </Card>
  );
}
