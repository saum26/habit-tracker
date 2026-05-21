import { Box, Card, CardContent, Typography } from '@mui/material';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { WeeklyData } from '../types';

interface Props { weeklyData: WeeklyData[]; compact?: boolean; }

export function ProgressCard({ weeklyData, compact }: Props) {
  const weekTotal = weeklyData.reduce((s, d) => s + d.completed, 0);
  const weekMax = weeklyData.reduce((s, d) => s + d.total, 0);
  const weekPct = weekMax > 0 ? Math.round((weekTotal / weekMax) * 100) : 0;

  const lineData = weeklyData.map(d => ({
    ...d,
    rate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
  }));

  if (compact) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <Typography variant="caption" sx={{ color: '#9A89B4', fontWeight: 700, fontSize: 9, letterSpacing: 0.5 }}>WEEKLY PROGRESS</Typography>
          <Typography sx={{ color: '#9C89B8', fontWeight: 800, fontSize: 28, lineHeight: 1, mt: 0.5 }}>{weekPct}%</Typography>
          <Typography variant="caption" sx={{ color: '#9A89B4', fontSize: 10 }}>Overall Progress</Typography>
          <Box sx={{ flex: 1, mt: 1.5, minHeight: 70 }}>
            <ResponsiveContainer width="100%" height={70}>
              <LineChart data={lineData} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9A89B4' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={false}
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 11 }}
                  formatter={(value) => [`${value}%`, 'Done']}
                />
                <Line type="monotone" dataKey="rate" stroke="#9C89B8" strokeWidth={2}
                  dot={{ fill: '#9C89B8', r: 2.5 }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 2.5, pb: '16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#3D2C5C' }}>This Week</Typography>
            <Typography variant="caption" sx={{ color: '#9A89B4' }}>{weekTotal} / {weekMax} completed</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" sx={{ color: '#9C89B8', fontWeight: 700, lineHeight: 1 }}>{weekPct}%</Typography>
            <Typography variant="caption" sx={{ color: '#9A89B4' }}>completion</Typography>
          </Box>
        </Box>
        <ResponsiveContainer width="100%" height={88}>
          <LineChart data={lineData} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9A89B4' }} axisLine={false} tickLine={false} />
            <Tooltip cursor={false}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
              formatter={(value) => [`${value}%`, 'Done']}
            />
            <Line type="monotone" dataKey="rate" stroke="#9C89B8" strokeWidth={2.5}
              dot={{ fill: '#9C89B8', r: 4 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
