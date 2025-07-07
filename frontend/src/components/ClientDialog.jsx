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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

const ClientDialog = ({ open, onClose, client, onSave, isViewMode = false, isLoading = false }) => {
  const { control, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      project_type: 'kitchen',
      project_description: '',
      budget: '',
      timeline: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
      },
      preferred_contact: 'email',
      notes: '',
      lead_source: '',
      is_active: true,
      preferred_appointment_time: '',
      project_status: 'lead',
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        ...client,
        preferred_appointment_time: client.preferred_appointment_time || ''
      });
    } else {
      reset({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        project_type: 'kitchen',
        project_description: '',
        budget: '',
        timeline: '',
        address: {
          street: '',
          city: '',
          state: '',
          zip_code: '',
        },
        preferred_contact: 'email',
        notes: '',
        lead_source: '',
        is_active: true,
        preferred_appointment_time: '',
        project_status: 'lead',
      });
    }
  }, [client, reset]);

  const onSubmit = (data) => {
    console.log('Form data:', data);
    const formattedData = {
      ...data,
      budget: data.budget ? parseFloat(data.budget) : null,
    };
    console.log('Formatted data:', formattedData);
    onSave(formattedData);
  };

  const projectTypes = [
    'kitchen',
    'bathroom',
    'commercial',
    'outdoor',
    'other'
  ];

  const leadSources = [
    'website',
    'referral',
    'google',
    'facebook',
    'instagram',
    'yelp',
    'trade_show',
    'repeat_customer',
    'other'
  ];

  const projectStatuses = [
    'lead',
    'consultation_scheduled',
    'quoted',
    'approved',
    'in_progress',
    'completed',
    'cancelled'
  ];

  const contactMethods = [
    'email',
    'phone',
    'text'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isViewMode 
          ? `Client Details - ${client?.first_name} ${client?.last_name}`
          : client ? 'Edit Client' : 'Add New Client'
        }
      </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="first_name"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      required
                      disabled={isViewMode}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="last_name"
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      required
                      disabled={isViewMode}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{ 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      required
                      disabled={isViewMode}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone"
                      disabled={isViewMode}
                    />
                  )}
                />
              </Grid>

              {/* Project Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Project Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="project_type"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Project Type"
                      disabled={isViewMode}
                    >
                      {projectTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="project_status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Project Status"
                      disabled={isViewMode}
                    >
                      {projectStatuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="project_description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Project Description"
                      multiline
                      rows={3}
                      disabled={isViewMode}
                      placeholder="Describe the countertop or remodeling project..."
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="budget"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Budget"
                      type="number"
                      disabled={isViewMode}
                      InputProps={{
                        startAdornment: '$',
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="timeline"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Timeline"
                      disabled={isViewMode}
                      placeholder="e.g., 2-3 weeks, ASAP, Spring 2025"
                    />
                  )}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Project Address
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
                      disabled={isViewMode}
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
                      disabled={isViewMode}
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
                      select
                      label="State"
                      disabled={isViewMode}
                    >
                      {states.map((state) => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </TextField>
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
                      disabled={isViewMode}
                    />
                  )}
                />
              </Grid>

              {/* Contact Preferences */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Contact & Lead Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="preferred_contact"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Preferred Contact Method"
                      disabled={isViewMode}
                    >
                      {contactMethods.map((method) => (
                        <MenuItem key={method} value={method}>
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="lead_source"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Lead Source"
                      disabled={isViewMode}
                    >
                      {leadSources.map((source) => (
                        <MenuItem key={source} value={source}>
                          {source.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="preferred_appointment_time"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Preferred Appointment Time"
                      fullWidth
                      disabled={isViewMode}
                      placeholder="e.g., Mornings, Afternoons, Weekends"
                    />
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
                      label="Active Client"
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
                      disabled={isViewMode}
                      placeholder="Additional notes about the client or project..."
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
              {isLoading ? 'Saving...' : (client ? 'Update Client' : 'Create Client')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
  );
};

export default ClientDialog;
