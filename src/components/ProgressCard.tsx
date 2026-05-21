import { Box, Card, CardContent, Typography } from '@mui/material';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { WeeklyData } from '../types';

interface Props { weeklyData: WeeklyData[]; }

export function ProgressCard({ weeklyData }: Props) {
  const weekTotal = weeklyData.reduce((s, d) => s + d.completed, 0);
  const weekMax = weeklyData.reduce((s, d) => s + d.total, 0);
  const weekPct = weekMax > 0 ? Math.round((weekTotal / weekMax) * 100) : 0;
  const todayIndex = weeklyData.length - 1;

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
          <BarChart data={weeklyData} barSize={26} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9A89B4' }} axisLine={false} tickLine={false} />
            <Tooltip cursor={false}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
              formatter={(value, _name, props: any) => [`${value} / ${props.payload?.total ?? 0}`, 'Done']}
            />
            <Bar dataKey="completed" radius={[6, 6, 3, 3]}>
              {weeklyData.map((entry, i) => (
                <Cell key={i} fill={entry.total > 0 && entry.completed >= entry.total ? '#9C89B8' : i === todayIndex ? '#C4B4DC' : '#EDE7F6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
