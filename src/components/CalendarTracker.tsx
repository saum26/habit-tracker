import { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, startOfMonth, subMonths } from 'date-fns';

interface Props { completedDates: Set<string>; habitColor: string; }

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CalendarTracker({ completedDates, habitColor }: Props) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const today = format(new Date(), 'yyyy-MM-dd');
  const monthStart = startOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(viewMonth) });
  const startPad = getDay(monthStart);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <IconButton size="small" onClick={() => setViewMonth(m => subMonths(m, 1))}><ChevronLeftRoundedIcon /></IconButton>
        <Typography variant="subtitle1" sx={{ color: '#3D2C5C' }}>{format(viewMonth, 'MMMM yyyy')}</Typography>
        <IconButton size="small" onClick={() => setViewMonth(m => addMonths(m, 1))}><ChevronRightRoundedIcon /></IconButton>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
        {DOW.map(d => (
          <Typography key={d} variant="caption" sx={{ textAlign: 'center', color: '#9A89B4', fontWeight: 600, fontSize: 11 }}>{d}</Typography>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {Array.from({ length: startPad }).map((_, i) => <Box key={`p${i}`} />)}
        {days.map(day => {
          const ds = format(day, 'yyyy-MM-dd');
          const done = completedDates.has(ds);
          const isToday = ds === today;
          return (
            <Box key={ds} sx={{
              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px',
              background: done ? habitColor : isToday ? `${habitColor}28` : 'transparent',
              border: isToday && !done ? `2px solid ${habitColor}70` : '2px solid transparent',
              opacity: ds > today ? 0.3 : 1,
            }}>
              <Typography sx={{ fontSize: 11, fontWeight: isToday || done ? 700 : 400, color: done ? '#fff' : isToday ? habitColor : '#5C4C7A', lineHeight: 1 }}>
                {format(day, 'd')}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
