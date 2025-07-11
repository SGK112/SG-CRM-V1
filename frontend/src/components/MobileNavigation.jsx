import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  AppBar,
  Toolbar,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Assignment,
  CalendarToday,
  AttachMoney,
  Settings,
  Notifications,
  Close,
  Build,
  TrendingUp,
  Inbox,
  BusinessCenter
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MobileNavigation = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigationItems = [
    { icon: <Dashboard />, text: 'Dashboard', path: '/dashboard' },
    { icon: <People />, text: 'Clients', path: '/clients' },
    { icon: <Assignment />, text: 'Contractors', path: '/contractors' },
    { icon: <CalendarToday />, text: 'Calendar', path: '/calendar' },
    { icon: <TrendingUp />, text: 'Estimates', path: '/estimates' },
    { icon: <AttachMoney />, text: 'Payments', path: '/payments' },
    { icon: <Build />, text: 'Services', path: '/services' },
    { icon: <BusinessCenter />, text: 'Vendors', path: '/vendors' },
    { icon: <Inbox />, text: 'Inbox', path: '/inbox' },
    { icon: <Settings />, text: 'Settings', path: '/admin/settings' },
  ];

  const bottomNavItems = [
    { icon: <Dashboard />, label: 'Home', path: '/dashboard' },
    { icon: <People />, label: 'Clients', path: '/clients' },
    { icon: <CalendarToday />, label: 'Calendar', path: '/calendar' },
    { icon: <TrendingUp />, label: 'Estimates', path: '/estimates' },
  ];

  const currentBottomNavIndex = bottomNavItems.findIndex(item => 
    location.pathname === item.path
  );

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleBottomNavChange = (event, newValue) => {
    if (bottomNavItems[newValue]) {
      navigate(bottomNavItems[newValue].path);
    }
  };

  return (
    <>
      {/* Top App Bar - Fixed positioning with proper z-index */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          boxShadow: `0 2px 8px rgba(0,0,0,0.15)`,
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Toolbar 
          sx={{ 
            minHeight: 56, 
            px: 2,
            // No extra safe area padding - keep it simple
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              p: { xs: 1, sm: 1.5 },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            component="h1"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: 'white',
              fontSize: '1.125rem',
              letterSpacing: '0.02em',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            Surprise Granite CRM
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton 
              color="inherit" 
              size="small"
              sx={{
                p: 1,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '10',
                }
              }}
            >
              <Badge 
                badgeContent={0} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    height: 16,
                    minWidth: 16,
                  }
                }}
              >
                <Notifications fontSize="small" />
              </Badge>
            </IconButton>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: theme.palette.secondary.main,
                fontSize: '0.875rem',
                color: theme.palette.secondary.contrastText,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              {(user?.full_name || user?.username)?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Drawer - Enhanced UX */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ 
          keepMounted: true,
          sx: {
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
            }
          }
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              color={theme.palette.primary.main}
            >
              SG-CRM
            </Typography>
            <IconButton 
              onClick={handleDrawerToggle}
              sx={{
                p: 1,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '10',
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
          
          {/* User Profile Section */}
          <Box 
            display="flex" 
            alignItems="center" 
            gap={2} 
            mb={3} 
            p={2}
            sx={{ 
              backgroundColor: theme.palette.background.default, 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Avatar sx={{ 
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
              width: 40,
              height: 40,
              fontWeight: 600,
            }}>
              {(user?.full_name || user?.username)?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box flex={1}>
              <Typography 
                variant="subtitle2" 
                fontWeight="medium"
                sx={{ 
                  fontSize: '0.875rem',
                  lineHeight: 1.2,
                  color: theme.palette.text.primary,
                }}
              >
                {user?.full_name || user?.username || 'User'}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.75rem',
                  lineHeight: 1.2,
                }}
              >
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation Items */}
        <List sx={{ px: 2, flex: 1 }}>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive ? theme.palette.primary.main + '15' : 'transparent',
                  border: isActive ? `1px solid ${theme.palette.primary.main}30` : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '10',
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  transition: 'color 0.2s ease',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        {/* Drawer Footer */}
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <ListItemButton
            onClick={() => { logout(); setDrawerOpen(false); }}
            sx={{ 
              borderRadius: 2,
              color: theme.palette.error.main,
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: theme.palette.error.main + '10',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <Settings />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Bottom Navigation - Enhanced for mobile */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: theme.zIndex.appBar,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          backdropFilter: 'blur(8px)',
        }} 
        elevation={8}
      >
        <BottomNavigation
          value={currentBottomNavIndex}
          onChange={handleBottomNavChange}
          sx={{
            height: 64,
            backgroundColor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                fontSize: '0.75rem',
                fontWeight: 600,
              },
              '&:hover': {
                backgroundColor: theme.palette.primary.main + '08',
              }
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: 'inherit',
              fontWeight: 'inherit',
              '&.Mui-selected': {
                fontSize: 'inherit',
              }
            }
          }}
        >
          {bottomNavItems.map((item, index) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
              sx={{
                minWidth: 0,
                padding: { xs: '6px 8px', sm: '8px 12px' },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  );
};

export default MobileNavigation;
