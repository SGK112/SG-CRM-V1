import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
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
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import ClientDialog from '../components/ClientDialog';

const ClientCard = ({ client, onEdit, onView, onDelete, onSchedule }) => {
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

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
          borderColor: 'primary.main',
        },
        '&:active': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        }
      }}
      onClick={handleCardTap}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 3, sm: 3.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            mr: 2, 
            width: { xs: 48, sm: 52 }, 
            height: { xs: 48, sm: 52 },
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            fontWeight: 600,
            boxShadow: 2
          }}>
            <PersonIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
          </Avatar>
          <IconButton 
            onClick={handleMenuClick}
            sx={{ 
              p: 1.5,
              color: 'text.secondary',
              '&:hover': { 
                backgroundColor: 'action.hover',
                color: 'primary.main'
              }
            }}
          >
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                minWidth: 160,
                '& .MuiMenuItem-root': {
                  py: 1.5,
                  px: 2,
                }
              }
            }}
          >
            <MenuItem onClick={() => { onView(client); handleMenuClose(); }}>
              <ViewIcon sx={{ mr: 1.5, fontSize: 20 }} />
              View Details
            </MenuItem>
            <MenuItem onClick={() => { onEdit(client); handleMenuClose(); }}>
              <EditIcon sx={{ mr: 1.5, fontSize: 20 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={() => { onSchedule(client); handleMenuClose(); }}>
              <ScheduleIcon sx={{ mr: 1.5, fontSize: 20 }} />
              Schedule
            </MenuItem>
            <MenuItem onClick={() => { onDelete(client.id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
        
        <Typography variant="h6" component="div" gutterBottom sx={{ 
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          fontWeight: 600,
          lineHeight: 1.2,
          mb: 1
        }}>
          {client.first_name} {client.last_name}
        </Typography>
        
        {client.project_type && (
          <Chip 
            label={client.project_type} 
            color={getProjectTypeColor(client.project_type)}
            size="small" 
            sx={{ 
              mb: 2,
              fontSize: '0.75rem',
              height: 24
            }} 
          />
        )}
        
        <Box sx={{ mt: 2, space: 1 }}>
          {client.email && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1.5,
              p: 1,
              borderRadius: 1,
              backgroundColor: 'grey.50',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'grey.100' },
              '&:active': { backgroundColor: 'grey.200' }
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${client.email}`;
            }}
            >
              <EmailIcon sx={{ fontSize: 18, mr: 1.5, color: 'primary.main' }} />
              <Typography variant="body2" color="text.primary" sx={{
                fontSize: '0.875rem',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                {client.email}
              </Typography>
            </Box>
          )}
          
          {client.phone && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1.5,
              p: 1,
              borderRadius: 1,
              backgroundColor: 'grey.50',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'grey.100' },
              '&:active': { backgroundColor: 'grey.200' }
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${client.phone}`;
            }}
            >
              <PhoneIcon sx={{ fontSize: 18, mr: 1.5, color: 'success.main' }} />
              <Typography variant="body2" color="text.primary" sx={{
                fontSize: '0.875rem'
              }}>
                {client.phone}
              </Typography>
            </Box>
          )}
          
          {client.address?.city && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              p: 1,
              borderRadius: 1,
              backgroundColor: 'grey.50'
            }}>
              <LocationIcon sx={{ fontSize: 18, mr: 1.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: '0.875rem',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                {client.address.city}, {client.address.state}
              </Typography>
            </Box>
          )}
        </Box>

        {client.budget && (
          <Box sx={{ 
            mt: 2, 
            p: 1.5,
            borderRadius: 1,
            backgroundColor: 'primary.50',
            border: '1px solid',
            borderColor: 'primary.200'
          }}>
            <Typography variant="body2" color="primary.main" sx={{ 
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              Budget: ${client.budget.toLocaleString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Clients = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery(
    ['clients', searchTerm, filterType],
    async () => {
      const response = await api.get('/clients', {
        params: { 
          search: searchTerm || undefined,
          project_type: filterType !== 'all' ? filterType : undefined
        }
      });
      return response.data;
    }
  );

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
    // TODO: Navigate to calendar with client pre-selected
    toast.info(`Schedule feature coming soon for ${client.first_name} ${client.last_name}`);
  };

  const projectTypes = ['all', 'kitchen', 'bathroom', 'commercial', 'outdoor', 'other'];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading clients...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: '1400px', 
      mx: 'auto', 
      width: '100%',
      px: { xs: 1, sm: 2, md: 3 },
      pb: { xs: 2, sm: 3 }
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: { xs: 2, sm: 3 },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        pt: { xs: 1, sm: 2 }
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 600,
          fontSize: { xs: '1.75rem', sm: '2.125rem' },
          textAlign: { xs: 'center', sm: 'left' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          Clients
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClient}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: '100%', sm: '140px' },
            height: 44,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500
          }}
        >
          Add Client
        </Button>
      </Box>

      <Paper sx={{ 
        p: { xs: 3, sm: 4, md: 4 }, 
        mb: { xs: 3, sm: 4 },
        borderRadius: 3,
        boxShadow: 2,
        background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)'
      }}>
        <Grid container spacing={{ xs: 3, sm: 4 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Project Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
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
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary" sx={{
              textAlign: { xs: 'center', md: 'left' },
              fontSize: '0.875rem',
              fontWeight: 500
            }}>
              Total: {clients.length} clients
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={{ xs: 3, sm: 3, md: 4 }}>
        {clients.map((client) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={client.id}>
            <ClientCard
              client={client}
              onEdit={handleEditClient}
              onView={handleViewClient}
              onDelete={handleDeleteClient}
              onSchedule={handleSchedule}
            />
          </Grid>
        ))}
      </Grid>

      {clients.length === 0 && (
        <Paper sx={{ 
          p: { xs: 3, sm: 4 }, 
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: 1
        }}>
          <PersonIcon sx={{ 
            fontSize: { xs: 60, sm: 80 }, 
            color: 'text.secondary', 
            mb: 2 
          }} />
          <Typography variant="h6" color="text.secondary" sx={{ 
            mb: 1,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}>
            No clients found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            mb: 3,
            fontSize: { xs: '0.875rem', sm: '0.875rem' },
            maxWidth: 300,
            mx: 'auto'
          }}>
            Add your first client to get started with managing your projects and estimates
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleAddClient}
            sx={{
              minWidth: { xs: '100%', sm: '160px' },
              height: 44,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Add Client
          </Button>
        </Paper>
      )}

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
    </Box>
  );
};

export default Clients;
