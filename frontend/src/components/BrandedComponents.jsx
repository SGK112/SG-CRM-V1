import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Button,
  Paper,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Container
} from '@mui/material';
import { brandColors } from '../theme/mobileFirstTheme';

// Branded Primary Button
export const BrandedButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: 8,
  fontWeight: 600,
  textTransform: 'none',
  minHeight: 44,
  padding: '12px 24px',
  fontSize: '0.875rem',
  transition: 'all 0.2s ease-in-out',
  
  [theme.breakpoints.up('sm')]: {
    minHeight: 48,
    fontSize: '1rem',
    padding: '14px 28px',
  },

  ...(variant === 'contained' && {
    background: `linear-gradient(135deg, ${brandColors.accent} 0%, #357ABD 100%)`,
    color: brandColors.white,
    boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)',
    '&:hover': {
      background: `linear-gradient(135deg, #357ABD 0%, ${brandColors.accent} 100%)`,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(74, 144, 226, 0.4)',
    },
    '&:disabled': {
      background: brandColors.text.light,
      color: brandColors.white,
      transform: 'none',
      boxShadow: 'none',
    },
  }),

  ...(variant === 'outlined' && {
    borderColor: brandColors.accent,
    color: brandColors.accent,
    '&:hover': {
      borderColor: brandColors.primary,
      backgroundColor: `${brandColors.accent}10`,
      transform: 'translateY(-1px)',
    },
  }),

  ...(variant === 'secondary' && {
    background: `linear-gradient(135deg, ${brandColors.secondary} 0%, #A08569 100%)`,
    color: brandColors.white,
    boxShadow: '0 2px 8px rgba(184, 151, 120, 0.3)',
    '&:hover': {
      background: `linear-gradient(135deg, #A08569 0%, ${brandColors.secondary} 100%)`,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(184, 151, 120, 0.4)',
    },
  }),
}));

// Branded Card Component
export const BrandedCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: `1px solid ${brandColors.secondary}20`,
  background: brandColors.white,
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },

  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(1),
  },
}));

// Branded Paper Component
export const BrandedPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  border: `1px solid ${brandColors.secondary}15`,
  background: `linear-gradient(135deg, ${brandColors.white} 0%, ${brandColors.background} 100%)`,
  padding: theme.spacing(4),
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: 12,
  },
}));

// Branded Header Component
export const BrandedHeader = styled(Typography)(({ theme }) => ({
  color: brandColors.primary,
  fontWeight: 700,
  marginBottom: theme.spacing(3),
  position: 'relative',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '0',
    width: '60px',
    height: '3px',
    background: `linear-gradient(90deg, ${brandColors.accent}, ${brandColors.secondary})`,
    borderRadius: '2px',
  },

  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
    fontSize: '1.5rem',
  },
}));

// Branded Text Field
export const BrandedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: brandColors.white,
    transition: 'all 0.2s ease-in-out',
    
    '& fieldset': {
      borderColor: `${brandColors.secondary}40`,
      borderWidth: '1px',
    },
    
    '&:hover fieldset': {
      borderColor: brandColors.secondary,
    },
    
    '&.Mui-focused fieldset': {
      borderColor: brandColors.accent,
      borderWidth: '2px',
    },
  },
  
  '& .MuiInputLabel-root': {
    color: brandColors.text.secondary,
    '&.Mui-focused': {
      color: brandColors.accent,
    },
  },

  [theme.breakpoints.down('sm')]: {
    '& .MuiOutlinedInput-root': {
      fontSize: '0.875rem',
    },
  },
}));

// Branded Select Field
export const BrandedSelect = styled(Select)(({ theme }) => ({
  borderRadius: 8,
  backgroundColor: brandColors.white,
  
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: `${brandColors.secondary}40`,
  },
  
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: brandColors.secondary,
  },
  
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: brandColors.accent,
  },

  [theme.breakpoints.down('sm')]: {
    fontSize: '0.875rem',
  },
}));

// Branded Chip Component
export const BrandedChip = styled(Chip)(({ theme, variant }) => ({
  borderRadius: 16,
  fontWeight: 500,
  fontSize: '0.875rem',
  height: 32,
  
  ...(variant === 'primary' && {
    backgroundColor: brandColors.accent,
    color: brandColors.white,
    '&:hover': {
      backgroundColor: '#357ABD',
    },
  }),
  
  ...(variant === 'secondary' && {
    backgroundColor: brandColors.secondary,
    color: brandColors.white,
    '&:hover': {
      backgroundColor: '#A08569',
    },
  }),
  
  ...(variant === 'outlined' && {
    borderColor: brandColors.accent,
    color: brandColors.accent,
    '&:hover': {
      backgroundColor: `${brandColors.accent}10`,
    },
  }),

  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
    height: 28,
  },
}));

// Branded App Bar
export const BrandedAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: brandColors.white,
  color: brandColors.primary,
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  borderBottom: `1px solid ${brandColors.secondary}20`,
  
  '& .MuiToolbar-root': {
    minHeight: 64,
    padding: '0 24px',
    
    [theme.breakpoints.down('sm')]: {
      minHeight: 56,
      padding: '0 16px',
    },
  },
}));

// Branded Container
export const BrandedContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '1200px',
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

// Mobile-First Grid Container
export const MobileGrid = styled(Grid)(({ theme }) => ({
  '&.MuiGrid-container': {
    margin: 0,
    width: '100%',
    
    '& .MuiGrid-item': {
      paddingLeft: theme.spacing(1),
      paddingTop: theme.spacing(1),
      
      [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(2),
      },
    },
  },
}));

// Status Indicators
export const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    active: { bg: '#4caf50', color: '#fff' },
    inactive: { bg: '#f44336', color: '#fff' },
    pending: { bg: '#ff9800', color: '#fff' },
    completed: { bg: brandColors.secondary, color: '#fff' },
    draft: { bg: brandColors.text.light, color: '#fff' },
  };

  const colors = statusColors[status] || statusColors.draft;

  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 24,
    borderRadius: 12,
    
    [theme.breakpoints.up('sm')]: {
      fontSize: '0.875rem',
      height: 28,
    },
  };
});

// Branded Info Box
export const InfoBox = styled(Box)(({ theme, variant }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  border: `1px solid ${brandColors.secondary}30`,
  backgroundColor: brandColors.white,
  marginBottom: theme.spacing(2),
  
  ...(variant === 'info' && {
    backgroundColor: `${brandColors.accent}08`,
    borderColor: `${brandColors.accent}30`,
  }),
  
  ...(variant === 'success' && {
    backgroundColor: '#4caf5008',
    borderColor: '#4caf5030',
  }),
  
  ...(variant === 'warning' && {
    backgroundColor: '#ff980008',
    borderColor: '#ff980030',
  }),
  
  ...(variant === 'error' && {
    backgroundColor: '#f4433608',
    borderColor: '#f4433630',
  }),

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

// Loading Overlay
export const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  
  '& .loading-content': {
    backgroundColor: brandColors.white,
    padding: theme.spacing(4),
    borderRadius: 12,
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
      margin: theme.spacing(2),
    },
  },
}));

// Responsive Section
export const ResponsiveSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 0),
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3, 0),
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0),
  },
}));

// Brand Colors Export for easy access
export const colors = brandColors;
