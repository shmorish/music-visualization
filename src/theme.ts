import { createTheme, ThemeOptions } from '@mui/material/styles';

// Light mode colors: #ef866b #f7b46b #f7d76b #bcb5b5
// Dark mode colors: #28385E #516C8D #6a91c1 #CCCCCC

const getTheme = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#ef866b' : '#6a91c1',
      light: mode === 'light' ? '#f7b46b' : '#8bb4e8',
      dark: mode === 'light' ? '#d6573a' : '#516C8D',
      contrastText: mode === 'light' ? '#ffffff' : '#ffffff',
    },
    secondary: {
      main: mode === 'light' ? '#f7b46b' : '#516C8D',
      light: mode === 'light' ? '#f7d76b' : '#7a95b8',
      dark: mode === 'light' ? '#e89943' : '#28385E',
      contrastText: mode === 'light' ? '#ffffff' : '#ffffff',
    },
    tertiary: {
      main: mode === 'light' ? '#f7d76b' : '#CCCCCC',
      light: mode === 'light' ? '#fcec9a' : '#e6e6e6',
      dark: mode === 'light' ? '#e6c148' : '#999999',
      contrastText: mode === 'light' ? '#2d2d2d' : '#2d2d2d',
    },
    background: {
      default: mode === 'light' ? '#fefefe' : '#1a1a1a',
      paper: mode === 'light' ? '#ffffff' : '#2d2d2d',
    },
    surface: {
      main: mode === 'light' ? '#bcb5b5' : '#28385E',
      light: mode === 'light' ? '#d9d4d4' : '#3d4f73',
      dark: mode === 'light' ? '#9f9898' : '#1a2340',
      contrastText: mode === 'light' ? '#2d2d2d' : '#ffffff',
    },
    text: {
      primary: mode === 'light' ? '#2d2d2d' : '#ffffff',
      secondary: mode === 'light' ? '#666666' : '#CCCCCC',
    },
    divider: mode === 'light' ? '#bcb5b5' : '#516C8D',
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f7b46b',
      light: '#f7d76b',
      dark: '#e89943',
      contrastText: '#2d2d2d',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 300,
      lineHeight: 1.1,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 300,
    },
    h5: {
      fontSize: '1.75rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Light theme
export const lightTheme = createTheme({
  ...getTheme('light'),
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0px 6px 16px 0px rgba(0, 0, 0, 0.25)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.1)',
          borderRadius: 16,
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...getTheme('dark'),
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.4)',
          '&:hover': {
            boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.5)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.4)',
          '&:hover': {
            boxShadow: '0px 6px 16px 0px rgba(0, 0, 0, 0.5)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.3)',
          borderRadius: 16,
          backgroundColor: '#2d2d2d',
        },
      },
    },
  },
});

// Default export (light theme)
export const theme = lightTheme;

// Theme toggle utility
export const getThemeByMode = (mode: 'light' | 'dark') => 
  mode === 'light' ? lightTheme : darkTheme;