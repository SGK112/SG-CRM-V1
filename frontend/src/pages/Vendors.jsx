import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../services/api';
import FileUploadDialog from '../components/FileUploadDialog';

const VendorCard = ({ vendor, onEdit, onDelete, onUploadFiles }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <BusinessIcon />
          </Avatar>
          <IconButton onClick={handleMenuClick}>
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { onEdit(vendor); handleMenuClose(); }}>
              Edit
            </MenuItem>
            <MenuItem onClick={() => { onUploadFiles(vendor); handleMenuClose(); }}>
              Upload Files
            </MenuItem>
            <MenuItem onClick={() => { onDelete(vendor.id); handleMenuClose(); }}>
              Delete
            </MenuItem>
          </Menu>
        </Box>
        
        <Typography variant="h6" component="div" gutterBottom>
          {vendor.name}
        </Typography>
        
        {vendor.company_name && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {vendor.company_name}
          </Typography>
        )}
        
        {vendor.category && (
          <Chip label={vendor.category} size="small" sx={{ mb: 1 }} />
        )}
        
        <Box sx={{ mt: 2 }}>
          {vendor.contact_info?.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {vendor.contact_info.email}
              </Typography>
            </Box>
          )}
          
          {vendor.contact_info?.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {vendor.contact_info.phone}
              </Typography>
            </Box>
          )}
          
          {vendor.address?.city && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {vendor.address.city}, {vendor.address.state}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      
      <CardActions>
        <Button size="small" onClick={() => onEdit(vendor)}>
          View Details
        </Button>
        <Button 
          size="small" 
          startIcon={<UploadIcon />}
          onClick={() => onUploadFiles(vendor)}
        >
          Files
        </Button>
      </CardActions>
    </Card>
  );
};

const VendorDialog = ({ open, onClose, vendor, onSave }) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      company_name: '',
      category: '',
      contact_info: {
        name: '',
        email: '',
        phone: '',
        position: '',
      },
      address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
      },
      notes: '',
    },
  });

  React.useEffect(() => {
    if (vendor) {
      reset(vendor);
    } else {
      reset({
        name: '',
        company_name: '',
        category: '',
        contact_info: {
          name: '',
          email: '',
          phone: '',
          position: '',
        },
        address: {
          street: '',
          city: '',
          state: '',
          zip_code: '',
        },
        notes: '',
      });
    }
  }, [vendor, reset]);

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {vendor ? 'Edit Vendor' : 'Add New Vendor'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Vendor Name"
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="company_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Company Name"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Category"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="contact_info.name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Contact Name"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="contact_info.email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="contact_info.phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="contact_info.position"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Position"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Address
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="address.street"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Street Address"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="address.city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="City"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="address.state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="State"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="address.zip_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ZIP Code"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">
          {vendor ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Vendors = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState(false);
  const [selectedVendorForUpload, setSelectedVendorForUpload] = useState(null);
  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery(
    ['vendors', searchTerm],
    async () => {
      const response = await api.get('/vendors', {
        params: { search: searchTerm || undefined }
      });
      return response.data;
    }
  );

  const createMutation = useMutation(
    (vendorData) => api.post('/vendors', vendorData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vendors');
        toast.success('Vendor created successfully');
        setDialogOpen(false);
        setSelectedVendor(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to create vendor');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/vendors/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vendors');
        toast.success('Vendor updated successfully');
        setDialogOpen(false);
        setSelectedVendor(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update vendor');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/vendors/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vendors');
        toast.success('Vendor deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to delete vendor');
      },
    }
  );

  const handleAddVendor = () => {
    setSelectedVendor(null);
    setDialogOpen(true);
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setDialogOpen(true);
  };

  const handleSaveVendor = (vendorData) => {
    if (selectedVendor) {
      updateMutation.mutate({ id: selectedVendor.id, data: vendorData });
    } else {
      createMutation.mutate(vendorData);
    }
  };

  const handleDeleteVendor = (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleUploadFiles = (vendor) => {
    setSelectedVendorForUpload(vendor);
    setFileUploadDialogOpen(true);
  };

  const handleFileUpload = async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('vendor_id', selectedVendorForUpload.id);

      await api.post('/vendors/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Files uploaded successfully');
      setFileUploadDialogOpen(false);
      setSelectedVendorForUpload(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload files');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading vendors...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Vendors
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddVendor}
        >
          Add Vendor
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          label="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
      </Paper>

      <Grid container spacing={3}>
        {vendors.map((vendor) => (
          <Grid item xs={12} sm={6} md={4} key={vendor.id}>
            <VendorCard
              vendor={vendor}
              onEdit={handleEditVendor}
              onDelete={handleDeleteVendor}
              onUploadFiles={handleUploadFiles}
            />
          </Grid>
        ))}
      </Grid>

      {vendors.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No vendors found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first vendor to get started
          </Typography>
          <Button variant="contained" onClick={handleAddVendor}>
            Add Vendor
          </Button>
        </Paper>
      )}

      <VendorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        vendor={selectedVendor}
        onSave={handleSaveVendor}
      />
      
      <FileUploadDialog
        open={fileUploadDialogOpen}
        onClose={() => {
          setFileUploadDialogOpen(false);
          setSelectedVendorForUpload(null);
        }}
        onUpload={handleFileUpload}
        title={`Upload Files for ${selectedVendorForUpload?.name || 'Vendor'}`}
        maxFiles={10}
      />
    </Box>
  );
};

export default Vendors;
