import { useEffect, useState } from 'react';
import { Avatar, Box, Card, CardContent, Chip, CircularProgress, LinearProgress, Typography } from '@mui/material';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { supabase } from '../lib/supabase';
import { LeaderboardEntry } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';

const RANK_COLORS = ['#FFB800', '#9E9E9E', '#CD7F32'];
const RANK_EMOJI = ['🥇', '🥈', '🥉'];
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_leaderboard');
      if (error) { setError(error.message); setLoading(false); return; }
      setEntries((data ?? []).map((e: Omit<LeaderboardEntry, 'rank'>, i: number) => ({ ...e, rank: i + 1 })));
      setLoading(false);
    }
    void load();
  }, [user]);

  return (
    <Box sx={{ minHeight: '100vh', background: '#F8F4FF', pb: '90px' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #9C89B8 0%, #C0A8D8 55%, #F0A6CA 100%)', pt: { xs: 7, sm: 8 }, pb: 3, px: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LeaderboardRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
        <Box>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1 }}>Leaderboard</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.25 }}>Who closed all their rings today?</Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2, mt: 2.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#9C89B8' }} /></Box>
        ) : error ? (
          <Card><CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ fontSize: 36, mb: 1 }}>⚠️</Typography>
            <Typography variant="body2" sx={{ color: '#9A89B4' }}>Leaderboard unavailable. Make sure the database function is set up.</Typography>
          </CardContent></Card>
        ) : entries.length === 0 ? (
          <Card><CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography sx={{ fontSize: 44, mb: 1.5 }}>🏆</Typography>
            <Typography variant="body1" sx={{ color: '#3D2C5C', fontWeight: 600 }}>No one on the board yet</Typography>
            <Typography variant="body2" sx={{ color: '#9A89B4', mt: 0.5 }}>Complete habits and invite friends to compete!</Typography>
          </CardContent></Card>
        ) : (
          <>
            {entries.length >= 3 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 1.5, mb: 2.5 }}>
                {([entries[1], entries[0], entries[2]] as LeaderboardEntry[]).map((entry, i) => {
                  const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                  const heights = [100, 130, 85];
                  return (
                    <Box key={entry.user_id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <Avatar sx={{ bgcolor: entry.avatar_color, width: actualRank === 1 ? 56 : 44, height: actualRank === 1 ? 56 : 44, fontSize: actualRank === 1 ? 20 : 16, fontWeight: 700, mb: 0.75 }}>
                        {getInitials(entry.display_name)}
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#3D2C5C', textAlign: 'center' }}>{entry.display_name.split(' ')[0]}</Typography>
                      <Typography variant="caption" sx={{ color: '#9A89B4' }}>{entry.completion_percentage}%</Typography>
                      <Box sx={{ width: '100%', height: heights[i], mt: 0.5, background: `linear-gradient(180deg, ${RANK_COLORS[actualRank - 1]}40 0%, ${RANK_COLORS[actualRank - 1]}20 100%)`, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: actualRank === 1 ? 28 : 22 }}>{RANK_EMOJI[actualRank - 1]}</Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {entries.map(entry => {
                const isMe = entry.user_id === user?.id;
                return (
                  <Card key={entry.user_id} sx={{ border: isMe ? '2px solid #9C89B8' : '2px solid transparent', background: isMe ? '#F5F0FF' : '#fff' }}>
                    <CardContent sx={{ p: 2, pb: '12px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Box sx={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                          {entry.rank <= 3 ? <Typography sx={{ fontSize: 20 }}>{RANK_EMOJI[entry.rank - 1]}</Typography> : <Typography variant="subtitle2" sx={{ color: '#9A89B4' }}>#{entry.rank}</Typography>}
                        </Box>
                        <Avatar sx={{ bgcolor: entry.avatar_color, width: 40, height: 40, fontWeight: 700, fontSize: 15 }}>{getInitials(entry.display_name)}</Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="subtitle2" sx={{ color: '#3D2C5C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {entry.display_name}{isMe && ' (you)'}
                            </Typography>
                            {entry.rings_closed_today && <Chip label="🔥 All done!" size="small" sx={{ background: '#FFF0E8', color: '#FF6B35', fontWeight: 700, height: 20, fontSize: 11 }} />}
                          </Box>
                          <Typography variant="caption" sx={{ color: '#9A89B4' }}>{entry.habits_done_today}/{entry.total_habits} today</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography variant="subtitle2" sx={{ color: '#9C89B8', fontWeight: 700 }}>{entry.completion_percentage}%</Typography>
                          <EmojiEventsRoundedIcon sx={{ fontSize: 14, color: '#C0B0D8' }} />
                        </Box>
                      </Box>
                      <LinearProgress variant="determinate" value={Number(entry.completion_percentage)}
                        sx={{ height: 6, borderRadius: 3, backgroundColor: '#EDE7F6', '& .MuiLinearProgress-bar': { background: entry.rings_closed_today ? 'linear-gradient(90deg, #9C89B8, #F0A6CA)' : '#C4B4DC', borderRadius: 3 } }}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </>
        )}
      </Box>
      <BottomNav />
    </Box>
  );
}
