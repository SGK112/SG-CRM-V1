import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

const ServiceDialog = ({ open, onClose, service, onSave, isViewMode = false, isLoading = false }) => {
  const { control, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: 'countertops',
      pricing_type: 'per_sqft',
      base_price: '',
      materials: [],
      estimated_duration: '',
      duration_unit: 'hours',
      requirements: '',
      warranty_period: '',
      is_active: true,
      includes_materials: false,
      requires_consultation: true,
    },
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control,
    name: 'materials'
  });

  useEffect(() => {
    if (service) {
      reset({
        ...service,
        materials: service.materials || []
      });
    } else {
      reset({
        name: '',
        description: '',
        category: 'countertops',
        pricing_type: 'per_sqft',
        base_price: '',
        materials: [],
        estimated_duration: '',
        duration_unit: 'hours',
        requirements: '',
        warranty_period: '',
        is_active: true,
        includes_materials: false,
        requires_consultation: true,
      });
    }
  }, [service, reset]);

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      base_price: data.base_price ? parseFloat(data.base_price) : null,
      estimated_duration: data.estimated_duration ? parseInt(data.estimated_duration) : null,
    };
    onSave(formattedData);
  };

  const categories = [
    'countertops',
    'cabinetry',
    'flooring',
    'backsplash',
    'plumbing',
    'electrical',
    'design',
    'installation',
    'repair',
    'maintenance'
  ];

  const pricingTypes = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'per_sqft', label: 'Per Square Foot' },
    { value: 'per_hour', label: 'Per Hour' },
    { value: 'quote', label: 'Quote Required' },
  ];

  const durationUnits = [
    'hours',
    'days',
    'weeks'
  ];

  // Common countertop and remodeling materials
  const commonMaterials = [
    'Granite',
    'Quartz',
    'Marble',
    'Quartzite',
    'Butcher Block',
    'Concrete',
    'Laminate',
    'Stainless Steel',
    'Tile',
    'Adhesive',
    'Sealant',
    'Edge Polish',
    'Support Brackets',
    'Undermount Hardware',
    'Plywood',
    'Hardware',
    'Screws',
    'Hinges'
  ];

  const addMaterial = (materialName) => {
    if (materialName && !watch('materials').includes(materialName)) {
      const currentMaterials = watch('materials');
      setValue('materials', [...currentMaterials, materialName]);
    }
  };

  const removeMaterialByName = (materialName) => {
    const currentMaterials = watch('materials');
    setValue('materials', currentMaterials.filter(m => m !== materialName));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isViewMode 
          ? `Service Details - ${service?.name}`
          : service ? 'Edit Service' : 'Add New Service'
        }
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Service Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Service name is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Service Name"
                    required
                    disabled={isViewMode}
                    error={!!error}
                    helperText={error?.message}
                    placeholder="e.g., Granite Countertop Installation"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Description"
                    required
                    multiline
                    rows={3}
                    disabled={isViewMode}
                    error={!!error}
                    helperText={error?.message}
                    placeholder="Detailed description of the service including what's included..."
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
                    select
                    label="Category"
                    disabled={isViewMode}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={field.value} 
                        onChange={field.onChange}
                        disabled={isViewMode}
                      />
                    }
                    label="Active Service"
                  />
                )}
              />
            </Grid>

            {/* Pricing */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Pricing Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="pricing_type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Pricing Type"
                    disabled={isViewMode}
                  >
                    {pricingTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="base_price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Base Price"
                    type="number"
                    disabled={isViewMode || watch('pricing_type') === 'quote'}
                    InputProps={{
                      startAdornment: '$',
                    }}
                    helperText={
                      watch('pricing_type') === 'quote' 
                        ? 'Quote required - price will be determined per project'
                        : `Price ${watch('pricing_type') === 'fixed' ? 'for complete service' : 
                           watch('pricing_type') === 'per_sqft' ? 'per square foot' : 
                           'per hour'}`
                    }
                  />
                )}
              />
            </Grid>

            {/* Duration */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Duration & Timeline
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="estimated_duration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Estimated Duration"
                    type="number"
                    disabled={isViewMode}
                    placeholder="e.g., 4"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="duration_unit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Duration Unit"
                    disabled={isViewMode}
                  >
                    {durationUnits.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Materials */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Materials & Requirements
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Materials Used
              </Typography>
              {!isViewMode && (
                <Autocomplete
                  options={commonMaterials}
                  renderInput={(params) => (
                    <TextField {...params} label="Add Material" placeholder="Type or select materials" />
                  )}
                  onChange={(_, value) => value && addMaterial(value)}
                  sx={{ mb: 2 }}
                />
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {watch('materials').map((material, index) => (
                  <Chip
                    key={index}
                    label={material}
                    onDelete={isViewMode ? undefined : () => removeMaterialByName(material)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="includes_materials"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={field.value} 
                        onChange={field.onChange}
                        disabled={isViewMode}
                      />
                    }
                    label="Price Includes Materials"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="requires_consultation"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={field.value} 
                        onChange={field.onChange}
                        disabled={isViewMode}
                      />
                    }
                    label="Requires Consultation"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="requirements"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Special Requirements"
                    multiline
                    rows={3}
                    disabled={isViewMode}
                    placeholder="Any special requirements, preparation needed, or conditions..."
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="warranty_period"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Warranty Period"
                    disabled={isViewMode}
                    placeholder="e.g., 1 year, 5 years, lifetime"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {isViewMode ? 'Close' : 'Cancel'}
        </Button>
        {!isViewMode && (
          <Button 
            onClick={handleSubmit(onSubmit)} 
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (service ? 'Update Service' : 'Create Service')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ServiceDialog;
