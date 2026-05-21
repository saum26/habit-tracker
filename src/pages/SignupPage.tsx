import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, IconButton, InputAdornment, Link, TextField, Typography } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, displayName.trim());
    if (error) setError(error);
    setLoading(false);
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F8F4FF 0%, #FFF0F8 50%, #F0F8FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{ fontSize: 54, lineHeight: 1, mb: 1 }}>🌱</Typography>
          <Typography variant="h4" sx={{ color: '#3D2C5C' }}>Get Started</Typography>
          <Typography variant="body2" sx={{ color: '#9A89B4', mt: 0.5 }}>5 starter habits will be added for you</Typography>
        </Box>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2.5, color: '#3D2C5C' }}>Create account</Typography>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            <form onSubmit={e => { void handleSubmit(e); }}>
              <TextField fullWidth label="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} sx={{ mb: 2 }} required placeholder="e.g. Alex" />
              <TextField fullWidth label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} required />
              <TextField fullWidth label="Password (6+ chars)" value={password} onChange={e => setPassword(e.target.value)}
                type={showPwd ? 'text' : 'password'} sx={{ mb: 3 }} required
                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPwd(s => !s)} edge="end">{showPwd ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}</IconButton></InputAdornment> }}
              />
              <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 1.5, fontSize: '1rem' }}>
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2.5, color: '#9A89B4' }}>
          Already have an account?{' '}
          <Link component="button" onClick={() => navigate('/login')} sx={{ color: '#9C89B8', fontWeight: 600 }}>Sign in</Link>
        </Typography>
      </Box>
    </Box>
  );
}
