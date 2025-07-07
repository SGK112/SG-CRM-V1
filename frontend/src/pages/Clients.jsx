import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Badge,
  Stack,
  Divider,
  Tooltip,
  LinearProgress,
  InputAdornment,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  AttachFile as AttachFileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import ClientDialog from '../components/ClientDialog';

const ClientCard = ({ client, onEdit, onView, onDelete, onSchedule, onUploadFiles, onCreateEstimate, onCreateContract }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCardTap = () => {
    onView(client);
  };

  const getProjectTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'kitchen': return 'primary';
      case 'bathroom': return 'secondary';
      case 'commercial': return 'info';
      case 'outdoor': return 'success';
      default: return 'default';
    }
  };

  const getClientPriority = (client) => {
    if (client.budget > 50000) return { label: 'VIP', color: '#D4A574', icon: <StarIcon /> };
    if (client.budget > 25000) return { label: 'Premium', color: '#8B4513', icon: <TrendingUpIcon /> };
    return { label: 'Standard', color: '#666', icon: <BusinessIcon /> };
  };

  const priority = getClientPriority(client);
  const fileCount = client.files?.length || 0;

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: 4,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: 'divider',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 4px 20px rgba(139, 69, 19, 0.08)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(139, 69, 19, 0.15)',
          borderColor: priority.color,
        },
      }}
      onClick={handleCardTap}
    >
      {/* Priority Banner */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${priority.color}, ${priority.color}dd)`,
        color: 'white',
        p: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {priority.icon}
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
            {priority.label} CLIENT
          </Typography>
        </Box>
        <Badge badgeContent={fileCount} color="error" max={99}>
          <AttachFileIcon sx={{ fontSize: 16 }} />
        </Badge>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: priority.color, 
            mr: 2, 
            width: 56, 
            height: 56,
            fontSize: '1.5rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)',
            border: '3px solid white'
          }}>
            {client.first_name?.charAt(0)}{client.last_name?.charAt(0)}
          </Avatar>
          <IconButton 
            onClick={handleMenuClick}
            sx={{ 
              p: 1,
              backgroundColor: 'rgba(139, 69, 19, 0.1)',
              '&:hover': { 
                backgroundColor: 'rgba(139, 69, 19, 0.2)',
                transform: 'rotate(90deg)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <MoreIcon sx={{ color: priority.color }} />
          </IconButton>
        </Box>
        
        <Typography variant="h6" component="div" sx={{ 
          fontSize: '1.25rem',
          fontWeight: 700,
          lineHeight: 1.2,
          mb: 1,
          color: '#2c3e50'
        }}>
          {client.first_name} {client.last_name}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {client.project_type && (
            <Chip 
              label={client.project_type.toUpperCase()} 
              color={getProjectTypeColor(client.project_type)}
              size="small" 
              sx={{ 
                fontSize: '0.7rem',
                fontWeight: 600,
                height: 22
              }} 
            />
          )}
          {client.status && (
            <Chip 
              label={client.status} 
              variant="outlined"
              size="small" 
              sx={{ 
                fontSize: '0.7rem',
                height: 22
              }} 
            />
          )}
        </Stack>
        
        <Stack spacing={1.5}>
          {client.email && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(33, 150, 243, 0.05)',
              border: '1px solid rgba(33, 150, 243, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { 
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                transform: 'translateX(4px)'
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${client.email}`;
            }}
            >
              <EmailIcon sx={{ fontSize: 18, mr: 1.5, color: '#2196f3' }} />
              <Typography variant="body2" sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#2196f3'
              }}>
                {client.email}
              </Typography>
            </Box>
          )}
          
          {client.phone && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.05)',
              border: '1px solid rgba(76, 175, 80, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { 
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                transform: 'translateX(4px)'
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${client.phone}`;
            }}
            >
              <PhoneIcon sx={{ fontSize: 18, mr: 1.5, color: '#4caf50' }} />
              <Typography variant="body2" sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#4caf50'
              }}>
                {client.phone}
              </Typography>
            </Box>
          )}
          
          {client.address?.city && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(158, 158, 158, 0.05)',
              border: '1px solid rgba(158, 158, 158, 0.1)'
            }}>
              <LocationIcon sx={{ fontSize: 18, mr: 1.5, color: '#9e9e9e' }} />
              <Typography variant="body2" sx={{
                fontSize: '0.875rem',
                color: '#666',
                fontWeight: 500
              }}>
                {client.address.city}, {client.address.state}
              </Typography>
            </Box>
          )}
        </Stack>

        {client.budget && (
          <Box sx={{ 
            mt: 2, 
            p: 2,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${priority.color}15, ${priority.color}05)`,
            border: `2px solid ${priority.color}30`,
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              fontSize: '1.1rem',
              color: priority.color
            }}>
              ${client.budget.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: '#666',
              fontWeight: 500
            }}>
              Project Budget
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            '& .MuiMenuItem-root': {
              py: 1.5,
              px: 2,
              borderRadius: 1,
              mx: 1,
              my: 0.5
            }
          }
        }}
      >
        <MenuItem onClick={() => { onView(client); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 2, color: '#2196f3' }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { onEdit(client); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 2, color: '#ff9800' }} />
          Edit Client
        </MenuItem>
        <MenuItem onClick={() => { onUploadFiles(client); handleMenuClose(); }}>
          <UploadIcon sx={{ mr: 2, color: '#9c27b0' }} />
          Manage Files
        </MenuItem>
        <MenuItem onClick={() => { onSchedule(client); handleMenuClose(); }}>
          <ScheduleIcon sx={{ mr: 2, color: '#4caf50' }} />
          Schedule Visit
        </MenuItem>
        <MenuItem onClick={() => { onCreateEstimate(client); handleMenuClose(); }}>
          <AssessmentIcon sx={{ mr: 2, color: '#2196f3' }} />
          Create Estimate
        </MenuItem>
        <MenuItem onClick={() => { onCreateContract(client); handleMenuClose(); }}>
          <DescriptionIcon sx={{ mr: 2, color: '#ff9800' }} />
          Create Contract
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={() => { onDelete(client.id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 2 }} />
          Delete Client
        </MenuItem>
      </Menu>
    </Card>
  );
};

