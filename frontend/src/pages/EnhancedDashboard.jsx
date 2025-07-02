import React, { useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Divider,
  Badge,
  Alert,
} from '@mui/material';
import {
  Description,
  Payment,
  Assignment,
  People,
  Build,
  Event,
  AttachMoney,
  CheckCircle,
  Phone,
  Email,
  WhatsApp,
  Launch,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  AccessTime,
} from '@mui/icons-material';
const EnhancedDashboard = () => {
  const [timeFrame] = useState('30d');
  
  // Mock data - replace with real API calls
  const stats = {
    revenue: { value: '$47,850', change: '+12%', trend: 'up' },
    estimates: { value: '23', change: '+8%', trend: 'up' },
    clients: { value: '156', change: '+5%', trend: 'up' },
    projects: { value: '12', change: '-2%', trend: 'down' },
  };

  const recentActivity = [
    {
      id: 1,
      type: 'estimate',
      title: 'New estimate created',
      client: 'Sarah Johnson',
      amount: '$8,500',
      time: '2 minutes ago',
      icon: <Description />,
      color: '#2196f3',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment received',
      client: 'Mike Davis',
      amount: '$3,200',
      time: '15 minutes ago',
      icon: <Payment />,
      color: '#4caf50',
    },
    {
      id: 3,
      type: 'communication',
      title: 'New message received',
      client: 'Jennifer Smith',
      amount: null,
      time: '1 hour ago',
      icon: <Email />,
      color: '#ff9800',
    },
    {
      id: 4,
      type: 'appointment',
      title: 'Appointment scheduled',
      client: 'Robert Wilson',
      amount: null,
      time: '3 hours ago',
      icon: <Event />,
      color: '#9c27b0',
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      client: 'Sarah Johnson',
      type: 'Consultation',
      time: '2:00 PM Today',
      address: '123 Oak Street, Surprise, AZ',
      phone: '(623) 555-0123',
    },
    {
      id: 2,
      client: 'Mike Davis',
      type: 'Measurement',
      time: '10:00 AM Tomorrow',
      address: '456 Pine Avenue, Peoria, AZ',
      phone: '(623) 555-0456',
    },
    {
      id: 3,
      client: 'Corporate Office',
      type: 'Installation',
      time: '8:00 AM Friday',
      address: '789 Business Blvd, Phoenix, AZ',
      phone: '(602) 555-0789',
    },
  ];

  const pendingTasks = [
    {
      id: 1,
      title: 'Follow up with Jennifer Smith',
      priority: 'high',
      dueDate: 'Today',
      type: 'Communication',
    },
    {
      id: 2,
      title: 'Prepare quote for outdoor kitchen',
      priority: 'medium',
      dueDate: 'Tomorrow',
      type: 'Estimate',
    },
    {
      id: 3,
      title: 'Order marble slabs for Davis project',
      priority: 'high',
      dueDate: 'This week',
      type: 'Procurement',
    },
    {
      id: 4,
      title: 'Schedule installation team',
      priority: 'medium',
      dueDate: 'Next week',
      type: 'Scheduling',
    },
  ];

  const StatCard = ({ title, value, icon, color, subtitle, change, trend }) => (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
            {change && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend === 'up' ? (
                  <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: 16, mr: 0.5 }} />
                )}
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {change} from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, color, onClick }) => (
    <Card sx={{ 
      cursor: 'pointer',
      '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      transition: 'all 0.3s ease',
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ backgroundColor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={onClick}
          sx={{ color: color }}
        >
          Get Started
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 1 }}>
          Welcome back, John! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your business today
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={stats.revenue.value}
            icon={<AttachMoney />}
            color="#8B4513"
            change={stats.revenue.change}
            trend={stats.revenue.trend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Estimates"
            value={stats.estimates.value}
            icon={<Description />}
            color="#2196f3"
            change={stats.estimates.change}
            trend={stats.estimates.trend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clients"
            value={stats.clients.value}
            icon={<People />}
            color="#4caf50"
            change={stats.clients.change}
            trend={stats.clients.trend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={stats.projects.value}
            icon={<Build />}
            color="#ff9800"
            change={stats.projects.change}
            trend={stats.projects.trend}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: '#8B4513' }} />
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="New Estimate"
                  description="Create a professional quote"
                  icon={<Description />}
                  color="#8B4513"
                  onClick={() => window.location.href = '/estimates'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Add Client"
                  description="Register new customer"
                  icon={<People />}
                  color="#2196f3"
                  onClick={() => window.location.href = '/clients'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Schedule Visit"
                  description="Book appointment"
                  icon={<Event />}
                  color="#4caf50"
                  onClick={() => window.location.href = '/calendar'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Process Payment"
                  description="Record or request payment"
                  icon={<Payment />}
                  color="#ff9800"
                  onClick={() => window.location.href = '/payments'}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Activity</Typography>
              <IconButton size="small">
                <Refresh />
              </IconButton>
            </Box>
            <List>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: activity.color, width: 40, height: 40 }}>
                        {activity.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">{activity.title}</Typography>
                          {activity.amount && (
                            <Chip 
                              label={activity.amount} 
                              size="small" 
                              sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Client: {activity.client}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 14 }} />
                            {activity.time}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton size="small">
                      <Launch />
                    </IconButton>
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Upcoming Appointments */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Event sx={{ color: '#8B4513' }} />
              Today's Appointments
              <Badge badgeContent={upcomingAppointments.length} color="error" />
            </Typography>
            <List>
              {upcomingAppointments.map((appointment, index) => (
                <React.Fragment key={appointment.id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {appointment.client}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                            {appointment.type} • {appointment.time}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.address}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <IconButton size="small" sx={{ color: '#4caf50' }}>
                              <Phone />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#25d366' }}>
                              <WhatsApp />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#2196f3' }}>
                              <Email />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < upcomingAppointments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            <Button
              fullWidth
              variant="outlined"
              sx={{ 
                mt: 2, 
                borderColor: '#8B4513', 
                color: '#8B4513',
                '&:hover': { backgroundColor: 'rgba(139, 69, 19, 0.04)' }
              }}
            >
              View Full Calendar
            </Button>
          </Paper>

          {/* Pending Tasks */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment sx={{ color: '#8B4513' }} />
              Pending Tasks
              <Badge badgeContent={pendingTasks.filter(t => t.priority === 'high').length} color="error" />
            </Typography>
            <List>
              {pendingTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{task.title}</Typography>
                          <Chip
                            label={task.priority}
                            size="small"
                            color={task.priority === 'high' ? 'error' : 'warning'}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {task.type} • Due {task.dueDate}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton size="small">
                      <CheckCircle />
                    </IconButton>
                  </ListItem>
                  {index < pendingTasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            <Button
              fullWidth
              variant="outlined"
              sx={{ 
                mt: 2, 
                borderColor: '#8B4513', 
                color: '#8B4513',
                '&:hover': { backgroundColor: 'rgba(139, 69, 19, 0.04)' }
              }}
            >
              View All Tasks
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* CRM Tips Alert */}
      <Alert 
        severity="info" 
        sx={{ 
          mt: 3,
          backgroundColor: 'rgba(139, 69, 19, 0.1)',
          borderColor: '#8B4513',
          color: '#8B4513'
        }}
      >
        <Typography variant="body2">
          <strong>💡 Pro Tip:</strong> Use the CRM Assistant (bottom right) to get help with estimates, 
          client management, and scheduling. It's available 24/7 to help streamline your workflow!
        </Typography>
      </Alert>
    </Box>
  );
};

export default EnhancedDashboard;
