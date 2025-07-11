import { createTheme } from '@mui/material/styles';

// Brand Colors
const brandColors = {
  primary: '#1976D2',      // Professional Blue - Primary brand color
  secondary: '#DC2626',    // Red - Secondary brand color (changed from brown)
  background: '#F5F5F5',   // Light Gray - Background
  accent: '#0D47A1',       // Darker Blue - Call-to-action buttons
  white: '#FFFFFF',
  text: {
    primary: '#333333',    // Black text for content (changed from white)
    secondary: '#333333',  // Dark text for content
    light: '#666666'      // Light text for secondary content
  }
};

// Mobile-first responsive theme
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,      // Mobile phones
      sm: 600,    // Tablets
      md: 960,    // Small laptops
      lg: 1280,   // Desktops
      xl: 1920,   // Large screens
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.primary,
      light: '#666666',
      dark: '#1a1a1a',
      contrastText: brandColors.white,
    },
    secondary: {
      main: '#DC2626',     // Red color (changed from blue)
      light: '#FEE2E2',    // Light red
      dark: '#B91C1C',     // Dark red
      contrastText: brandColors.white,
    },
    background: {
      default: brandColors.background,
      paper: brandColors.white,
    },
    text: {
      primary: '#333333',          // Black text (changed from white)
      secondary: '#666666',        // Dark gray text
      disabled: '#999999',         // Light gray for disabled text
    },
    action: {
      selected: '#e8f4fd',
      hover: 'rgba(0, 0, 0, 0.04)',
      disabled: 'rgba(0, 0, 0, 0.26)',
    },
    info: {
      main: brandColors.accent,
      light: '#7db3f0',
      dark: '#2c5aa0',
      contrastText: brandColors.white,
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: brandColors.white,
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: brandColors.white,
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: brandColors.white,
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    // Mobile-first typography scaling
    h1: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: brandColors.primary,
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
      '@media (min-width:960px)': {
        fontSize: '3rem',
      },
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: brandColors.primary,
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
      '@media (min-width:960px)': {
        fontSize: '2.25rem',
      },
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: brandColors.primary,
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
      '@media (min-width:960px)': {
        fontSize: '1.75rem',
      },
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: brandColors.primary,
      '@media (min-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: brandColors.primary,
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: brandColors.primary,
      '@media (min-width:600px)': {
        fontSize: '1rem',
      },
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      '@media (min-width:600px)': {
        fontSize: '1rem',
      },
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      '@media (min-width:600px)': {
        fontSize: '0.875rem',
      },
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      '@media (min-width:600px)': {
        fontSize: '1rem',
      },
    },
  },
  spacing: 4, // Base spacing unit (4px)
  shape: {
    borderRadius: 8,
  },
  components: {
    // Mobile-first button styling
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          minHeight: 44, // Touch-friendly minimum
          '@media (min-width:600px)': {
            padding: '12px 24px',
            fontSize: '1rem',
            minHeight: 48,
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${brandColors.accent} 0%, #357ABD 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, #357ABD 0%, ${brandColors.accent} 100%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)`, // Updated to red
          '&:hover': {
            background: `linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)`, // Updated to red
          },
        },
      },
    },
    // Mobile-first card styling
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    // Mobile-first text field styling
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontSize: '0.875rem',
            minHeight: 44, // Touch-friendly
            color: '#333333', // Ensure input text is black
            '@media (min-width:600px)': {
              fontSize: '1rem',
              minHeight: 48,
            },
            '& fieldset': {
              borderColor: '#d0d0d0',
            },
            '&:hover fieldset': {
              borderColor: '#DC2626', // Updated to red
            },
            '&.Mui-focused fieldset': {
              borderColor: brandColors.accent,
            },
            '& input': {
              color: '#333333', // Ensure input text is black
            },
            '& textarea': {
              color: '#333333', // Ensure textarea text is black
            },
            '& input::placeholder': {
              color: '#999999', // Gray placeholder text
            },
            '& textarea::placeholder': {
              color: '#999999', // Gray placeholder text
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666', // Label color
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: brandColors.accent, // Focused label color
          },
        },
      },
    },
    // Mobile-first app bar
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: brandColors.white,
          color: brandColors.primary,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: `1px solid #e0e0e0`,
        },
      },
    },
    // Mobile-first drawer
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: brandColors.white,
          borderRight: `1px solid #e0e0e0`,
          width: 280,
          '@media (max-width:959px)': {
            width: '100%',
            maxWidth: 320,
          },
        },
      },
    },
    // Ensure good contrast for Chip components
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#f0f0f0',
          color: brandColors.text.primary,
          '&:hover': {
            backgroundColor: '#e0e0e0',
          },
        },
        colorPrimary: {
          backgroundColor: brandColors.primary,
          color: brandColors.white,
          '&:hover': {
            backgroundColor: '#1a1a1a',
          },
        },
        colorSecondary: {
          backgroundColor: brandColors.secondary,
          color: brandColors.white,
          '&:hover': {
            backgroundColor: '#8a6b4f',
          },
        },
      },
    },
    // Mobile-first paper styling with proper contrast
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: brandColors.white,
          color: brandColors.text.primary,
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        elevation3: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        },
      },
    },
    // Mobile-first list styling
    MuiListItem: {
      styleOverrides: {
        root: {
          minHeight: 48,
          paddingTop: 8,
          paddingBottom: 8,
          '@media (min-width:600px)': {
            minHeight: 56,
            paddingTop: 12,
            paddingBottom: 12,
          },
        },
      },
    },
    // Mobile-first menu styling
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 44,
          fontSize: '0.875rem',
          '@media (min-width:600px)': {
            minHeight: 48,
            fontSize: '1rem',
          },
        },
      },
    },
    // Mobile-first table styling
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          padding: '8px 16px',
          '@media (min-width:600px)': {
            fontSize: '0.875rem',
            padding: '12px 16px',
          },
        },
        head: {
          fontWeight: 600,
          backgroundColor: brandColors.background,
          color: brandColors.primary,
        },
      },
    },
  },
});

// Mobile-first responsive utilities
export const mobileBreakpoints = {
  mobile: '@media (max-width: 599px)',
  tablet: '@media (min-width: 600px) and (max-width: 959px)',
  desktop: '@media (min-width: 960px)',
  mobileAndTablet: '@media (max-width: 959px)',
  tabletAndDesktop: '@media (min-width: 600px)',
};

// Common mobile-first styles
export const mobileStyles = {
  // Full width containers on mobile
  mobileContainer: {
    width: '100%',
    padding: '16px',
    [mobileBreakpoints.tabletAndDesktop]: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
  },
  // Touch-friendly buttons
  touchButton: {
    minHeight: 44,
    minWidth: 44,
    padding: '12px 16px',
    fontSize: '0.875rem',
    [mobileBreakpoints.tabletAndDesktop]: {
      minHeight: 48,
      padding: '14px 20px',
      fontSize: '1rem',
    },
  },
  // Mobile-first grid spacing
  mobileGrid: {
    spacing: { xs: 2, sm: 3, md: 4 },
  },
  // Responsive typography
  responsiveText: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    [mobileBreakpoints.tabletAndDesktop]: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  // Mobile-first form fields
  mobileFormField: {
    marginBottom: '16px',
    [mobileBreakpoints.tabletAndDesktop]: {
      marginBottom: '20px',
    },
  },
  // Mobile navigation styles
  mobileNav: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    minHeight: 56,
    [mobileBreakpoints.tabletAndDesktop]: {
      padding: '16px 24px',
      minHeight: 64,
    },
  },
};

export { brandColors };
export default theme;
