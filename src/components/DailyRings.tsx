import { Box, Typography } from '@mui/material';
import { Habit } from '../types';

interface Props { habits: Habit[]; completedCount: number; }

export function DailyRings({ habits, completedCount }: Props) {
  const total = habits.length;
  const allClosed = total > 0 && completedCount >= total;
  const SIZE = 112, STROKE = 10;
  const radius = (SIZE - STROKE * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (total > 0 ? completedCount / total : 0));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFE0F4" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <circle cx={SIZE/2} cy={SIZE/2} r={radius} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={STROKE} />
          {total > 0 && (
            <circle cx={SIZE/2} cy={SIZE/2} r={radius} fill="none" stroke="url(#ringGrad)"
              strokeWidth={STROKE} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }}
            />
          )}
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {allClosed ? (
            <Typography sx={{ fontSize: 30, lineHeight: 1 }}>🎉</Typography>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1 }}>{completedCount}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>/ {total}</Typography>
            </>
          )}
        </Box>
      </Box>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: 12 }}>
        {total === 0 ? 'Add habits to get started' : allClosed ? 'All rings closed! ✨' : `${total - completedCount} habit${total - completedCount !== 1 ? 's' : ''} left today`}
      </Typography>
    </Box>
  );
}
