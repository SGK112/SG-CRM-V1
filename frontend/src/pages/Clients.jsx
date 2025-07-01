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
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <PersonIcon />
          </Avatar>
          <IconButton onClick={handleMenuClick}>
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { onView(client); handleMenuClose(); }}>
              <ViewIcon sx={{ mr: 1 }} />
              View Details
            </MenuItem>
            <MenuItem onClick={() => { onEdit(client); handleMenuClose(); }}>
              <EditIcon sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={() => { onSchedule(client); handleMenuClose(); }}>
              <ScheduleIcon sx={{ mr: 1 }} />
              Schedule
            </MenuItem>
            <MenuItem onClick={() => { onDelete(client.id); handleMenuClose(); }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
        
        <Typography variant="h6" component="div" gutterBottom>
          {client.first_name} {client.last_name}
        </Typography>
        
        {client.project_type && (
          <Chip 
            label={client.project_type} 
            color={getProjectTypeColor(client.project_type)}
            size="small" 
            sx={{ mb: 1 }} 
          />
        )}
        
        <Box sx={{ mt: 2 }}>
          {client.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {client.email}
              </Typography>
            </Box>
          )}
          
          {client.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {client.phone}
              </Typography>
            </Box>
          )}
          
          {client.address?.city && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {client.address.city}, {client.address.state}
              </Typography>
            </Box>
          )}
        </Box>

        {client.budget && (
          <Typography variant="body2" color="primary" sx={{ mt: 2, fontWeight: 'bold' }}>
            Budget: ${client.budget.toLocaleString()}
          </Typography>
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
    <Box sx={{ maxWidth: '1400px', mx: 'auto', width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: { xs: 3, sm: 4 },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Clients
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClient}
        >
          Add Client
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Project Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {projectTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type === 'all' ? 'All Projects' : type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              Total: {clients.length} clients
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {clients.map((client) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={client.id}>
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
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No clients found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first client to get started
          </Typography>
          <Button variant="contained" onClick={handleAddClient}>
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
