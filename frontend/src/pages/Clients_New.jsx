import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Badge,
  Stack,
  Divider,
  Tooltip,
  LinearProgress,
  InputAdornment,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
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
  Search as SearchIcon,
  FilterList as FilterIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ClientDialog from '../components/ClientDialog';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuClientId, setMenuClientId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      setClients(response.data);
      setError('');
    } catch (error) {
      console.error('Failed to load clients:', error);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setDialogMode('add');
    setShowClientDialog(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setDialogMode('edit');
    setShowClientDialog(true);
    setAnchorEl(null);
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setDialogMode('view');
    setShowClientDialog(true);
    setAnchorEl(null);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${clientId}`);
        await loadClients();
        showSnackbar('Client deleted successfully');
      } catch (error) {
        console.error('Failed to delete client:', error);
        showSnackbar('Failed to delete client', 'error');
      }
    }
    setAnchorEl(null);
  };

  const handleClientSave = async (clientData) => {
    try {
      if (dialogMode === 'add') {
        await api.post('/clients', clientData);
        showSnackbar('Client added successfully');
      } else {
        await api.put(`/clients/${selectedClient.id}`, clientData);
        showSnackbar('Client updated successfully');
      }
      await loadClients();
      setShowClientDialog(false);
    } catch (error) {
      console.error('Failed to save client:', error);
      showSnackbar('Failed to save client', 'error');
    }
  };

  const handleMenuOpen = (event, clientId) => {
    setAnchorEl(event.currentTarget);
    setMenuClientId(clientId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuClientId(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const toggleFavorite = async (clientId, isFavorite) => {
    try {
      await api.patch(`/clients/${clientId}`, { is_favorite: !isFavorite });
      await loadClients();
      showSnackbar(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      showSnackbar('Failed to update favorite status', 'error');
    }
  };

  // Filter and search clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm);
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'favorites' && client.is_favorite) ||
      (filterType === 'residential' && client.type === 'residential') ||
      (filterType === 'commercial' && client.type === 'commercial');
    
    return matchesSearch && matchesFilter;
  });

  const paginatedClients = filteredClients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getClientTypeIcon = (type) => {
    switch (type) {
      case 'residential': return <HomeIcon />;
      case 'commercial': return <BusinessIcon />;
      default: return <PersonIcon />;
    }
  };

  const getClientTypeColor = (type) => {
    switch (type) {
      case 'residential': return 'primary';
      case 'commercial': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Clients
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your client relationships and information
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadClients} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClient}
            sx={{ borderRadius: 2 }}
          >
            Add Client
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Clients
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {clients.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Residential
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {clients.filter(c => c.type === 'residential').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light', color: 'info.dark' }}>
                  <HomeIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Commercial
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {clients.filter(c => c.type === 'commercial').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Favorites
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {clients.filter(c => c.is_favorite).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}>
                  <StarIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={filterType}
                  label="Filter by Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Clients</MenuItem>
                  <MenuItem value="favorites">Favorites</MenuItem>
                  <MenuItem value="residential">Residential</MenuItem>
                  <MenuItem value="commercial">Commercial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {filteredClients.length} of {clients.length} clients
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Added</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedClients.map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: client.is_favorite ? 'warning.light' : 'grey.300',
                          color: client.is_favorite ? 'warning.dark' : 'grey.600'
                        }}
                      >
                        {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {client.name || 'Unnamed Client'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {client.id}
                        </Typography>
                      </Box>
                      {client.is_favorite && (
                        <StarIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {client.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">{client.email}</Typography>
                        </Box>
                      )}
                      {client.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">{client.phone}</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getClientTypeIcon(client.type)}
                      label={client.type || 'General'}
                      color={getClientTypeColor(client.type)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {client.address && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {client.address}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title={client.is_favorite ? 'Remove from favorites' : 'Add to favorites'}>
                        <IconButton
                          size="small"
                          onClick={() => toggleFavorite(client.id, client.is_favorite)}
                        >
                          {client.is_favorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewClient(client)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, client.id)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm || filterType !== 'all' ? 'No clients match your criteria' : 'No clients yet'}
                    </Typography>
                    {!searchTerm && filterType === 'all' && (
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddClient}
                        sx={{ mt: 2 }}
                      >
                        Add Your First Client
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredClients.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredClients.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const client = clients.find(c => c.id === menuClientId);
          handleEditClient(client);
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          const client = clients.find(c => c.id === menuClientId);
          navigate(`/estimates?client=${client.id}`);
          handleMenuClose();
        }}>
          <ScheduleIcon sx={{ mr: 1 }} />
          Create Estimate
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteClient(menuClientId)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Client Dialog */}
      {showClientDialog && (
        <ClientDialog
          open={showClientDialog}
          onClose={() => setShowClientDialog(false)}
          onSave={handleClientSave}
          client={selectedClient}
          mode={dialogMode}
        />
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add client"
        sx={{ position: 'fixed', bottom: 20, right: 20 }}
        onClick={handleAddClient}
      >
        <AddIcon />
      </Fab>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Clients;
