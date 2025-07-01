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
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Today as TodayIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import AppointmentDialog from '../components/AppointmentDialog';
import dayjs from 'dayjs';

const AppointmentCard = ({ appointment, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'consultation': return 'primary';
      case 'measurement': return 'info';
      case 'installation': return 'success';
      case 'follow_up': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'confirmed': return 'success';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      case 'no_show': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar sx={{ bgcolor: getTypeColor(appointment.type), mr: 2 }}>
              <EventIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {dayjs(appointment.scheduled_time).format('h:mm A')} - {appointment.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Client: {appointment.client_name}
              </Typography>
              {appointment.contractor_name && (
                <Typography variant="body2" color="text.secondary">
                  Contractor: {appointment.contractor_name}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {appointment.address}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={appointment.type} 
              color={getTypeColor(appointment.type)}
              size="small" 
            />
            <Chip 
              label={appointment.status} 
              color={getStatusColor(appointment.status)}
              size="small" 
            />
            <IconButton onClick={handleMenuClick}>
              <MoreIcon />
            </IconButton>
          </Box>
        </Box>
        
        {appointment.notes && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            {appointment.notes}
          </Typography>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { onEdit(appointment); handleMenuClose(); }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => { onDelete(appointment.id); handleMenuClose(); }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery(
    ['appointments', selectedDate.format('YYYY-MM-DD'), viewMode, filterType],
    async () => {
      const startDate = viewMode === 'day' 
        ? selectedDate.startOf('day')
        : viewMode === 'week' 
        ? selectedDate.startOf('week')
        : selectedDate.startOf('month');
      
      const endDate = viewMode === 'day' 
        ? selectedDate.endOf('day')
        : viewMode === 'week' 
        ? selectedDate.endOf('week')
        : selectedDate.endOf('month');

      const response = await api.get('/appointments', {
        params: { 
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          type: filterType !== 'all' ? filterType : undefined
        }
      });
      return response.data;
    }
  );

  const { data: clients = [] } = useQuery('clients', async () => {
    const response = await api.get('/clients');
    return response.data;
  });

  const { data: contractors = [] } = useQuery('contractors', async () => {
    const response = await api.get('/contractors');
    return response.data;
  });

  const createMutation = useMutation(
    (appointmentData) => api.post('/appointments', appointmentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
        toast.success('Appointment scheduled successfully');
        setAppointmentDialogOpen(false);
        setSelectedAppointment(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to schedule appointment');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/appointments/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
        toast.success('Appointment updated successfully');
        setAppointmentDialogOpen(false);
        setSelectedAppointment(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update appointment');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/appointments/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
        toast.success('Appointment deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to delete appointment');
      },
    }
  );

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setAppointmentDialogOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDialogOpen(true);
  };

  const handleSaveAppointment = (appointmentData) => {
    if (selectedAppointment) {
      updateMutation.mutate({ id: selectedAppointment.id, data: appointmentData });
    } else {
      createMutation.mutate(appointmentData);
    }
  };

  const handleDeleteAppointment = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      deleteMutation.mutate(id);
    }
  };

  const navigateDate = (direction) => {
    const unit = viewMode === 'day' ? 'day' : viewMode === 'week' ? 'week' : 'month';
    setSelectedDate(selectedDate.add(direction, unit));
  };

  const goToToday = () => {
    setSelectedDate(dayjs());
  };

  const getDateRangeDisplay = () => {
    switch (viewMode) {
      case 'day':
        return selectedDate.format('MMMM D, YYYY');
      case 'week':
        const weekStart = selectedDate.startOf('week');
        const weekEnd = selectedDate.endOf('week');
        return `${weekStart.format('MMM D')} - ${weekEnd.format('MMM D, YYYY')}`;
      case 'month':
        return selectedDate.format('MMMM YYYY');
      default:
        return '';
    }
  };

  const appointmentTypes = ['all', 'consultation', 'measurement', 'installation', 'follow_up'];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading calendar...</Typography>
      </Box>
    );
  }

  // Group appointments by date for better display
  const appointmentsByDate = appointments.reduce((acc, appointment) => {
    const date = dayjs(appointment.scheduled_time).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Calendar & Scheduling
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAppointment}
        >
          Schedule Appointment
        </Button>
      </Box>

      {/* Calendar Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => navigateDate(-1)}>
                <PrevIcon />
              </IconButton>
              <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
                {getDateRangeDisplay()}
              </Typography>
              <IconButton onClick={() => navigateDate(1)}>
                <NextIcon />
              </IconButton>
              <Button
                startIcon={<TodayIcon />}
                onClick={goToToday}
                sx={{ ml: 2 }}
              >
                Today
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>View</InputLabel>
              <Select
                value={viewMode}
                label="View"
                onChange={(e) => setViewMode(e.target.value)}
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter Type</InputLabel>
              <Select
                value={filterType}
                label="Filter Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                {appointmentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Appointments Display */}
      {viewMode === 'day' ? (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Appointments for {selectedDate.format('MMMM D, YYYY')}
          </Typography>
          {appointments.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No appointments scheduled
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Schedule your first appointment to get started
              </Typography>
              <Button variant="contained" onClick={handleAddAppointment}>
                Schedule Appointment
              </Button>
            </Paper>
          ) : (
            appointments
              .sort((a, b) => dayjs(a.scheduled_time).diff(dayjs(b.scheduled_time)))
              .map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={handleEditAppointment}
                  onDelete={handleDeleteAppointment}
                />
              ))
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {Object.entries(appointmentsByDate)
            .sort(([a], [b]) => dayjs(a).diff(dayjs(b)))
            .map(([date, dayAppointments]) => (
              <Grid item xs={12} md={viewMode === 'week' ? 12 : 6} key={date}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {dayjs(date).format('MMMM D, YYYY')}
                  </Typography>
                  {dayAppointments
                    .sort((a, b) => dayjs(a.scheduled_time).diff(dayjs(b.scheduled_time)))
                    .map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onEdit={handleEditAppointment}
                        onDelete={handleDeleteAppointment}
                      />
                    ))}
                </Paper>
              </Grid>
            ))}
          {Object.keys(appointmentsByDate).length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No appointments in this {viewMode}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Schedule appointments to see them here
                </Typography>
                <Button variant="contained" onClick={handleAddAppointment}>
                  Schedule Appointment
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <AppointmentDialog
        open={appointmentDialogOpen}
        onClose={() => {
          setAppointmentDialogOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSave={handleSaveAppointment}
        clients={clients}
        contractors={contractors}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </Box>
  );
};

export default Calendar;
