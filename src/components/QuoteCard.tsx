import { Card, CardContent, Typography } from '@mui/material';
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

export function QuoteCard() {
  const quote = useMemo(() => QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length], []);
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
