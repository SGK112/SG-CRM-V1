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
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const AppointmentDialog = ({ 
  open, 
  onClose, 
  appointment, 
  onSave, 
  clients = [], 
  contractors = [], 
  isLoading = false 
}) => {
  const { control, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      title: '',
      type: 'consultation',
      scheduled_time: dayjs(),
      duration: 60,
      client_id: '',
      contractor_id: '',
      address: '',
      notes: '',
      status: 'scheduled',
      reminder_sent: false,
    },
  });

  const selectedClientId = watch('client_id');
  const selectedClient = clients.find(c => c.id === selectedClientId);

  useEffect(() => {
    if (appointment) {
      reset({
        ...appointment,
        scheduled_time: dayjs(appointment.scheduled_time),
      });
    } else {
      reset({
        title: '',
        type: 'consultation',
        scheduled_time: dayjs().add(1, 'hour').startOf('hour'),
        duration: 60,
        client_id: '',
        contractor_id: '',
        address: '',
        notes: '',
        status: 'scheduled',
        reminder_sent: false,
      });
    }
  }, [appointment, reset]);

  // Auto-fill address when client is selected
  useEffect(() => {
    if (selectedClient && selectedClient.address) {
      const fullAddress = [
        selectedClient.address.street,
        selectedClient.address.city,
        selectedClient.address.state,
        selectedClient.address.zip_code
      ].filter(Boolean).join(', ');
      setValue('address', fullAddress);
    }
  }, [selectedClient, setValue]);

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      scheduled_time: data.scheduled_time.toISOString(),
      duration: parseInt(data.duration),
    };
    onSave(formattedData);
  };

  const appointmentTypes = [
    { value: 'consultation', label: 'Initial Consultation' },
    { value: 'measurement', label: 'Measurement Visit' },
    { value: 'installation', label: 'Installation' },
    { value: 'follow_up', label: 'Follow-up Visit' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'repair', label: 'Repair/Service' },
  ];

  const appointmentStatuses = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' },
  ];

  const durations = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours (Full Day)' },
  ];

  const getDefaultTitle = (type, clientName) => {
    const titles = {
      consultation: `Initial Consultation${clientName ? ` - ${clientName}` : ''}`,
      measurement: `Measurement Visit${clientName ? ` - ${clientName}` : ''}`,
      installation: `Installation${clientName ? ` - ${clientName}` : ''}`,
      follow_up: `Follow-up Visit${clientName ? ` - ${clientName}` : ''}`,
      delivery: `Delivery${clientName ? ` - ${clientName}` : ''}`,
      repair: `Repair/Service${clientName ? ` - ${clientName}` : ''}`,
    };
    return titles[type] || `Appointment${clientName ? ` - ${clientName}` : ''}`;
  };

  // Auto-generate title when type or client changes
  const watchedType = watch('type');
  useEffect(() => {
    if (!appointment) { // Only auto-generate for new appointments
      const clientName = selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : '';
      setValue('title', getDefaultTitle(watchedType, clientName));
    }
  }, [watchedType, selectedClient, setValue, appointment]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Appointment Details
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Title is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Appointment Title"
                      required
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Appointment Type</InputLabel>
                      <Select {...field} label="Appointment Type">
                        {appointmentTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        {appointmentStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <Controller
                  name="scheduled_time"
                  control={control}
                  rules={{ required: 'Date and time is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <DateTimePicker
                      {...field}
                      label="Date & Time"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Controller
                  name="duration"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Duration</InputLabel>
                      <Select {...field} label="Duration">
                        {durations.map((duration) => (
                          <MenuItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Client and Contractor */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  People & Location
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="client_id"
                  control={control}
                  rules={{ required: 'Client is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      options={clients}
                      getOptionLabel={(option) => 
                        option ? `${option.first_name} ${option.last_name}` : ''
                      }
                      value={clients.find(c => c.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Client"
                          required
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="contractor_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={contractors}
                      getOptionLabel={(option) => 
                        option ? (option.business_name || `${option.first_name} ${option.last_name}`) : ''
                      }
                      value={contractors.find(c => c.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Contractor (Optional)"
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  rules={{ required: 'Address is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address"
                      required
                      multiline
                      rows={2}
                      error={!!error}
                      helperText={error?.message || 'Address will auto-fill when client is selected'}
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
                      placeholder="Special instructions, materials needed, access information, etc..."
                    />
                  )}
                />
              </Grid>

              {/* Quick Info for Selected Client */}
              {selectedClient && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    bgcolor: 'grey.50', 
                    border: 1, 
                    borderColor: 'grey.300', 
                    borderRadius: 1, 
                    p: 2,
                    mt: 1
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Client Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Email:</strong> {selectedClient.email}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong> {selectedClient.phone}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Project:</strong> {selectedClient.project_type}
                        </Typography>
                        {selectedClient.budget && (
                          <Typography variant="body2">
                            <strong>Budget:</strong> ${selectedClient.budget.toLocaleString()}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (appointment ? 'Update Appointment' : 'Schedule Appointment')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AppointmentDialog;
