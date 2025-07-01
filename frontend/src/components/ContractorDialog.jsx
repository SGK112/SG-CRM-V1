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
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const ContractorDialog = ({ open, onClose, contractor, onSave, isViewMode = false, isLoading = false }) => {
  const { control, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      business_name: '',
      email: '',
      phone: '',
      specialty: 'countertops',
      hourly_rate: '',
      service_area: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
      },
      license_number: '',
      insurance_company: '',
      insurance_expiry: null,
      certifications: [],
      rating: 5,
      portfolio_url: '',
      notes: '',
      is_available: true,
      is_preferred: false,
      insurance_verified: false,
      background_check: false,
    },
  });

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control,
    name: 'certifications'
  });

  useEffect(() => {
    if (contractor) {
      reset({
        ...contractor,
        insurance_expiry: contractor.insurance_expiry 
          ? dayjs(contractor.insurance_expiry)
          : null,
        certifications: contractor.certifications || []
      });
    } else {
      reset({
        first_name: '',
        last_name: '',
        business_name: '',
        email: '',
        phone: '',
        specialty: 'countertops',
        hourly_rate: '',
        service_area: '',
        address: {
          street: '',
          city: '',
          state: '',
          zip_code: '',
        },
        license_number: '',
        insurance_company: '',
        insurance_expiry: null,
        certifications: [],
        rating: 5,
        portfolio_url: '',
        notes: '',
        is_available: true,
        is_preferred: false,
        insurance_verified: false,
        background_check: false,
      });
    }
  }, [contractor, reset]);

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      rating: parseInt(data.rating),
      insurance_expiry: data.insurance_expiry 
        ? data.insurance_expiry.toISOString()
        : null
    };
    onSave(formattedData);
  };

  const specialties = [
    'countertops',
    'cabinetry', 
    'plumbing',
    'electrical',
    'flooring',
    'tile',
    'painting',
    'drywall',
    'general'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const ratingOptions = [1, 2, 3, 4, 5];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isViewMode 
            ? `Contractor Details - ${contractor?.business_name || `${contractor?.first_name} ${contractor?.last_name}`}`
            : contractor ? 'Edit Contractor' : 'Add New Contractor'
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
              
              <Grid item xs={12}>
                <Controller
                  name="business_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Business Name"
                      disabled={isViewMode}
                      placeholder="e.g., Premium Countertops LLC"
                    />
                  )}
                />
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

              {/* Professional Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Professional Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="specialty"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Primary Specialty"
                      disabled={isViewMode}
                    >
                      {specialties.map((specialty) => (
                        <MenuItem key={specialty} value={specialty}>
                          {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="hourly_rate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Hourly Rate"
                      type="number"
                      disabled={isViewMode}
                      InputProps={{
                        startAdornment: '$',
                        endAdornment: '/hr',
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="service_area"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Service Area"
                      disabled={isViewMode}
                      placeholder="e.g., Dallas Metro, North Texas"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Rating"
                      disabled={isViewMode}
                    >
                      {ratingOptions.map((rating) => (
                        <MenuItem key={rating} value={rating}>
                          {rating} Star{rating > 1 ? 's' : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Business Address
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

              {/* Licensing & Insurance */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Licensing & Insurance
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="license_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="License Number"
                      disabled={isViewMode}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="insurance_company"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Insurance Company"
                      disabled={isViewMode}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="insurance_expiry"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Insurance Expiry Date"
                      disabled={isViewMode}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="portfolio_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Portfolio/Website URL"
                      disabled={isViewMode}
                      placeholder="https://..."
                    />
                  )}
                />
              </Grid>

              {/* Certifications */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Certifications
                  </Typography>
                  {!isViewMode && (
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => appendCertification({ name: '', issuer: '', expiry_date: null })}
                    >
                      Add Certification
                    </Button>
                  )}
                </Box>
              </Grid>
              
              {certificationFields.map((field, index) => (
                <Grid item xs={12} key={field.id}>
                  <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`certifications.${index}.name`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Certification Name"
                              disabled={isViewMode}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`certifications.${index}.issuer`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Issuing Organization"
                              disabled={isViewMode}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Controller
                          name={`certifications.${index}.expiry_date`}
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              {...field}
                              label="Expiry Date"
                              disabled={isViewMode}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                      {!isViewMode && (
                        <Grid item xs={12} sm={1}>
                          <IconButton 
                            onClick={() => removeCertification(index)}
                            color="error"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              ))}

              {/* Status & Preferences */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Status & Verification
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="is_available"
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
                      label="Currently Available"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="is_preferred"
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
                      label="Preferred Contractor"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="insurance_verified"
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
                      label="Insurance Verified"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="background_check"
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
                      label="Background Check Complete"
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
                      placeholder="Additional notes about the contractor, work quality, reliability, etc..."
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
              {isLoading ? 'Saving...' : (contractor ? 'Update Contractor' : 'Create Contractor')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ContractorDialog;
