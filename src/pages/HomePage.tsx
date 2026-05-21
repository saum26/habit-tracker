import { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Card, CardContent, Chip, Fab, IconButton, LinearProgress, Skeleton, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import { format, subDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitsContext';
import { BottomNav } from '../components/BottomNav';
import { ProgressCard } from '../components/ProgressCard';
import { QuoteCard } from '../components/QuoteCard';
import { DailyRings } from '../components/DailyRings';
import { AddHabitDialog } from '../components/AddHabitDialog';
import { supabase } from '../lib/supabase';
import { LeaderboardEntry } from '../types';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomePage() {
  const { profile, user } = useAuth();
  const { habits, completions, todayCompletions, getWeeklyData, getHabitStats, loading } = useHabits();
  const [addOpen, setAddOpen] = useState(false);
  const [topPerformers, setTopPerformers] = useState<LeaderboardEntry[]>([]);
  const navigate = useNavigate();

  const weeklyData = useMemo(() => getWeeklyData(), [getWeeklyData]);
  const completedCount = habits.filter(h => todayCompletions.has(h.id)).length;
  const firstName = profile?.display_name?.split(' ')[0] ?? 'Friend';
  const longestStreak = habits.reduce((max, h) => Math.max(max, getHabitStats(h.id).current_streak), 0);

  // Last 5 days for habit dot indicators
  const last5Days = useMemo(
    () => Array.from({ length: 5 }, (_, i) => format(subDays(new Date(), 4 - i), 'yyyy-MM-dd')),
    [],
  );

  // Challenges derived from real data
  const avgSuccessRate = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + getHabitStats(h.id).success_rate, 0) / habits.length)
    : 0;

  const challenges = [
    { emoji: '🌟', title: '7-Day Streak', desc: 'Keep a streak going for 7 days', current: Math.min(longestStreak, 7), total: 7, color: '#FFB800' },
    { emoji: '✅', title: 'Daily Goals', desc: 'Complete all habits today', current: completedCount, total: Math.max(habits.length, 1), color: '#9C89B8' },
    { emoji: '📈', title: '30-Day Rate', desc: 'Hit 80% monthly success', current: avgSuccessRate, total: 100, color: '#F0A6CA', isPercent: true },
  ];

  useEffect(() => {
    void supabase.rpc('get_leaderboard').then(({ data }) => {
      if (data) {
        setTopPerformers(
          (data as Omit<LeaderboardEntry, 'rank'>[])
            .slice(0, 3)
            .map((e, i) => ({ ...e, rank: i + 1 })),
        );
      }
    });
  }, [user]);

  return (
    <Box sx={{ minHeight: '100vh', background: '#F8F4FF', pb: '90px' }}>

      {/* Top Bar */}
      <Box sx={{
        background: '#fff',
        px: 2.5,
        pt: { xs: 5.5, sm: 6 },
        pb: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 0 rgba(156,137,184,0.12)',
      }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#9A89B4', fontSize: 11 }}>
            {format(new Date(), 'EEEE, MMMM d')}
          </Typography>
          <Typography variant="h6" sx={{ color: '#3D2C5C', fontWeight: 700, lineHeight: 1.25 }}>
            {getGreeting()}, {firstName} 👋
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: '#BBA9D1' }}>
            <NotificationsNoneRoundedIcon />
          </IconButton>
          <Avatar
            onClick={() => navigate('/profile')}
            sx={{ bgcolor: profile?.avatar_color ?? '#9C89B8', width: 36, height: 36, fontSize: 13, fontWeight: 700, cursor: 'pointer', ml: 0.5 }}>
            {getInitials(profile?.display_name ?? 'U')}
          </Avatar>
        </Box>
      </Box>

      <Box sx={{ px: 2, mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Daily Rings + Today's Habits */}
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: '#BBA9D1', fontWeight: 600, fontSize: 10, letterSpacing: 0.4 }}>
              {format(new Date(), 'MMM d, yyyy').toUpperCase()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1.5, alignItems: 'flex-start' }}>
              <DailyRings habits={habits} completedCount={completedCount} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                  <Typography variant="subtitle2" sx={{ color: '#3D2C5C', fontWeight: 700 }}>Today's Habits</Typography>
                  <Typography variant="caption"
                    onClick={() => setAddOpen(true)}
                    sx={{ color: '#9C89B8', fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>
                    + Add
                  </Typography>
                </Box>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} height={22} sx={{ mb: 0.75, borderRadius: 2 }} />
                  ))
                  : habits.length === 0
                    ? <Typography variant="caption" sx={{ color: '#BBA9D1' }}>No habits yet — tap + Add</Typography>
                    : habits.slice(0, 5).map(h => {
                      const completedDays = new Set(
                        completions.filter(c => c.habit_id === h.id).map(c => c.completed_date),
                      );
                      return (
                        <Box key={h.id}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.9, cursor: 'pointer' }}
                          onClick={() => navigate(`/habit/${h.id}`)}>
                          <Typography sx={{ fontSize: 13, width: 18, flexShrink: 0 }}>{h.icon}</Typography>
                          <Typography variant="caption" sx={{ flex: 1, color: '#3D2C5C', fontWeight: 500, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {h.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.4, flexShrink: 0 }}>
                            {last5Days.map((d, i) => (
                              <Box key={i} sx={{ width: 7, height: 7, borderRadius: '50%', background: completedDays.has(d) ? h.color : '#EDE7F6', transition: 'background 0.2s' }} />
                            ))}
                          </Box>
                        </Box>
                      );
                    })}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
          {[
            { emoji: '🎯', label: 'Habits', value: habits.length },
            { emoji: '🔥', label: 'Day Streak', value: `${longestStreak}d` },
            { emoji: '✅', label: 'Done Today', value: completedCount },
          ].map(({ emoji, label, value }) => (
            <Card key={label}>
              <CardContent sx={{ p: '14px !important', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 20, lineHeight: 1, mb: 0.5 }}>{emoji}</Typography>
                <Typography sx={{ color: '#3D2C5C', fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{value}</Typography>
                <Typography variant="caption" sx={{ color: '#9A89B4', fontSize: 10 }}>{label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Weekly Progress + Quote side by side */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, alignItems: 'stretch' }}>
          <ProgressCard weeklyData={weeklyData} compact />
          <QuoteCard compact />
        </Box>

        {/* Top Performers */}
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ color: '#3D2C5C', fontWeight: 700 }}>Top Performers</Typography>
              <Typography variant="caption"
                onClick={() => navigate('/leaderboard')}
                sx={{ color: '#9C89B8', fontWeight: 600, cursor: 'pointer' }}>
                View Leaderboard
              </Typography>
            </Box>
            {topPerformers.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, background: '#F5F0FF', borderRadius: 3 }}>
                <Avatar sx={{ bgcolor: profile?.avatar_color ?? '#9C89B8', width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>
                  {getInitials(profile?.display_name ?? 'U')}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#3D2C5C' }}>{profile?.display_name} (you)</Typography>
                  <Typography variant="caption" sx={{ color: '#9A89B4' }}>{completedCount}/{habits.length} today</Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ color: '#9C89B8', fontWeight: 700 }}>
                  {habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0}%
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {topPerformers.map((entry, i) => {
                  const isMe = entry.user_id === user?.id;
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <Box key={entry.user_id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, background: isMe ? '#F5F0FF' : '#FAFAFA', borderRadius: 3, border: isMe ? '1.5px solid #D4C8F0' : '1.5px solid transparent' }}>
                      <Typography sx={{ fontSize: 18, width: 24, textAlign: 'center' }}>{medals[i]}</Typography>
                      <Avatar sx={{ bgcolor: entry.avatar_color, width: 32, height: 32, fontSize: 11, fontWeight: 700 }}>
                        {getInitials(entry.display_name)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#3D2C5C', fontWeight: 700, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {entry.display_name}{isMe ? ' (you)' : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9A89B4', fontSize: 10 }}>
                          {entry.habits_done_today}/{entry.total_habits} today
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#9C89B8', fontWeight: 700, fontSize: 13 }}>
                          {entry.completion_percentage}%
                        </Typography>
                        {entry.rings_closed_today && (
                          <Chip label="🔥" size="small" sx={{ height: 18, fontSize: 10, background: '#FFF0E8', px: 0 }} />
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Active Challenges */}
        {!loading && habits.length > 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#3D2C5C', fontWeight: 700, mb: 1.25 }}>
              Active Challenges
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5, mx: -2, px: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
              {challenges.map(c => (
                <Card key={c.title} sx={{ minWidth: 155, flexShrink: 0 }}>
                  <CardContent sx={{ p: '14px !important' }}>
                    <Typography sx={{ fontSize: 24, lineHeight: 1, mb: 0.75 }}>{c.emoji}</Typography>
                    <Typography variant="subtitle2" sx={{ color: '#3D2C5C', fontWeight: 700, lineHeight: 1.2, mb: 0.25 }}>
                      {c.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9A89B4', display: 'block', mb: 1.25, fontSize: 10, lineHeight: 1.4 }}>
                      {c.desc}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((c.current / c.total) * 100, 100)}
                      sx={{ height: 5, borderRadius: 3, background: '#EDE7F6', '& .MuiLinearProgress-bar': { background: c.color, borderRadius: 3 } }}
                    />
                    <Typography variant="caption" sx={{ color: '#9A89B4', fontSize: 10, mt: 0.5, display: 'block' }}>
                      {c.isPercent ? `${c.current}% / ${c.total}%` : `${c.current} / ${c.total}`}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

      </Box>

      <Fab onClick={() => setAddOpen(true)} sx={{ position: 'fixed', bottom: 88, right: 20 }}>
        <AddRoundedIcon />
      </Fab>
      <AddHabitDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <BottomNav />
    </Box>
  );
}
