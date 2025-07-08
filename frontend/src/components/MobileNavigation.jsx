import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Paper
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
  Home,
  PersonAdd,
  EmailOutlined,
  PhoneOutlined,
  BusinessCenter,
  TrendingUp,
  Inbox,
  Build
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { BrandedAppBar, colors } from './BrandedComponents';

const MobileNavigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  const navigationItems = [
    { icon: <Dashboard />, text: 'Dashboard', path: '/dashboard' },
    { icon: <People />, text: 'Clients', path: '/clients' },
    { icon: <Assignment />, text: 'Projects', path: '/projects' },
    { icon: <CalendarToday />, text: 'Calendar', path: '/calendar' },
    { icon: <AttachMoney />, text: 'Payments', path: '/payments' },
    { icon: <EmailOutlined />, text: 'Marketing', path: '/marketing' },
    { icon: <Build />, text: 'Services', path: '/services' },
    { icon: <BusinessCenter />, text: 'Vendors', path: '/vendors' },
    { icon: <TrendingUp />, text: 'Estimates', path: '/estimates' },
    { icon: <Inbox />, text: 'Inbox', path: '/inbox' },
    { icon: <Settings />, text: 'Settings', path: '/admin/settings' },
  ];

  const mobileBottomNavItems = [
    { icon: <Dashboard />, label: 'Dashboard', path: '/dashboard' },
    { icon: <People />, label: 'Clients', path: '/clients' },
    { icon: <Assignment />, label: 'Projects', path: '/projects' },
    { icon: <CalendarToday />, label: 'Calendar', path: '/calendar' },
    { icon: <Inbox />, label: 'More', path: '/inbox' },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleBottomNavChange = (event, newValue) => {
    setBottomNavValue(newValue);
    if (mobileBottomNavItems[newValue]) {
      navigate(mobileBottomNavItems[newValue].path);
    }
  };

  React.useEffect(() => {
    const currentPath = location.pathname;
    const currentIndex = mobileBottomNavItems.findIndex(item => item.path === currentPath);
    if (currentIndex !== -1) {
      setBottomNavValue(currentIndex);
    }
  }, [location.pathname]);

  // Mobile App Bar
  const MobileAppBar = () => (
    <BrandedAppBar position="fixed">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          minHeight: 56,
        }}
      >
        <Box display="flex" alignItems="center">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 700,
              color: colors.primary,
              fontSize: '1.125rem',
            }}
          >
            SG-CRM
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: colors.secondary,
              fontSize: '0.875rem',
            }}
          >
            SG
          </Avatar>
        </Box>
      </Box>
    </BrandedAppBar>
  );

  // Mobile Drawer
  const MobileDrawer = () => (
    <Drawer
      variant="temporary"
      open={drawerOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 280,
          backgroundColor: colors.white,
          borderRight: `1px solid ${colors.secondary}20`,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold" color={colors.primary}>
            SG-CRM
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <Close />
          </IconButton>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ backgroundColor: colors.secondary }}>SG</Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="medium">
              Stone & Granite Co.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Premium Countertops
            </Typography>
          </Box>
        </Box>
        
        <Divider />
      </Box>

      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: `${colors.accent}10`,
                },
                ...(location.pathname === item.path && {
                  backgroundColor: `${colors.accent}15`,
                  color: colors.accent,
                  '& .MuiListItemIcon-root': {
                    color: colors.accent,
                  },
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: colors.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box textAlign="center">
          <Typography variant="caption" color="text.secondary">
            SG-CRM v1.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );

  // Bottom Navigation for Mobile
  const MobileBottomNav = () => (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: `1px solid ${colors.secondary}20`,
        backgroundColor: colors.white,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={bottomNavValue}
        onChange={handleBottomNavChange}
        sx={{
          height: 70,
          '& .MuiBottomNavigationAction-root': {
            fontSize: '0.75rem',
            minWidth: 'auto',
            paddingTop: 1,
            color: colors.text.secondary,
            '&.Mui-selected': {
              color: colors.accent,
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 500,
          },
        }}
      >
        {mobileBottomNavItems.map((item, index) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );

  // Desktop Navigation (Sidebar)
  const DesktopSidebar = () => (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        backgroundColor: colors.white,
        borderRight: `1px solid ${colors.secondary}20`,
        height: '100vh',
        position: 'fixed',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" color={colors.primary} mb={1}>
          SG-CRM
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Customer Relationship Management
        </Typography>
      </Box>

      <List sx={{ px: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 1,
                py: 1.5,
                '&:hover': {
                  backgroundColor: `${colors.accent}10`,
                },
                ...(location.pathname === item.path && {
                  backgroundColor: `${colors.accent}15`,
                  color: colors.accent,
                  '& .MuiListItemIcon-root': {
                    color: colors.accent,
                  },
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: colors.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          <MobileAppBar />
          <MobileDrawer />
          <MobileBottomNav />
        </>
      ) : (
        <DesktopSidebar />
      )}
    </>
  );
};

export default MobileNavigation;
