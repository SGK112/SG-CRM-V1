import React from 'react';
import {
  Box,
  Grid,
  Typography,
  LinearProgress,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assignment,
  AttachMoney,
  Phone,
  Email,
  Add,
  MoreVert,
  CalendarToday,
  Notifications
} from '@mui/icons-material';
import {
  BrandedCard,
  BrandedButton,
  BrandedChip,
  BrandedHeader,
  MobileGrid,
  StatusChip,
  InfoBox,
  ResponsiveSection,
  colors
} from './BrandedComponents';

const MobileDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const dashboardStats = [
    {
      title: 'Total Leads',
      value: '124',
      change: '+12%',
      icon: <People />,
      color: colors.accent,
      trend: 'up'
    },
    {
      title: 'Active Projects',
      value: '18',
      change: '+5%',
      icon: <Assignment />,
      color: colors.secondary,
      trend: 'up'
    },
    {
      title: 'Revenue',
      value: '$45,280',
      change: '+18%',
      icon: <AttachMoney />,
      color: '#4caf50',
      trend: 'up'
    },
    {
      title: 'Conversion Rate',
      value: '24%',
      change: '+3%',
      icon: <TrendingUp />,
      color: '#ff9800',
      trend: 'up'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'lead',
      title: 'New lead from Sarah Johnson',
      time: '10 minutes ago',
      status: 'new',
      avatar: 'SJ'
    },
    {
      id: 2,
      type: 'estimate',
      title: 'Estimate approved by Mike Chen',
      time: '1 hour ago',
      status: 'approved',
      avatar: 'MC'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment received - $5,200',
      time: '2 hours ago',
      status: 'completed',
      avatar: '$'
    },
    {
      id: 4,
      type: 'appointment',
      title: 'Site visit scheduled',
      time: '4 hours ago',
      status: 'scheduled',
      avatar: 'SV'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Follow up with kitchen remodel leads',
      dueDate: 'Today',
      priority: 'high',
      progress: 60
    },
    {
      id: 2,
      title: 'Prepare estimate for bathroom project',
      dueDate: 'Tomorrow',
      priority: 'medium',
      progress: 30
    },
    {
      id: 3,
      title: 'Site visit - Johnson residence',
      dueDate: 'Nov 15',
      priority: 'high',
      progress: 0
    }
  ];

  const StatCard = ({ stat }) => (
    <BrandedCard>
      <Box p={isMobile ? 2 : 3}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: `${stat.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stat.color
            }}
          >
            {stat.icon}
          </Box>
          <BrandedChip
            variant="outlined"
            size="small"
            label={stat.change}
            sx={{
              color: stat.trend === 'up' ? '#4caf50' : '#f44336',
              borderColor: stat.trend === 'up' ? '#4caf50' : '#f44336',
            }}
          />
        </Box>
        <Typography variant="h4" fontWeight="bold" color={colors.primary} mb={1}>
          {stat.value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {stat.title}
        </Typography>
      </Box>
    </BrandedCard>
  );

  const ActivityItem = ({ activity }) => (
    <Box display="flex" alignItems="center" gap={2} py={1.5}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          backgroundColor: colors.accent,
          fontSize: '0.875rem'
        }}
      >
        {activity.avatar}
      </Avatar>
      <Box flexGrow={1}>
        <Typography variant="body2" fontWeight="medium">
          {activity.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {activity.time}
        </Typography>
      </Box>
      <StatusChip status={activity.status} />
    </Box>
  );

  const TaskItem = ({ task }) => (
    <Box mb={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="body2" fontWeight="medium">
          {task.title}
        </Typography>
        <BrandedChip
          size="small"
          label={task.priority}
          variant={task.priority === 'high' ? 'secondary' : 'outlined'}
        />
      </Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {task.dueDate}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={task.progress}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: `${colors.secondary}20`,
          '& .MuiLinearProgress-bar': {
            backgroundColor: colors.secondary,
            borderRadius: 3,
          }
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <BrandedHeader variant="h4" component="h1">
            Dashboard
          </BrandedHeader>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening with your business.
          </Typography>
        </Box>
        {!isMobile && (
          <Box display="flex" gap={2}>
            <IconButton sx={{ color: colors.text.secondary }}>
              <Notifications />
            </IconButton>
            <BrandedButton variant="contained" startIcon={<Add />}>
              New Lead
            </BrandedButton>
          </Box>
        )}
      </Box>

      {/* Stats Cards */}
      <ResponsiveSection>
        <MobileGrid container spacing={isMobile ? 2 : 3}>
          {dashboardStats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <StatCard stat={stat} />
            </Grid>
          ))}
        </MobileGrid>
      </ResponsiveSection>

      {/* Main Content */}
      <MobileGrid container spacing={isMobile ? 2 : 3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <BrandedCard>
            <Box p={isMobile ? 2 : 3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold" color={colors.primary}>
                  Recent Activity
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <Box>
                {recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </Box>
              <Box mt={2}>
                <BrandedButton variant="outlined" fullWidth>
                  View All Activities
                </BrandedButton>
              </Box>
            </Box>
          </BrandedCard>
        </Grid>

        {/* Upcoming Tasks */}
        <Grid item xs={12} md={4}>
          <BrandedCard>
            <Box p={isMobile ? 2 : 3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold" color={colors.primary}>
                  Upcoming Tasks
                </Typography>
                <IconButton size="small">
                  <Add />
                </IconButton>
              </Box>
              <Box>
                {upcomingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </Box>
              <Box mt={2}>
                <BrandedButton variant="outlined" fullWidth>
                  View All Tasks
                </BrandedButton>
              </Box>
            </Box>
          </BrandedCard>
        </Grid>
      </MobileGrid>

      {/* Quick Actions (Mobile) */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000,
          }}
        >
          <BrandedButton
            variant="contained"
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              minWidth: 'auto',
              boxShadow: '0 4px 12px rgba(74, 144, 226, 0.4)',
            }}
          >
            <Add />
          </BrandedButton>
        </Box>
      )}

      {/* Info Box */}
      <Box mt={4}>
        <InfoBox variant="info">
          <Typography variant="body2" fontWeight="medium" color={colors.primary} mb={1}>
            💡 Pro Tip
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your lead conversion rate has improved by 3% this month! Consider increasing your marketing spend to capitalize on this trend.
          </Typography>
        </InfoBox>
      </Box>
    </Box>
  );
};

export default MobileDashboard;
