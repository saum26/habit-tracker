import { useMemo, useState } from 'react';
import { Box, Fab, Skeleton, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitsContext';
import { BottomNav } from '../components/BottomNav';
import { HabitCard } from '../components/HabitCard';
import { ProgressCard } from '../components/ProgressCard';
import { QuoteCard } from '../components/QuoteCard';
import { DailyRings } from '../components/DailyRings';
import { AddHabitDialog } from '../components/AddHabitDialog';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomePage() {
  const { profile } = useAuth();
  const { habits, todayCompletions, getWeeklyData, getHabitStats, loading } = useHabits();
  const [addOpen, setAddOpen] = useState(false);

  const weeklyData = useMemo(() => getWeeklyData(), [getWeeklyData]);
  const completedCount = habits.filter(h => todayCompletions.has(h.id)).length;
  const firstName = profile?.display_name?.split(' ')[0] ?? 'Friend';

  return (
    <Box sx={{ minHeight: '100vh', background: '#F8F4FF', pb: '90px' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #9C89B8 0%, #C0A8D8 55%, #F0A6CA 100%)', pt: { xs: 7, sm: 8 }, pb: 3.5, px: 2.5 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: 13 }}>
          {format(new Date(), 'EEEE, MMMM d')}
        </Typography>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mt: 0.25, mb: 3 }}>
          {getGreeting()}, {firstName} 👋
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <DailyRings habits={habits} completedCount={completedCount} />
        </Box>
      </Box>

      <Box sx={{ px: 2, mt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <QuoteCard />
        <ProgressCard weeklyData={weeklyData} />
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="h6" sx={{ color: '#3D2C5C' }}>Today's Habits</Typography>
            {!loading && habits.length > 0 && (
              <Typography variant="caption" sx={{ color: '#9A89B4', fontWeight: 600 }}>{completedCount}/{habits.length} done</Typography>
            )}
          </Box>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rounded" height={70} sx={{ mb: 1.5, borderRadius: '20px' }} />)
          ) : habits.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5, background: '#fff', borderRadius: '20px', boxShadow: '0 2px 16px rgba(156,137,184,0.1)' }}>
              <Typography sx={{ fontSize: 44, mb: 1.5 }}>🌱</Typography>
              <Typography variant="body1" sx={{ color: '#9A89B4', fontWeight: 500 }}>No habits yet</Typography>
              <Typography variant="body2" sx={{ color: '#BBA9D1', mt: 0.5 }}>Tap the + button to add your first one</Typography>
            </Box>
          ) : (
            habits.map(habit => (
              <HabitCard key={habit.id} habit={habit} isCompleted={todayCompletions.has(habit.id)} streak={getHabitStats(habit.id).current_streak} />
            ))
          )}
        </Box>
      </Box>

      <Fab onClick={() => setAddOpen(true)} sx={{ position: 'fixed', bottom: 88, right: 20 }}>
        <AddRoundedIcon />
      </Fab>
      <AddHabitDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <BottomNav />
    </Box>
  );
}
