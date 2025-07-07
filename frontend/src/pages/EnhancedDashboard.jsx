import React, { useState, useEffect } from 'react';
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
  LinearProgress,
  CircularProgress,
  Tooltip,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  TrendingUp,
  TrendingDown,
  Schedule,
  Business,
  Analytics,
  Notifications,
  Star,
  Warning,
  Article,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const EnhancedDashboard = () => {
  const navigate = useNavigate();
  const [timeFrame, setTimeFrame] = useState('30d');
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  
  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [timeFrame]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from multiple endpoints
      const [clientsRes, contractorsRes, estimatesRes, contractsRes, paymentsRes, appointmentsRes] = await Promise.allSettled([
        api.get('/clients'),
        api.get('/contractors'),
        api.get('/estimates'),
        api.get('/contracts'),
        api.get('/payments'),
        api.get('/appointments')
      ]);

      // Process the data
      const clients = clientsRes.status === 'fulfilled' ? clientsRes.value.data : [];
      const contractors = contractorsRes.status === 'fulfilled' ? contractorsRes.value.data : [];
      const estimates = estimatesRes.status === 'fulfilled' ? estimatesRes.value.data : [];
      const contracts = contractsRes.status === 'fulfilled' ? contractsRes.value.data : [];
      const payments = paymentsRes.status === 'fulfilled' ? paymentsRes.value.data : [];
      const appointments = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data : [];

      // Calculate stats
      const stats = calculateStats(clients, estimates, contracts, payments, appointments);
      
      setDashboardData({
        clients,
        contractors,
        estimates,
        contracts,
        payments,
        appointments,
        stats
      });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clients, estimates, contracts, payments, appointments) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Revenue calculation
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const recentRevenue = payments
      .filter(p => p.status === 'completed' && new Date(p.created_at) >= thirtyDaysAgo)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Estimates stats
    const activeEstimates = estimates.filter(e => e.status === 'pending' || e.status === 'sent');
    const recentEstimates = estimates.filter(e => new Date(e.created_at) >= thirtyDaysAgo);
    
    // Contracts stats
    const activeContracts = contracts.filter(c => c.status === 'active');
    
    // Client stats
    const newClients = clients.filter(c => new Date(c.created_at) >= thirtyDaysAgo);
    
    // Upcoming appointments
    const upcomingAppointments = appointments
      .filter(a => new Date(a.scheduled_date) >= now)
      .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
      .slice(0, 5);
    
    return {
      revenue: {
        total: totalRevenue,
        recent: recentRevenue,
        change: recentRevenue > 0 ? '+' + ((recentRevenue / Math.max(totalRevenue - recentRevenue, 1)) * 100).toFixed(1) + '%' : '0%',
        trend: recentRevenue > 0 ? 'up' : 'neutral'
      },
      estimates: {
        total: estimates.length,
        active: activeEstimates.length,
        recent: recentEstimates.length,
        change: recentEstimates.length > 0 ? '+' + recentEstimates.length : '0',
        trend: recentEstimates.length > 0 ? 'up' : 'neutral'
      },
      clients: {
        total: clients.length,
        new: newClients.length,
        change: newClients.length > 0 ? '+' + newClients.length : '0',
        trend: newClients.length > 0 ? 'up' : 'neutral'
      },
      contracts: {
        total: contracts.length,
        active: activeContracts.length,
        change: activeContracts.length > 0 ? activeContracts.length + ' active' : '0 active',
        trend: activeContracts.length > 0 ? 'up' : 'neutral'
      },
      upcomingAppointments
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const StatCard = ({ title, value, change, trend, icon: Icon, color = 'primary', onClick }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {trend === 'up' ? (
                <TrendingUp sx={{ color: 'success.main', mr: 1, fontSize: 16 }} />
              ) : trend === 'down' ? (
                <TrendingDown sx={{ color: 'error.main', mr: 1, fontSize: 16 }} />
              ) : null}
              <Typography
                variant="body2"
                sx={{
                  color: trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'
                }}
              >
                {change}
              </Typography>
            </Box>
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: `${color}.main`,
              color: 'white',
              width: 56,
              height: 56
            }}
          >
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActions = () => {
    const handleAddClient = () => {
      navigate('/clients', { state: { openDialog: true } });
    };

    const handleNewEstimate = () => {
      navigate('/estimates', { state: { createNew: true } });
    };

    const handleScheduleAppointment = () => {
      navigate('/calendar', { state: { openDialog: true } });
    };

    const handleNewContract = () => {
      navigate('/contracts', { state: { createNew: true } });
    };

    const handleViewReports = () => {
      navigate('/payments');
    };

    const handleMarketingCampaign = () => {
      navigate('/marketing');
    };

    const handleAccessForms = () => {
      navigate('/forms');
    };

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<People />}
                onClick={handleAddClient}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                Add Client
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Description />}
                onClick={handleNewEstimate}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'success.light',
                    color: 'white'
                  }
                }}
              >
                New Estimate
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Event />}
                onClick={handleScheduleAppointment}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'info.light',
                    color: 'white'
                  }
                }}
              >
                Schedule
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Assignment />}
                onClick={handleNewContract}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'warning.light',
                    color: 'white'
                  }
                }}
              >
                Contract
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AttachMoney />}
                onClick={handleViewReports}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'secondary.light',
                    color: 'white'
                  }
                }}
              >
                Payments
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Analytics />}
                onClick={handleMarketingCampaign}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'white'
                  }
                }}
              >
                Marketing
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Article />}
                onClick={handleAccessForms}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'purple',
                    color: 'white'
                  }
                }}
              >
                Forms
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={loadDashboardData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  const { stats } = dashboardData || { stats: {} };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1, color: '#8B4513' }}>
            🏗️ SG CRM Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening with your granite & countertop business.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Frame</InputLabel>
            <Select
              value={timeFrame}
              label="Time Frame"
              onChange={(e) => setTimeFrame(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={loadDashboardData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.revenue?.total)}
            change={stats.revenue?.change}
            trend={stats.revenue?.trend}
            icon={AttachMoney}
            color="success"
            onClick={() => navigate('/payments')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Estimates"
            value={stats.estimates?.active || 0}
            change={`${stats.estimates?.change} this month`}
            trend={stats.estimates?.trend}
            icon={Description}
            color="primary"
            onClick={() => navigate('/estimates')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clients"
            value={stats.clients?.total || 0}
            change={`${stats.clients?.change} new`}
            trend={stats.clients?.trend}
            icon={People}
            color="info"
            onClick={() => navigate('/clients')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Contracts"
            value={stats.contracts?.active || 0}
            change={stats.contracts?.change}
            trend={stats.contracts?.trend}
            icon={Assignment}
            color="warning"
            onClick={() => navigate('/contracts')}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 3 }}>
        <QuickActions />
      </Box>

      {/* Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab label="Recent Activity" />
            <Tab label="Upcoming Appointments" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        {currentTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {dashboardData?.estimates?.slice(0, 5).map((estimate, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <Description />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Estimate #${estimate.id || index + 1}`}
                    secondary={`Created ${new Date(estimate.created_at).toLocaleDateString()}`}
                  />
                  <Chip 
                    label={estimate.status} 
                    color={estimate.status === 'approved' ? 'success' : 'default'} 
                    size="small" 
                  />
                </ListItem>
              ))}
              {(!dashboardData?.estimates || dashboardData.estimates.length === 0) && (
                <ListItem>
                  <ListItemText primary="No recent activity" secondary="Start by creating your first estimate" />
                </ListItem>
              )}
            </List>
          </Box>
        )}

        {currentTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <List>
              {stats.upcomingAppointments?.map((appointment, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.light' }}>
                      <Event />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={appointment.title}
                    secondary={`${new Date(appointment.scheduled_date).toLocaleString()}`}
                  />
                  <Chip 
                    label={appointment.status} 
                    color="primary" 
                    size="small" 
                  />
                </ListItem>
              ))}
              {(!stats.upcomingAppointments || stats.upcomingAppointments.length === 0) && (
                <ListItem>
                  <ListItemText 
                    primary="No upcoming appointments" 
                    secondary="Schedule your next appointment"
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/calendar')}
                  >
                    Schedule
                  </Button>
                </ListItem>
              )}
            </List>
          </Box>
        )}

        {currentTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analytics Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Revenue Trend
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(stats.revenue?.recent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last 30 days
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ mt: 2 }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Client Growth
                  </Typography>
                  <Typography variant="h4">
                    {stats.clients?.new || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New clients this month
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={60} 
                    sx={{ mt: 2 }}
                    color="success"
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default EnhancedDashboard;
