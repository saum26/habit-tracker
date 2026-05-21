import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useNavigate, useLocation } from 'react-router-dom';

const ROUTES = ['/', '/', '/leaderboard', '/profile', '/profile'];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const value =
    location.pathname === '/leaderboard' ? 2
      : location.pathname === '/profile' ? 4
        : 0;

  return (
    <Paper elevation={0} sx={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      borderTop: '1px solid rgba(156, 137, 184, 0.15)',
    }}>
      <BottomNavigation value={value} onChange={(_, v) => navigate(ROUTES[v] as string)}>
        <BottomNavigationAction label="Home" icon={<HomeRoundedIcon />} />
        <BottomNavigationAction label="Habits" icon={<CheckCircleOutlineRoundedIcon />} />
        <BottomNavigationAction label="Community" icon={<PeopleRoundedIcon />} />
        <BottomNavigationAction label="Stats" icon={<BarChartRoundedIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonRoundedIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
