import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as VendorsIcon,
  Description as EstimatesIcon,
  Assignment as ContractsIcon,
  Payment as PaymentsIcon,
  People as ClientsIcon,
  Build as ContractorsIcon,
  Event as CalendarIcon,
  HomeRepairService as ServicesIcon,
  Settings as SettingsIcon,
  Campaign as CampaignIcon,
  MoreHoriz as MoreIcon,
  Inbox as InboxIcon,
  Article as FormsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Inbox', icon: <InboxIcon />, path: '/inbox' },
  { text: 'Clients', icon: <ClientsIcon />, path: '/clients' },
  { text: 'Estimates', icon: <EstimatesIcon />, path: '/estimates' },
  { text: 'Contractors', icon: <ContractorsIcon />, path: '/contractors' },
  { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
  { text: 'Forms', icon: <FormsIcon />, path: '/forms' },
  { text: 'Marketing', icon: <CampaignIcon />, path: '/marketing' },
  { text: 'Services', icon: <ServicesIcon />, path: '/services' },
  { text: 'Vendors', icon: <VendorsIcon />, path: '/vendors' },
  { text: 'Contracts', icon: <ContractsIcon />, path: '/contracts' },
  { text: 'Payments', icon: <PaymentsIcon />, path: '/payments' },
  { text: 'Admin Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

// Mobile navigation items (most important for mobile)
const mobileNavItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Inbox', icon: <InboxIcon />, path: '/inbox' },
  { text: 'Clients', icon: <ClientsIcon />, path: '/clients' },
  { text: 'Estimates', icon: <EstimatesIcon />, path: '/estimates' },
  { text: 'More', icon: <MoreIcon />, path: '/more' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const getCurrentMobileValue = () => {
    const currentPath = location.pathname;
    const navItem = mobileNavItems.find(item => item.path === currentPath);
    return navItem ? navItem.path : '/dashboard';
  };

  if (isMobile) {
    return (
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1300,
          borderTop: '1px solid',
          borderColor: 'divider',
          // Safe area padding for devices with home indicator
          paddingBottom: 'env(safe-area-inset-bottom)',
        }} 
        elevation={8}
      >
        <BottomNavigation
          value={getCurrentMobileValue()}
          onChange={(event, newValue) => {
            if (newValue === '/more') {
              // TODO: Show more menu or navigate to a more page
              navigate('/dashboard');
            } else {
              navigate(newValue);
            }
          }}
          showLabels
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              paddingTop: 1,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 500,
              '&.Mui-selected': {
                fontSize: '0.75rem',
              },
            },
          }}
        >
          {mobileNavItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.text}
              value={item.path}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
        },
      }}
    >
      {/* Company Logo/Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Avatar
          src="https://cdn.prod.website-files.com/6456ce4476abb25581fbad0c/64a70d4b30e87feb388f004f_surprise-granite-profile-logo.svg"
          alt="Surprise Granite"
          sx={{ 
            width: 40, 
            height: 40,
            backgroundColor: 'white',
            p: 0.5,
            '& img': {
              objectFit: 'contain',
            }
          }}
        />
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              lineHeight: 1.2,
              color: 'white'
            }}
          >
            Surprise Granite
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.75rem'
            }}
          >
            CRM System
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List sx={{ py: 1 }}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            
            return (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={isSelected}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'rgba(255,255,255,0.8)',
                    minWidth: 40,
                  },
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
