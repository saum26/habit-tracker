import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#9C89B8',
      light: '#BBA9D1',
      dark: '#7A6A9A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F0A6CA',
      light: '#F5C1D8',
      dark: '#D98AB0',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#95D5B2',
      light: '#B2E2C7',
      dark: '#74B896',
    },
    background: {
      default: '#F8F4FF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3D2C5C',
      secondary: '#7A6A9A',
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 16px rgba(156, 137, 184, 0.12)', borderRadius: 20 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 14, textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        contained: { background: 'linear-gradient(135deg, #9C89B8 0%, #B89CC8 100%)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #9C89B8 0%, #F0A6CA 100%)',
          color: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(156, 137, 184, 0.45)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: { root: { backgroundColor: '#FFFFFF', height: 68 } },
    },
    MuiBottomNavigationAction: {
      styleOverrides: { root: { color: '#C0B0D8', '&.Mui-selected': { color: '#9C89B8' } } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 24 } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
  },
});
