import { Box, CircularProgress, Typography } from '@mui/material';

export function LoadingScreen() {
  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #F8F4FF 0%, #FFF0F8 100%)', gap: 2,
    }}>
      <Typography sx={{ fontSize: 52, lineHeight: 1 }}>✨</Typography>
      <Typography variant="h5" sx={{ color: '#9C89B8', fontWeight: 700 }}>Habit Tracker</Typography>
      <CircularProgress sx={{ color: '#9C89B8', mt: 1 }} size={28} />
    </Box>
  );
}