const Clients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const [selectedClientForFiles, setSelectedClientForFiles] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  // Handle opening dialog from dashboard navigation
  useEffect(() => {
    if (location.state?.openDialog) {
      setDialogOpen(true);
      // Clear the state to prevent reopening on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data: clients = [], isLoading } = useQuery(
    ['clients', searchTerm, filterType, sortBy],
    async () => {
      const response = await api.get('/clients', {
        params: { 
          search: searchTerm || undefined,
          project_type: filterType !== 'all' ? filterType : undefined,
          sort_by: sortBy
        }
      });
      return response.data;
    }
  );

  // Mock statistics - replace with real API calls
  const stats = {
    total: clients.length,
    vip: clients.filter(c => c.budget > 50000).length,
    premium: clients.filter(c => c.budget > 25000 && c.budget <= 50000).length,
    active: clients.filter(c => c.status === 'active').length,
    revenue: clients.reduce((sum, c) => sum + (c.budget || 0), 0)
  };

  const createMutation = useMutation(
    (clientData) => api.post('/clients', clientData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
        toast.success('Client created successfully');
        setDialogOpen(false);
        setSelectedClient(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to create client');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/clients/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
        toast.success('Client updated successfully');
        setDialogOpen(false);
        setSelectedClient(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update client');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/clients/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
        toast.success('Client deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to delete client');
      },
    }
  );

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsViewMode(false);
    setDialogOpen(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setIsViewMode(false);
    setDialogOpen(true);
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setIsViewMode(true);
    setDialogOpen(true);
  };

  const handleUploadFiles = (client) => {
    setSelectedClientForFiles(client);
    setFileUploadOpen(true);
  };

  const handleSaveClient = (clientData) => {
    if (selectedClient) {
      updateMutation.mutate({ id: selectedClient.id, data: clientData });
    } else {
      createMutation.mutate(clientData);
    }
  };

  const handleDeleteClient = (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSchedule = (client) => {
    // Navigate to calendar with client information
    navigate('/calendar', { 
      state: { 
        openDialog: true, 
        clientId: client.id,
        clientName: `${client.first_name} ${client.last_name}`,
        clientEmail: client.email,
        clientPhone: client.phone,
        projectType: client.project_type
      } 
    });
  };

  const handleCreateEstimate = (client) => {
    // Navigate to estimates page with client information
    navigate('/estimates', { 
      state: { 
        createNew: true, 
        clientData: client
      } 
    });
  };

  const handleCreateContract = (client) => {
    // Navigate to contracts page with client information
    navigate('/contracts', { 
      state: { 
        createNew: true, 
        clientId: client.id,
        clientName: `${client.first_name} ${client.last_name}`,
        clientEmail: client.email,
        clientPhone: client.phone,
        projectType: client.project_type,
        budget: client.budget
      } 
    });
  };

  const projectTypes = ['all', 'kitchen', 'bathroom', 'commercial', 'outdoor', 'countertops', 'backsplash', 'other'];
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'budget', label: 'Budget' },
    { value: 'created', label: 'Date Added' },
    { value: 'priority', label: 'Priority' }
  ];

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 3
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <LinearProgress 
            variant="indeterminate" 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: 'rgba(139, 69, 19, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#8B4513'
              }
            }} 
          />
        </Box>
        <Typography variant="h6" sx={{ color: '#8B4513', fontWeight: 600 }}>
          Loading Clients...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: '1600px', 
      mx: 'auto', 
      width: '100%',
      px: { xs: 2, sm: 3, md: 4 },
      pb: { xs: 3, sm: 4 }
    }}>
      {/* Professional Header */}
      <Paper sx={{ 
        mb: 4,
        borderRadius: 4,
        background: 'linear-gradient(135deg, #8B4513 0%, #D4A574 100%)',
        color: 'white',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          transform: 'translate(50%, -50%)'
        }} />
        
        <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" sx={{ 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Client Management
              </Typography>
              <Typography variant="h6" sx={{ 
                opacity: 0.9,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 400
              }}>
                Surprise Granite & Cabinetry CRM System
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleAddClient}
                sx={{
                  width: { xs: '100%', md: 'auto' },
                  minWidth: 180,
                  height: 56,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Add New Client
              </Button>
            </Grid>
          </Grid>

          {/* Statistics Dashboard */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center', 
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 3
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                  Total Clients
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center', 
                backgroundColor: 'rgba(212, 165, 116, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(212, 165, 116, 0.4)',
                borderRadius: 3
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                  {stats.vip}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                  VIP Clients
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center', 
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 3
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                  {stats.active}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                  Active Projects
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center', 
                backgroundColor: 'rgba(76, 175, 80, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(76, 175, 80, 0.4)',
                borderRadius: 3
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                  ${(stats.revenue / 1000000).toFixed(1)}M
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                  Pipeline Value
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Quick Actions Bar */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(139, 69, 19, 0.08)',
        border: '1px solid rgba(139, 69, 19, 0.1)'
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#8B4513', fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddClient}
              sx={{
                py: 1.5,
                borderColor: '#8B4513',
                color: '#8B4513',
                '&:hover': {
                  borderColor: '#D4A574',
                  backgroundColor: 'rgba(139, 69, 19, 0.1)'
                }
              }}
            >
              Add Client
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AssessmentIcon />}
              onClick={() => navigate('/estimates', { state: { createNew: true } })}
              sx={{
                py: 1.5,
                borderColor: '#2196f3',
                color: '#2196f3',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)'
                }
              }}
            >
              New Estimate
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ScheduleIcon />}
              onClick={() => navigate('/calendar', { state: { openDialog: true } })}
              sx={{
                py: 1.5,
                borderColor: '#4caf50',
                color: '#4caf50',
                '&:hover': {
                  borderColor: '#388e3c',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)'
                }
              }}
            >
              Schedule Visit
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DescriptionIcon />}
              onClick={() => navigate('/contracts', { state: { createNew: true } })}
              sx={{
                py: 1.5,
                borderColor: '#ff9800',
                color: '#ff9800',
                '&:hover': {
                  borderColor: '#f57c00',
                  backgroundColor: 'rgba(255, 152, 0, 0.1)'
                }
              }}
            >
              New Contract
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Advanced Search and Filters */}
      <Paper sx={{ 
        p: { xs: 3, sm: 4 }, 
        mb: 4,
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(139, 69, 19, 0.08)',
        border: '1px solid rgba(139, 69, 19, 0.1)'
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#8B4513' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&:hover fieldset': {
                    borderColor: '#8B4513',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8B4513',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Project Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            >
              {projectTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type === 'all' ? 'All Projects' : type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Advanced Filters">
                <IconButton 
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ 
                    backgroundColor: showFilters ? '#8B4513' : 'transparent',
                    color: showFilters ? 'white' : '#8B4513',
                    '&:hover': { backgroundColor: '#8B4513', color: 'white' }
                  }}
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="body2" sx={{
                alignSelf: 'center',
                color: '#666',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>
                {clients.length} clients
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Advanced Filters Collapse */}
        {showFilters && (
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(139, 69, 19, 0.1)' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#8B4513', fontWeight: 600 }}>
              Advanced Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Priority Level"
                  defaultValue="all"
                  size="small"
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="vip">VIP ($50K+)</MenuItem>
                  <MenuItem value="premium">Premium ($25K+)</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  defaultValue="all"
                  size="small"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="prospect">Prospect</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Min Budget"
                  type="number"
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Max Budget"
                  type="number"
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Client Cards Grid */}
      <Grid container spacing={{ xs: 3, sm: 4, md: 4 }}>
        {clients.map((client) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={client.id}>
            <ClientCard
              client={client}
              onEdit={handleEditClient}
              onView={handleViewClient}
              onDelete={handleDeleteClient}
              onSchedule={handleSchedule}
              onUploadFiles={handleUploadFiles}
              onCreateEstimate={handleCreateEstimate}
              onCreateContract={handleCreateContract}
            />
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {clients.length === 0 && (
        <Paper sx={{ 
          p: { xs: 4, sm: 6 }, 
          textAlign: 'center',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(139, 69, 19, 0.08)',
          border: '2px dashed rgba(139, 69, 19, 0.2)',
          backgroundColor: 'rgba(139, 69, 19, 0.02)'
        }}>
          <BusinessIcon sx={{ 
            fontSize: { xs: 80, sm: 100 }, 
            color: '#8B4513', 
            mb: 3,
            opacity: 0.7
          }} />
          <Typography variant="h4" sx={{ 
            mb: 2,
            fontSize: { xs: '1.5rem', sm: '2rem' },
            fontWeight: 700,
            color: '#8B4513'
          }}>
            No Clients Found
          </Typography>
          <Typography variant="body1" sx={{ 
            mb: 4,
            fontSize: '1.1rem',
            color: '#666',
            maxWidth: 500,
            mx: 'auto',
            lineHeight: 1.6
          }}>
            Start building your client relationships by adding your first client. 
            Upload their project files, track budgets, and manage granite installations.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<AddIcon />}
            onClick={handleAddClient}
            sx={{
              minWidth: 200,
              height: 56,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              backgroundColor: '#8B4513',
              '&:hover': {
                backgroundColor: '#D4A574',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Add Your First Client
          </Button>
        </Paper>
      )}

      {/* Floating Action Button for Quick Add */}
      <Fab
        color="primary"
        aria-label="add client"
        onClick={handleAddClient}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#8B4513',
          '&:hover': {
            backgroundColor: '#D4A574',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <AddIcon />
      </Fab>

      {/* Client Dialog */}
      <ClientDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedClient(null);
          setIsViewMode(false);
        }}
        client={selectedClient}
        onSave={handleSaveClient}
        isViewMode={isViewMode}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />

      {/* File Upload Dialog */}
      <FileUploadDialog
        open={fileUploadOpen}
        onClose={() => {
          setFileUploadOpen(false);
          setSelectedClientForFiles(null);
        }}
        client={selectedClientForFiles}
        onUploadProgress={setUploadProgress}
      />
    </Box>
  );
};

// File Upload Dialog Component
const FileUploadDialog = ({ open, onClose, client, onUploadProgress }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    
    setUploading(true);
    try {
      // Mock upload process
      for (let i = 0; i < files.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        onUploadProgress(((i + 1) / files.length) * 100);
      }
      
      toast.success(`${files.length} files uploaded successfully!`);
      setFiles([]);
      onClose();
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      onUploadProgress(0);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <PdfIcon sx={{ color: '#f44336' }} />;
    if (type.includes('image')) return <ImageIcon sx={{ color: '#4caf50' }} />;
    return <DescriptionIcon sx={{ color: '#2196f3' }} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ 
        pb: 0,
        background: 'linear-gradient(135deg, #8B4513 0%, #D4A574 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              File Management
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {client?.first_name} {client?.last_name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Upload Files" />
          <Tab label="Price Lists" />
          <Tab label="Project Images" />
          <Tab label="Documents" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              {/* Drag & Drop Upload Area */}
              <Paper
                sx={{
                  border: `3px dashed ${dragActive ? '#8B4513' : '#ccc'}`,
                  borderRadius: 3,
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: dragActive ? 'rgba(139, 69, 19, 0.05)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#8B4513',
                    backgroundColor: 'rgba(139, 69, 19, 0.02)'
                  }
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <CloudUploadIcon sx={{ 
                  fontSize: 64, 
                  color: dragActive ? '#8B4513' : '#ccc',
                  mb: 2 
                }} />
                <Typography variant="h6" sx={{ mb: 1, color: '#8B4513', fontWeight: 600 }}>
                  Drop files here or click to browse
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports PDF price lists, images, and documents
                </Typography>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => handleFiles(e.target.files)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </Paper>

              {/* File List */}
              {files.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#8B4513' }}>
                    Files to Upload ({files.length})
                  </Typography>
                  <List>
                    {files.map((fileObj) => (
                      <ListItem
                        key={fileObj.id}
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          mb: 1,
                          backgroundColor: 'white'
                        }}
                      >
                        <ListItemIcon>
                          {getFileIcon(fileObj.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={fileObj.file.name}
                          secondary={formatFileSize(fileObj.size)}
                        />
                        {fileObj.preview && (
                          <Box sx={{ mr: 2 }}>
                            <img
                              src={fileObj.preview}
                              alt="preview"
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                            />
                          </Box>
                        )}
                        <IconButton
                          edge="end"
                          onClick={() => removeFile(fileObj.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PdfIcon sx={{ fontSize: 64, color: '#8B4513', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#8B4513' }}>
                PDF Price List Parser
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload vendor price lists in PDF format. Our AI will automatically extract pricing and material details.
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Coming Soon:</strong> Automatic PDF parsing to extract granite prices, materials, and specifications.
              </Alert>
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ImageIcon sx={{ fontSize: 64, color: '#8B4513', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#8B4513' }}>
                Project Images
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload before/after photos, granite samples, and project documentation.
              </Typography>
            </Box>
          )}

          {activeTab === 3 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <DescriptionIcon sx={{ fontSize: 64, color: '#8B4513', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#8B4513' }}>
                Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Store contracts, invoices, warranties, and other important documents.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
        <Button onClick={onClose} sx={{ mr: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!files.length || uploading}
          startIcon={uploading ? null : <UploadIcon />}
          sx={{
            backgroundColor: '#8B4513',
            '&:hover': { backgroundColor: '#D4A574' }
          }}
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} Files`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Clients;
