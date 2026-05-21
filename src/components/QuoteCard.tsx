import { Box, Card, CardContent, Typography } from '@mui/material';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import { useMemo } from 'react';

const QUOTES = [
  { text: 'Small steps every day lead to big results.', author: 'Unknown' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: "You don't have to be great to start, but you have to start to be great.", author: 'Zig Ziglar' },
  { text: 'Motivation is what gets you started. Habit is what keeps you going.', author: 'Jim Ryun' },
  { text: 'We are what we repeatedly do. Excellence is not an act, but a habit.', author: 'Aristotle' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
  { text: 'It does not matter how slowly you go, as long as you do not stop.', author: 'Confucius' },
  { text: 'Your future is created by what you do today, not tomorrow.', author: 'Robert Kiyosaki' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
];

interface Props { compact?: boolean; }

export function QuoteCard({ compact }: Props) {
  const quote = useMemo(() => QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length], []);

  if (compact) {
    return (
      <Card sx={{ height: '100%', background: 'linear-gradient(145deg, #F5F0FF 0%, #FFF0F8 100%)', position: 'relative', overflow: 'hidden' }}>
        <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <FormatQuoteRoundedIcon sx={{ fontSize: 22, color: '#9C89B8', opacity: 0.7, mb: 0.5 }} />
          <Typography sx={{ fontWeight: 500, lineHeight: 1.55, color: '#3D2C5C', fontSize: '0.75rem', flex: 1 }}>
            {quote.text}
          </Typography>
          <Typography variant="caption" sx={{ color: '#9A89B4', fontSize: 10, mt: 0.75 }}>— {quote.author}</Typography>
          <Box sx={{ position: 'absolute', right: -4, bottom: -4, fontSize: 52, opacity: 0.15, lineHeight: 1, pointerEvents: 'none' }}>
            🌿
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ background: 'linear-gradient(135deg, #9C89B8 0%, #C4A8D4 55%, #F0A6CA 100%)', color: '#fff' }}>
      <CardContent sx={{ p: 2.5 }}>
        <FormatQuoteRoundedIcon sx={{ fontSize: 30, opacity: 0.65, mb: 0.5 }} />
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.65, mb: 1, fontSize: '0.93rem' }}>
          {quote.text}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>— {quote.author}</Typography>
      </CardContent>
    </Card>
  );
}
