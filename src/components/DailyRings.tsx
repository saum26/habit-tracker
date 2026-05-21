import { Box, Typography } from '@mui/material';
import { Habit } from '../types';

interface Props { habits: Habit[]; completedCount: number; }

export function DailyRings({ habits, completedCount }: Props) {
  const total = habits.length;
  const allClosed = total > 0 && completedCount >= total;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const SIZE = 130, STROKE = 13;
  const radius = (SIZE - STROKE * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (total > 0 ? completedCount / total : 0));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <Box sx={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="ringGradCard" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9C89B8" />
              <stop offset="100%" stopColor="#F0A6CA" />
            </linearGradient>
          </defs>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={radius} fill="none" stroke="#EDE7F6" strokeWidth={STROKE} />
          {total > 0 && (
            <circle cx={SIZE / 2} cy={SIZE / 2} r={radius} fill="none" stroke="url(#ringGradCard)"
              strokeWidth={STROKE} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }}
            />
          )}
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {allClosed ? (
            <Typography sx={{ fontSize: 32, lineHeight: 1 }}>🎉</Typography>
          ) : (
            <>
              <Typography sx={{ fontWeight: 800, color: '#3D2C5C', fontSize: 26, lineHeight: 1 }}>{pct}%</Typography>
              <Typography variant="caption" sx={{ color: '#9A89B4', fontSize: 10 }}>done</Typography>
            </>
          )}
        </Box>
      </Box>
      <Typography variant="caption" sx={{ color: allClosed ? '#9C89B8' : '#9A89B4', fontWeight: 600, fontSize: 10, textAlign: 'center', mt: 0.5 }}>
        {total === 0 ? 'Add habits to start' : allClosed ? 'All rings closed! ✨' : `${completedCount} / ${total} habits`}
      </Typography>
    </Box>
  );
}
