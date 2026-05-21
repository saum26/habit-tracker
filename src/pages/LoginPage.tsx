import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, IconButton, InputAdornment, Link, TextField, Typography } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error);
    setLoading(false);
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F8F4FF 0%, #FFF0F8 50%, #F0F8FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box component="img" src="/src/assets/icons/AppLogo.png" alt="Habit Tracker" sx={{ width: 80, height: 80, objectFit: 'contain', mb: 1 }} />
          <Typography variant="h4" sx={{ color: '#3D2C5C' }}>Habit Tracker</Typography>
          <Typography variant="body2" sx={{ color: '#9A89B4', mt: 0.5 }}>Build better habits, one day at a time</Typography>
        </Box>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2.5, color: '#3D2C5C' }}>Welcome back</Typography>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            <form onSubmit={e => { void handleSubmit(e); }}>
              <TextField fullWidth label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} required />
              <TextField fullWidth label="Password" value={password} onChange={e => setPassword(e.target.value)}
                type={showPwd ? 'text' : 'password'} sx={{ mb: 3 }} required
                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPwd(s => !s)} edge="end">{showPwd ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}</IconButton></InputAdornment> }}
              />
              <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 1.5, fontSize: '1rem' }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2.5, color: '#9A89B4' }}>
          No account?{' '}
          <Link component="button" onClick={() => navigate('/signup')} sx={{ color: '#9C89B8', fontWeight: 600 }}>Sign up free</Link>
        </Typography>
      </Box>
    </Box>
  );
}
