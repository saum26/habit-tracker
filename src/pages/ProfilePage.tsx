import { useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitsContext';
import { BottomNav } from '../components/BottomNav';
import { supabase } from '../lib/supabase';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { habits, completions, getHabitStats } = useHabits();
  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);

  const totalCompletions = completions.length;
  const longestStreak = habits.reduce((max, h) => Math.max(max, getHabitStats(h.id).longest_streak), 0);
  const bestHabit = habits.length > 0
    ? habits.reduce((best, h) => getHabitStats(h.id).success_rate > getHabitStats(best.id).success_rate ? h : best, habits[0]!)
    : null;

  async function handleSaveName() {
    if (!newName.trim() || !user) return;
    setSaving(true);
    await supabase.from('profiles').update({ display_name: newName.trim() }).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setEditOpen(false);
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#F8F4FF', pb: '90px' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #9C89B8 0%, #C0A8D8 55%, #F0A6CA 100%)', pt: { xs: 7, sm: 8 }, pb: 4, px: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: profile?.avatar_color ?? '#9C89B8', width: 80, height: 80, fontSize: 28, fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', mb: 1.5 }}>
          {getInitials(profile?.display_name ?? 'U')}
        </Avatar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>{profile?.display_name}</Typography>
          <EditRoundedIcon onClick={() => { setNewName(profile?.display_name ?? ''); setEditOpen(true); }} sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, cursor: 'pointer' }} />
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.25 }}>{user?.email}</Typography>
      </Box>

      <Box sx={{ px: 2, mt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ color: '#3D2C5C', mb: 2 }}>My Stats</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
              {[
                { emoji: '✅', label: 'Total done', value: totalCompletions },
                { emoji: '🔥', label: 'Best streak', value: `${longestStreak}d` },
                { emoji: '🎯', label: 'Habits', value: habits.length },
              ].map(({ emoji, label, value }) => (
                <Box key={label} sx={{ background: '#F8F4FF', borderRadius: 3, p: 1.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 24, mb: 0.25 }}>{emoji}</Typography>
                  <Typography variant="h6" sx={{ color: '#3D2C5C', fontWeight: 700, lineHeight: 1 }}>{value}</Typography>
                  <Typography variant="caption" sx={{ color: '#9A89B4' }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {bestHabit && (
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ color: '#3D2C5C', mb: 1.5 }}>Top Habit 🏆</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '13px', background: `${bestHabit.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {bestHabit.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: '#3D2C5C' }}>{bestHabit.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip size="small" icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: '13px !important', color: '#FF6B35 !important' }} />}
                      label={`${getHabitStats(bestHabit.id).current_streak}d streak`}
                      sx={{ background: '#FFF0E8', color: '#FF6B35', fontWeight: 600, height: 22 }} />
                    <Chip size="small" icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: '#9C89B8 !important' }} />}
                      label={`${getHabitStats(bestHabit.id).success_rate}% rate`}
                      sx={{ background: '#F5F0FF', color: '#9C89B8', fontWeight: 600, height: 22 }} />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ color: '#3D2C5C', mb: 1.5 }}>All Habits</Typography>
            {habits.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#9A89B4' }}>No habits yet</Typography>
            ) : habits.map(h => (
              <Box key={h.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid #F0EAF8', '&:last-child': { borderBottom: 'none' } }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: `${h.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {h.icon}
                </Box>
                <Typography variant="body2" sx={{ color: '#3D2C5C', flex: 1 }}>{h.name}</Typography>
                <Typography variant="caption" sx={{ color: '#9A89B4', fontWeight: 600 }}>🔥 {getHabitStats(h.id).current_streak}d</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>

        <Button variant="outlined" color="error" fullWidth startIcon={<LogoutRoundedIcon />} onClick={() => { void signOut(); }} sx={{ mt: 1, borderRadius: 3, py: 1.5 }}>
          Sign Out
        </Button>
      </Box>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Name</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Display name" value={newName} onChange={e => setNewName(e.target.value)} sx={{ mt: 1 }} autoFocus />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={() => { void handleSaveName(); }} disabled={!newName.trim() || saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <BottomNav />
    </Box>
  );
}
