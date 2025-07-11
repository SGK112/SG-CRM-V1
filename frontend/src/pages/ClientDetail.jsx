import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fab,
  Menu,
  MenuItem,
  Alert,
  Badge,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
} from '@mui/lab';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  AttachFile as AttachFileIcon,
  Chat as ChatIcon,
  Payment as PaymentIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Build as BuildIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { clientsAPI } from '../services/api';
import ClientDialog from '../components/ClientDialog';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch client data
  const { data: client, isLoading, error } = useQuery(
    ['client', id],
    () => clientsAPI.getById(id).then(res => res.data),
    {
      enabled: !!id,
      onError: (err) => {
        toast.error('Failed to load client details');
        console.error('Error fetching client:', err);
      }
    }
  );

  // Mock data for interactions (in real app, this would come from API)
  const mockInteractions = [
    {
      id: 1,
      type: 'call',
      title: 'Initial consultation call',
      description: 'Discussed project requirements and timeline',
      date: '2025-01-15T10:00:00Z',
      user: 'John Smith',
      icon: <PhoneIcon />,
      color: 'primary'
    },
    {
      id: 2,
      type: 'meeting',
      title: 'Site visit scheduled',
      description: 'In-home consultation to measure space and discuss design',
      date: '2025-01-18T14:00:00Z',
      user: 'Sarah Johnson',
      icon: <HomeIcon />,
      color: 'secondary'
    },
    {
      id: 3,
      type: 'estimate',
      title: 'Estimate created',
      description: 'Detailed estimate for kitchen renovation project',
      date: '2025-01-20T09:30:00Z',
      user: 'Mike Wilson',
      icon: <AssessmentIcon />,
      color: 'success'
    },
    {
      id: 4,
      type: 'email',
      title: 'Follow-up email sent',
      description: 'Sent additional material samples and timeline clarification',
      date: '2025-01-22T16:15:00Z',
      user: 'Lisa Davis',
      icon: <EmailIcon />,
      color: 'info'
    }
  ];

  const mockFiles = [
    { id: 1, name: 'Kitchen_Design_Plans.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2025-01-15' },
    { id: 2, name: 'Material_Samples.jpg', type: 'image', size: '1.8 MB', uploadedAt: '2025-01-18' },
    { id: 3, name: 'Contract_Draft.docx', type: 'document', size: '156 KB', uploadedAt: '2025-01-20' },
  ];

  const mockEstimates = [
    { id: 1, name: 'Kitchen Renovation - Initial', total: 85000, status: 'pending', date: '2025-01-20' },
    { id: 2, name: 'Kitchen Renovation - Revised', total: 89500, status: 'approved', date: '2025-01-25' },
  ];

  const mockPayments = [
    { id: 1, amount: 17900, type: 'Deposit', status: 'completed', date: '2025-01-26' },
    { id: 2, amount: 35800, type: 'Progress Payment 1', status: 'pending', date: '2025-02-15' },
  ];

  const handleEditClient = () => {
    setIsEditDialogOpen(true);
    setActionMenuAnchor(null);
  };

  const handleSaveClient = async (updatedClient) => {
    try {
      await clientsAPI.update(id, updatedClient);
      queryClient.invalidateQueries(['client', id]);
      setIsEditDialogOpen(false);
      toast.success('Client updated successfully');
    } catch (error) {
      toast.error('Failed to update client');
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In real app, this would call an API
      toast.success('Note added successfully');
      setNewNote('');
      setIsAddNoteDialogOpen(false);
    }
  };

  const getProjectStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'lead': return 'warning';
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getClientPriority = (client) => {
    if (!client) return { label: 'Standard', color: '#666', icon: <BusinessIcon /> };
    if (client.budget > 50000) return { label: 'VIP', color: '#DC2626', icon: <StarIcon /> };      // Changed to red
    if (client.budget > 25000) return { label: 'Premium', color: '#B91C1C', icon: <TrendingUpIcon /> }; // Changed to dark red
    return { label: 'Standard', color: '#666', icon: <BusinessIcon /> };
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Loading client details...</Typography>
      </Box>
    );
  }

  if (error || !client) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || 'Client not found'}
        </Alert>
        <Button onClick={() => navigate('/clients')} startIcon={<ArrowBackIcon />}>
          Back to Clients
        </Button>
      </Box>
    );
  }

  const priority = getClientPriority(client);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/clients')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Client Details
        </Typography>
        <IconButton onClick={(e) => setActionMenuAnchor(e.currentTarget)}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Client Info Card */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ 
          background: `linear-gradient(135deg, ${priority.color}, ${priority.color}dd)`,
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {priority.icon}
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {priority.label} CLIENT
            </Typography>
          </Box>
          <Chip 
            label={client.project_status} 
            color={getProjectStatusColor(client.project_status)}
            variant="filled"
            sx={{ color: 'white', fontWeight: 'bold' }}
          />
        </Box>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: priority.color }}>
                  {client.first_name[0]}{client.last_name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {client.first_name} {client.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {client.project_type} Project
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EmailIcon color="primary" />
                    <Typography variant="body2">{client.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PhoneIcon color="primary" />
                    <Typography variant="body2">{client.phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationIcon color="primary" />
                    <Typography variant="body2">
                      {client.address?.street}, {client.address?.city}, {client.address?.state} {client.address?.zip_code}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MoneyIcon color="success" />
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Budget: ${client.budget?.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon color="info" />
                    <Typography variant="body2">Timeline: {client.timeline}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DescriptionIcon color="secondary" />
                    <Typography variant="body2">Lead: {client.lead_source}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" icon={<PersonIcon />} />
          <Tab label="Interactions" icon={<ChatIcon />} />
          <Tab label="Files" icon={<AttachFileIcon />} />
          <Tab label="Estimates" icon={<AssessmentIcon />} />
          <Tab label="Payments" icon={<PaymentIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Project Description</Typography>
                <Typography variant="body1" paragraph>
                  {client.project_description}
                </Typography>
                <Typography variant="h6" gutterBottom>Notes</Typography>
                <Typography variant="body2" color="text.secondary">
                  {client.notes || 'No notes added yet.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Stack spacing={1}>
                  <Button variant="outlined" startIcon={<PhoneIcon />} fullWidth>
                    Call Client
                  </Button>
                  <Button variant="outlined" startIcon={<EmailIcon />} fullWidth>
                    Send Email
                  </Button>
                  <Button variant="outlined" startIcon={<ScheduleIcon />} fullWidth>
                    Schedule Meeting
                  </Button>
                  <Button variant="outlined" startIcon={<AssessmentIcon />} fullWidth>
                    Create Estimate
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Interaction History</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setIsAddNoteDialogOpen(true)}
              >
                Add Note
              </Button>
            </Box>
            <Timeline>
              {mockInteractions.map((interaction, index) => (
                <TimelineItem key={interaction.id}>
                  <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="text.secondary">
                    {new Date(interaction.date).toLocaleDateString()}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={interaction.color}>
                      {interaction.icon}
                    </TimelineDot>
                    {index < mockInteractions.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Typography variant="h6" component="span">
                      {interaction.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {interaction.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {interaction.user}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      )}

      {currentTab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Project Files</Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Upload Files
              </Button>
            </Box>
            <Grid container spacing={2}>
              {mockFiles.map((file) => (
                <Grid item xs={12} sm={6} md={4} key={file.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AttachFileIcon color="primary" />
                        <Typography variant="subtitle2" noWrap>
                          {file.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {file.size} • {file.uploadedAt}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {currentTab === 3 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Estimates</Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Create Estimate
              </Button>
            </Box>
            <Grid container spacing={2}>
              {mockEstimates.map((estimate) => (
                <Grid item xs={12} key={estimate.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6">{estimate.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Created: {estimate.date}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color="success.main">
                            ${estimate.total.toLocaleString()}
                          </Typography>
                          <Chip 
                            label={estimate.status} 
                            color={estimate.status === 'approved' ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {currentTab === 4 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Payments</Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Record Payment
              </Button>
            </Box>
            <Grid container spacing={2}>
              {mockPayments.map((payment) => (
                <Grid item xs={12} key={payment.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6">{payment.type}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Due: {payment.date}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color="primary.main">
                            ${payment.amount.toLocaleString()}
                          </Typography>
                          <Chip 
                            label={payment.status} 
                            color={payment.status === 'completed' ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setIsAddNoteDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
      >
        <MenuItem onClick={handleEditClient}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          Edit Client
        </MenuItem>
        <MenuItem onClick={() => setActionMenuAnchor(null)}>
          <ListItemIcon><ScheduleIcon /></ListItemIcon>
          Schedule Appointment
        </MenuItem>
        <MenuItem onClick={() => setActionMenuAnchor(null)}>
          <ListItemIcon><AssessmentIcon /></ListItemIcon>
          Create Estimate
        </MenuItem>
      </Menu>

      {/* Edit Client Dialog */}
      <ClientDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        client={client}
        onSave={handleSaveClient}
      />

      {/* Add Note Dialog */}
      <Dialog open={isAddNoteDialogOpen} onClose={() => setIsAddNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained">Add Note</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientDetail;
