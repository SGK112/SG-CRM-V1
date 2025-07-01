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
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Build as BuildIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Assignment as AssignIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import ContractorDialog from '../components/ContractorDialog';

const ContractorCard = ({ contractor, onEdit, onView, onDelete, onAssign }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getSpecialtyColor = (specialty) => {
    switch (specialty?.toLowerCase()) {
      case 'countertops': return 'primary';
      case 'plumbing': return 'info';
      case 'electrical': return 'warning';
      case 'flooring': return 'secondary';
      case 'cabinetry': return 'success';
      default: return 'default';
    }
  };

  const renderRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? 
          <StarIcon key={i} sx={{ fontSize: 16, color: 'gold' }} /> :
          <StarBorderIcon key={i} sx={{ fontSize: 16, color: 'grey.300' }} />
      );
    }
    return stars;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
            <BuildIcon />
          </Avatar>
          <IconButton onClick={handleMenuClick}>
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { onView(contractor); handleMenuClose(); }}>
              <ViewIcon sx={{ mr: 1 }} />
              View Details
            </MenuItem>
            <MenuItem onClick={() => { onEdit(contractor); handleMenuClose(); }}>
              <EditIcon sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={() => { onAssign(contractor); handleMenuClose(); }}>
              <AssignIcon sx={{ mr: 1 }} />
              Assign Job
            </MenuItem>
            <MenuItem onClick={() => { onDelete(contractor.id); handleMenuClose(); }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
        
        <Typography variant="h6" component="div" gutterBottom>
          {contractor.business_name || `${contractor.first_name} ${contractor.last_name}`}
        </Typography>
        
        {contractor.specialty && (
          <Chip 
            label={contractor.specialty} 
            color={getSpecialtyColor(contractor.specialty)}
            size="small" 
            sx={{ mb: 1 }} 
          />
        )}

        {contractor.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {renderRating(contractor.rating)}
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({contractor.rating}/5)
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 2 }}>
          {contractor.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {contractor.email}
              </Typography>
            </Box>
          )}
          
          {contractor.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {contractor.phone}
              </Typography>
            </Box>
          )}
          
          {contractor.service_area && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {contractor.service_area}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {contractor.is_available && (
            <Chip label="Available" color="success" size="small" />
          )}
          {contractor.is_preferred && (
            <Chip label="Preferred" color="primary" size="small" />
          )}
          {contractor.insurance_verified && (
            <Chip label="Insured" color="info" size="small" />
          )}
        </Box>

        {contractor.hourly_rate && (
          <Typography variant="body2" color="primary" sx={{ mt: 2, fontWeight: 'bold' }}>
            ${contractor.hourly_rate}/hour
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const Contractors = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterAvailable, setFilterAvailable] = useState('all');
  const queryClient = useQueryClient();

  const { data: contractors = [], isLoading } = useQuery(
    ['contractors', searchTerm, filterSpecialty, filterAvailable],
    async () => {
      const response = await api.get('/contractors', {
        params: { 
          search: searchTerm || undefined,
          specialty: filterSpecialty !== 'all' ? filterSpecialty : undefined,
          available: filterAvailable !== 'all' ? filterAvailable === 'true' : undefined
        }
      });
      return response.data;
    }
  );

  const createMutation = useMutation(
    (contractorData) => api.post('/contractors', contractorData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contractors');
        toast.success('Contractor created successfully');
        setDialogOpen(false);
        setSelectedContractor(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to create contractor');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/contractors/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contractors');
        toast.success('Contractor updated successfully');
        setDialogOpen(false);
        setSelectedContractor(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update contractor');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/contractors/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contractors');
        toast.success('Contractor deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to delete contractor');
      },
    }
  );

  const handleAddContractor = () => {
    setSelectedContractor(null);
    setIsViewMode(false);
    setDialogOpen(true);
  };

  const handleEditContractor = (contractor) => {
    setSelectedContractor(contractor);
    setIsViewMode(false);
    setDialogOpen(true);
  };

  const handleViewContractor = (contractor) => {
    setSelectedContractor(contractor);
    setIsViewMode(true);
    setDialogOpen(true);
  };

  const handleSaveContractor = (contractorData) => {
    if (selectedContractor) {
      updateMutation.mutate({ id: selectedContractor.id, data: contractorData });
    } else {
      createMutation.mutate(contractorData);
    }
  };

  const handleDeleteContractor = (id) => {
    if (window.confirm('Are you sure you want to delete this contractor?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAssignJob = (contractor) => {
    // TODO: Open job assignment dialog
    toast.info(`Job assignment feature coming soon for ${contractor.business_name || contractor.first_name}`);
  };

  const specialties = [
    'all', 'countertops', 'cabinetry', 'plumbing', 'electrical', 
    'flooring', 'tile', 'painting', 'drywall', 'general'
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading contractors...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Contractors
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddContractor}
        >
          Add Contractor
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search contractors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Specialty"
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              {specialties.map((specialty) => (
                <MenuItem key={specialty} value={specialty}>
                  {specialty === 'all' ? 'All Specialties' : specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Availability"
              value={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="true">Available</MenuItem>
              <MenuItem value="false">Busy</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              Total: {contractors.length}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {contractors.map((contractor) => (
          <Grid item xs={12} sm={6} md={4} key={contractor.id}>
            <ContractorCard
              contractor={contractor}
              onEdit={handleEditContractor}
              onView={handleViewContractor}
              onDelete={handleDeleteContractor}
              onAssign={handleAssignJob}
            />
          </Grid>
        ))}
      </Grid>

      {contractors.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No contractors found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first contractor to get started
          </Typography>
          <Button variant="contained" onClick={handleAddContractor}>
            Add Contractor
          </Button>
        </Paper>
      )}

      <ContractorDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedContractor(null);
          setIsViewMode(false);
        }}
        contractor={selectedContractor}
        onSave={handleSaveContractor}
        isViewMode={isViewMode}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </Box>
  );
};

export default Contractors;
