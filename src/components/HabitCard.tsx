import { Box, Card, CardContent, Chip, IconButton, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { useNavigate } from 'react-router-dom';
import { Habit } from '../types';
import { useHabits } from '../context/HabitsContext';

interface Props { habit: Habit; isCompleted: boolean; streak: number; }

export function HabitCard({ habit, isCompleted, streak }: Props) {
  const navigate = useNavigate();
  const { toggleCompletion } = useHabits();

  return (
    <Card sx={{
      mb: 1.5, cursor: 'pointer',
      border: `2px solid ${isCompleted ? `${habit.color}55` : 'transparent'}`,
      background: isCompleted ? `linear-gradient(135deg, ${habit.color}18 0%, ${habit.color}08 100%)` : '#FFFFFF',
      transition: 'all 0.2s ease',
      '&:active': { transform: 'scale(0.98)' },
    }} onClick={() => navigate(`/habit/${habit.id}`)}>
      <CardContent sx={{ p: '12px 14px !important', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 46, height: 46, borderRadius: '13px', background: `${habit.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {habit.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#3D2C5C', textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.65 : 1, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {habit.name}
          </Typography>
          {habit.description && (
            <Typography variant="caption" sx={{ color: '#9A89B4', lineHeight: 1.2, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {habit.description}
            </Typography>
          )}
        </Box>
        {streak > 0 && (
          <Chip size="small"
            icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: '14px !important', color: '#FF6B35 !important' }} />}
            label={streak}
            sx={{ backgroundColor: '#FFF0E8', color: '#FF6B35', fontWeight: 700, fontSize: 12, height: 26, flexShrink: 0 }}
          />
        )}
        <IconButton size="small"
          onClick={e => { e.stopPropagation(); void toggleCompletion(habit.id); }}
          sx={{ color: isCompleted ? habit.color : '#D8CFEA', flexShrink: 0, p: 0.5 }}>
          {isCompleted ? <CheckCircleRoundedIcon sx={{ fontSize: 30 }} /> : <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 30 }} />}
        </IconButton>
      </CardContent>
    </Card>
  );
}
