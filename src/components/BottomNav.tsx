import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useNavigate, useLocation } from 'react-router-dom';

const ROUTES = ['/', '/leaderboard', '/profile'];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const value = Math.max(0, ROUTES.indexOf(location.pathname));

  return (
    <Paper elevation={0} sx={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      borderTop: '1px solid rgba(156, 137, 184, 0.15)',
    }}>
      <BottomNavigation value={value} onChange={(_, v) => navigate(ROUTES[v] as string)}>
        <BottomNavigationAction label="Home" icon={<HomeRoundedIcon />} />
        <BottomNavigationAction label="Leaderboard" icon={<LeaderboardRoundedIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonRoundedIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
