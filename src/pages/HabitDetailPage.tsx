import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, CircularProgress, Divider, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useHabits } from '../context/HabitsContext';
import { CalendarTracker } from '../components/CalendarTracker';
import { ReminderSection } from '../components/ReminderSection';
import { HabitCompletion, HabitNote } from '../types';

const TIPS: Record<string, string[]> = {
  '💧': ['Keep a water bottle on your desk', 'Set hourly reminders', 'Track with a rubber band on your wrist'],
  '🏃': ['Lay out your workout clothes the night before', 'Start with just 10 minutes', 'Find a workout buddy'],
  '📚': ['Keep your book on your pillow', 'Read during lunch breaks', 'Set a daily page goal'],
  '🧘': ['Use a guided app like Headspace', 'Start with 5 minutes', 'Same time every day builds the cue'],
  '🌙': ['Set a phone-down alarm 30 min before bed', 'Keep your room cool and dark', 'Avoid caffeine after 2 pm'],
};

function getTips(icon: string) {
  return TIPS[icon] ?? ['Start small and build up gradually', 'Pair it with an existing habit', 'Track progress to stay motivated'];
}

export function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { habits, todayCompletions, toggleCompletion, getHabitCompletions, getHabitStats, addNote, getNotes, deleteHabit } = useHabits();

  const habit = habits.find(h => h.id === id);
  const [allCompletions, setAllCompletions] = useState<HabitCompletion[]>([]);
  const [notes, setNotes] = useState<HabitNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadingData(true);
    void Promise.all([getHabitCompletions(id), getNotes(id)]).then(([comps, nts]) => {
      setAllCompletions(comps);
      setNotes(nts);
    }).finally(() => setLoadingData(false));
  }, [id]);

  if (!habit) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#9C89B8' }} />
      </Box>
    );
  }

  const isCompleted = todayCompletions.has(habit.id);
  const stats = getHabitStats(habit.id, allCompletions);
  const completedDates = new Set(allCompletions.map(c => c.completed_date));
  const tips = getTips(habit.icon);

  async function handleAddNote() {
    if (!newNote.trim() || !habit) return;
    setSavingNote(true);
    const note = await addNote(habit.id, newNote.trim());
    if (note) setNotes(prev => [note, ...prev]);
    setNewNote('');
    setSavingNote(false);
  }

  async function handleDelete() {
    if (!habit) return;
    if (!confirm(`Delete "${habit.name}"? This cannot be undone.`)) return;
    await deleteHabit(habit.id);
    navigate('/');
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#F8F4FF', pb: 5 }}>
      <Box sx={{ background: `linear-gradient(135deg, ${habit.color}CC 0%, ${habit.color}88 100%)`, pt: { xs: 7, sm: 8 }, pb: 3, px: 2, position: 'relative' }}>
        <IconButton onClick={() => navigate('/')} sx={{ position: 'absolute', top: 52, left: 8, color: '#fff', background: 'rgba(255,255,255,0.2)' }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Tooltip title="Delete habit">
          <IconButton onClick={() => { void handleDelete(); }} sx={{ position: 'absolute', top: 52, right: 8, color: '#fff', background: 'rgba(255,255,255,0.2)' }}>
            <DeleteRoundedIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography sx={{ fontSize: 52, lineHeight: 1, mb: 1 }}>{habit.icon}</Typography>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>{habit.name}</Typography>
          {habit.description && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>{habit.description}</Typography>}
        </Box>
      </Box>

      <Box sx={{ px: 2, mt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button variant="contained" size="large" fullWidth
          startIcon={isCompleted ? <CheckCircleRoundedIcon /> : <RadioButtonUncheckedRoundedIcon />}
          onClick={() => { void toggleCompletion(habit.id); }}
          sx={{ py: 1.8, fontSize: '1rem', background: isCompleted ? `linear-gradient(135deg, ${habit.color}BB 0%, ${habit.color}88 100%)` : 'linear-gradient(135deg, #9C89B8 0%, #B89CC8 100%)' }}>
          {isCompleted ? 'Completed today ✓' : 'Mark as Done'}
        </Button>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ color: '#3D2C5C', mb: 2 }}>Stats</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {[
                { icon: <LocalFireDepartmentRoundedIcon sx={{ color: '#FF6B35', fontSize: 22 }} />, label: 'Current streak', value: `${stats.current_streak}d` },
                { icon: <EmojiEventsRoundedIcon sx={{ color: '#FFB800', fontSize: 22 }} />, label: 'Longest streak', value: `${stats.longest_streak}d` },
                { icon: <TrendingUpRoundedIcon sx={{ color: '#9C89B8', fontSize: 22 }} />, label: '30-day rate', value: `${stats.success_rate}%` },
                { icon: <CheckCircleRoundedIcon sx={{ color: '#95D5B2', fontSize: 22 }} />, label: 'Total done', value: stats.total_completions },
              ].map(({ icon, label, value }) => (
                <Box key={label} sx={{ background: '#F8F4FF', borderRadius: 3, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0.5 }}>
                  {icon}
                  <Typography variant="h6" sx={{ color: '#3D2C5C', fontWeight: 700, lineHeight: 1, mt: 0.5 }}>{value}</Typography>
                  <Typography variant="caption" sx={{ color: '#9A89B4', lineHeight: 1.3 }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ color: '#3D2C5C', mb: 2 }}>History</Typography>
            {loadingData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} sx={{ color: '#9C89B8' }} /></Box>
            ) : (
              <CalendarTracker completedDates={completedDates} habitColor={habit.color} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ color: '#3D2C5C', mb: 1.5 }}>Tips 💡</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tips.map((tip, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Chip label={i + 1} size="small" sx={{ background: `${habit.color}40`, color: '#3D2C5C', fontWeight: 700, minWidth: 28, height: 24 }} />
                  <Typography variant="body2" sx={{ color: '#5C4C7A', pt: 0.25, lineHeight: 1.5 }}>{tip}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        <ReminderSection habitId={habit.id} habitName={habit.name} habitIcon={habit.icon} />

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ color: '#3D2C5C', mb: 1.5 }}>Notes</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField fullWidth size="small" value={newNote} onChange={e => setNewNote(e.target.value)}
                placeholder="Add a note for today…"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) void handleAddNote(); }}
              />
              <Button variant="contained" onClick={() => { void handleAddNote(); }} disabled={!newNote.trim() || savingNote} sx={{ minWidth: 72, flexShrink: 0 }}>Add</Button>
            </Box>
            {notes.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#BBA9D1', textAlign: 'center', py: 2 }}>No notes yet</Typography>
            ) : notes.map((note, i) => (
              <Box key={note.id}>
                {i > 0 && <Divider sx={{ my: 1.5 }} />}
                <Typography variant="caption" sx={{ color: '#9A89B4', fontWeight: 600 }}>
                  {format(new Date(note.note_date + 'T00:00:00'), 'MMM d, yyyy')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#3D2C5C', mt: 0.25 }}>{note.note}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
