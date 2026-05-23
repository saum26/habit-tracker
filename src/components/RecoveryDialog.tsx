import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { format } from 'date-fns';
import { useHabits } from '../context/HabitsContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RecoveryDialog({ open, onClose }: Props) {
  const { habits, yesterdayCompletions, toggleCompletion, yesterday } = useHabits();

  const missedHabits = habits.filter(h => !yesterdayCompletions.has(h.id));
  const allCaughtUp = missedHabits.length === 0;
  const formattedDate = format(new Date(yesterday + 'T00:00:00'), 'EEEE, MMMM d');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
    >
      {/* Coloured header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #FFD54F 0%, #FFB300 100%)',
        px: 2.5, pt: 2.5, pb: 2,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
            Yesterday's Check-In 🌙
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            {formattedDate} · Grace period active
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff', mt: -0.5 }}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <DialogTitle sx={{ p: 0 }} />

      <DialogContent sx={{ px: 2.5, pb: 3, pt: 2 }}>
        {allCaughtUp ? (
          /* All done state */
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography sx={{ fontSize: 52, lineHeight: 1, mb: 1.5 }}>🎉</Typography>
            <Typography variant="h6" sx={{ color: '#3D2C5C', fontWeight: 700 }}>
              All caught up!
            </Typography>
            <Typography variant="body2" sx={{ color: '#9A89B4', mt: 0.75, mb: 2.5 }}>
              Your streaks are safe. Keep the momentum going today!
            </Typography>
            <Button variant="contained" onClick={onClose} sx={{ borderRadius: 3, px: 4 }}>
              Let's go! 🚀
            </Button>
          </Box>
        ) : (
          <>
            {/* Grace period notice */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              background: '#FFF8E1', border: '1px solid #FFD54F',
              borderRadius: 2, p: 1.25, mb: 2,
            }}>
              <AccessTimeRoundedIcon sx={{ color: '#FF8F00', fontSize: 16, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: '#E65100', fontWeight: 600, lineHeight: 1.4 }}>
                Complete before midnight tonight to preserve your streak
              </Typography>
            </Box>

            {/* Habit list */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {habits.map(h => {
                const done = yesterdayCompletions.has(h.id);
                return (
                  <Box
                    key={h.id}
                    onClick={() => { void toggleCompletion(h.id, yesterday); }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                      background: done ? '#F0FFF4' : '#FAFAFA',
                      border: `1.5px solid ${done ? '#95D5B2' : '#EDE7F6'}`,
                      borderRadius: 3, cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(156,137,184,0.15)' },
                      '&:active': { transform: 'scale(0.99)' },
                    }}
                  >
                    {/* Habit icon */}
                    <Box sx={{
                      width: 38, height: 38, borderRadius: '11px',
                      background: `${h.color}35`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                    }}>
                      {h.icon}
                    </Box>

                    {/* Name */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ color: '#3D2C5C', fontWeight: 600 }}>
                        {h.name}
                      </Typography>
                      {done && (
                        <Typography variant="caption" sx={{ color: '#2D6A4F', fontSize: 10 }}>
                          Marked as late check-in ✓
                        </Typography>
                      )}
                    </Box>

                    {/* Status */}
                    {done ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                        <Chip
                          label="Late ✓"
                          size="small"
                          sx={{ background: '#CAFFBF', color: '#2D6A4F', fontWeight: 700, height: 20, fontSize: 10, px: 0.25 }}
                        />
                        <CheckCircleRoundedIcon sx={{ color: '#95D5B2', fontSize: 22 }} />
                      </Box>
                    ) : (
                      <RadioButtonUncheckedRoundedIcon sx={{ color: '#C4B4DC', fontSize: 22, flexShrink: 0 }} />
                    )}
                  </Box>
                );
              })}
            </Box>

            <Typography variant="caption" sx={{ color: '#BBA9D1', display: 'block', textAlign: 'center', mt: 2 }}>
              Tap a habit to mark it · These count toward your streak 🔥
            </Typography>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
