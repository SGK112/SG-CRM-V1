import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  HomeRepairService as ServiceIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  AttachMoney as PriceIcon,
  Schedule as TimeIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import ServiceDialog from '../components/ServiceDialog';

const ServiceCard = ({ service, onEdit, onView, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'countertops': return 'primary';
      case 'cabinetry': return 'secondary';
      case 'flooring': return 'info';
      case 'backsplash': return 'success';
      case 'plumbing': return 'warning';
      case 'electrical': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ bgcolor: getCategoryColor(service.category), mr: 2 }}>
            <ServiceIcon />
          </Avatar>
          <IconButton onClick={handleMenuClick}>
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { onView(service); handleMenuClose(); }}>
              <ViewIcon sx={{ mr: 1 }} />
              View Details
            </MenuItem>
            <MenuItem onClick={() => { onEdit(service); handleMenuClose(); }}>
              <EditIcon sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={() => { onDelete(service.id); handleMenuClose(); }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
        
        <Typography variant="h6" component="div" gutterBottom>
          {service.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {service.description}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={service.category} 
            color={getCategoryColor(service.category)}
            size="small" 
            sx={{ mr: 1, mb: 1 }}
          />
          {service.is_active ? (
            <Chip label="Active" color="success" size="small" />
          ) : (
            <Chip label="Inactive" color="default" size="small" />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PriceIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {service.pricing_type === 'fixed' 
              ? `$${service.base_price?.toLocaleString()}`
              : service.pricing_type === 'per_sqft'
              ? `$${service.base_price}/sq ft`
              : service.pricing_type === 'per_hour'
              ? `$${service.base_price}/hour`
              : 'Quote Required'
            }
          </Typography>
        </Box>

        {service.estimated_duration && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {service.estimated_duration} {service.duration_unit}
            </Typography>
          </Box>
        )}

        {service.materials && service.materials.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Materials:</strong>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {service.materials.slice(0, 3).map((material, index) => (
                <Chip 
                  key={index} 
                  label={material} 
                  size="small" 
                  variant="outlined" 
                />
              ))}
              {service.materials.length > 3 && (
                <Chip 
                  label={`+${service.materials.length - 3} more`} 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Services = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery(
    ['services', searchTerm, filterCategory, filterActive],
    async () => {
      const response = await api.get('/services', {
        params: { 
          search: searchTerm || undefined,
          category: filterCategory !== 'all' ? filterCategory : undefined,
          active: filterActive !== 'all' ? filterActive === 'true' : undefined
        }
      });
      return response.data;
    }
  );

  const createMutation = useMutation(
    (serviceData) => api.post('/services', serviceData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        toast.success('Service created successfully');
        setDialogOpen(false);
        setSelectedService(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to create service');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/services/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        toast.success('Service updated successfully');
        setDialogOpen(false);
        setSelectedService(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update service');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/services/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
        toast.success('Service deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to delete service');
      },
    }
  );

  const handleAddService = () => {
    setSelectedService(null);
    setIsViewMode(false);
    setDialogOpen(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setIsViewMode(false);
    setDialogOpen(true);
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setIsViewMode(true);
    setDialogOpen(true);
  };

  const handleSaveService = (serviceData) => {
    if (selectedService) {
      updateMutation.mutate({ id: selectedService.id, data: serviceData });
    } else {
      createMutation.mutate(serviceData);
    }
  };

  const handleDeleteService = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteMutation.mutate(id);
    }
  };

  const categories = [
    'all', 'countertops', 'cabinetry', 'flooring', 'backsplash', 
    'plumbing', 'electrical', 'design', 'installation', 'repair'
  ];

  // Group services by category for better organization
  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading services...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Services & Pricing
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddService}
        >
          Add Service
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              Total: {services.length} services
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Service Categories Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Service Categories
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <Grid item xs={6} sm={4} md={3} key={category}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h4" color="primary">
                  {categoryServices.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {filterCategory === 'all' ? (
        // Show all services grouped by category
        Object.entries(servicesByCategory).map(([category, categoryServices]) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ textTransform: 'capitalize' }}>
              {category} ({categoryServices.length})
            </Typography>
            <Grid container spacing={3}>
              {categoryServices.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service.id}>
                  <ServiceCard
                    service={service}
                    onEdit={handleEditService}
                    onView={handleViewService}
                    onDelete={handleDeleteService}
                  />
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ mt: 3 }} />
          </Box>
        ))
      ) : (
        // Show filtered services
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <ServiceCard
                service={service}
                onEdit={handleEditService}
                onView={handleViewService}
                onDelete={handleDeleteService}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {services.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No services found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first service to get started
          </Typography>
          <Button variant="contained" onClick={handleAddService}>
            Add Service
          </Button>
        </Paper>
      )}

      <ServiceDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedService(null);
          setIsViewMode(false);
        }}
        service={selectedService}
        onSave={handleSaveService}
        isViewMode={isViewMode}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </Box>
  );
};

export default Services;
