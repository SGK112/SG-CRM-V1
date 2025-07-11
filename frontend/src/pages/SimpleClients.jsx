import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  styled
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { loadSampleData } from '../utils/sampleData';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: `2px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    borderColor: theme.palette.primary.main
  }
}));

const FileUploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: 8,
  padding: 40,
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: '#f8f9fa',
  '&:hover': {
    borderColor: '#1e3a8a',
    backgroundColor: '#f1f5f9'
  },
  '&.dragover': {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2'
  }
}));

const SimpleClients = () => {
  const [clients, setClients] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [clientDetailOpen, setClientDetailOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    projectType: 'kitchen',
    budget: '',
    address: '',
    projectDescription: '',
    timeline: '',
    leadSource: 'website',
    notes: ''
  });

  // Load clients from localStorage on component mount
  useEffect(() => {
    const savedClients = localStorage.getItem('sg-crm-clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      // Load sample data if no clients exist
      const sampleLoaded = loadSampleData();
      if (sampleLoaded) {
        const newSavedClients = localStorage.getItem('sg-crm-clients');
        if (newSavedClients) {
          setClients(JSON.parse(newSavedClients));
        }
      }
    }
  }, []);

  // Save clients to localStorage whenever clients change
  useEffect(() => {
    localStorage.setItem('sg-crm-clients', JSON.stringify(clients));
  }, [clients]);

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ open: false, message: '', severity: 'success' });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      projectType: 'kitchen',
      budget: '',
      address: '',
      projectDescription: '',
      timeline: '',
      leadSource: 'website',
      notes: ''
    });
  };

  const handleAddClient = () => {
    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      showAlert('Please fill in all required fields (First Name, Last Name, Email)', 'error');
      return;
    }

    // Check for duplicate email
    if (clients.some(client => client.email.toLowerCase() === formData.email.toLowerCase())) {
      showAlert('A client with this email already exists!', 'error');
      return;
    }

    // Create new client
    const newClient = {
      id: Date.now().toString(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      projectType: formData.projectType,
      budget: parseInt(formData.budget) || 0,
      address: formData.address.trim(),
      projectDescription: formData.projectDescription.trim(),
      timeline: formData.timeline.trim(),
      leadSource: formData.leadSource,
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString(),
      status: 'lead'
    };

    setClients(prev => [...prev, newClient]);
    setAddDialogOpen(false);
    resetForm();
    showAlert(`Client ${newClient.firstName} ${newClient.lastName} added successfully!`);
  };

  const handleBulkUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n');

      if (lines.length < 2) {
        showAlert('CSV file must contain at least a header row and one data row.', 'error');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['firstName', 'lastName', 'email'];

      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        showAlert(`Missing required columns: ${missingHeaders.join(', ')}`, 'error');
        return;
      }

      let addedCount = 0;
      let skippedCount = 0;
      const newClients = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim());
        if (row.length < headers.length || !row[0]) continue;

        const clientData = {};
        headers.forEach((header, index) => {
          clientData[header] = row[index] || '';
        });

        // Check for duplicate email
        if (clients.some(c => c.email.toLowerCase() === clientData.email.toLowerCase()) ||
            newClients.some(c => c.email.toLowerCase() === clientData.email.toLowerCase())) {
          skippedCount++;
          continue;
        }

        const newClient = {
          id: Date.now().toString() + i,
          firstName: clientData.firstName || '',
          lastName: clientData.lastName || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          projectType: clientData.projectType || 'kitchen',
          budget: parseInt(clientData.budget) || 0,
          address: clientData.address || '',
          projectDescription: clientData.projectDescription || '',
          timeline: clientData.timeline || '',
          leadSource: clientData.leadSource || 'import',
          notes: clientData.notes || '',
          createdAt: new Date().toISOString(),
          status: 'lead'
        };

        newClients.push(newClient);
        addedCount++;
      }

      setClients(prev => [...prev, ...newClients]);
      setBulkUploadOpen(false);
      showAlert(`Bulk upload completed! Added ${addedCount} clients. Skipped ${skippedCount} duplicates.`);
    };

    reader.readAsText(file);
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['firstName', 'lastName', 'email', 'phone', 'projectType', 'budget', 'address', 'projectDescription', 'timeline', 'leadSource', 'notes'],
      ['John', 'Doe', 'john@example.com', '555-123-4567', 'kitchen', '25000', '123 Main St, City, State 12345', 'Kitchen renovation', '2-3 months', 'referral', 'Prefers granite countertops'],
      ['Jane', 'Smith', 'jane@example.com', '555-987-6543', 'bathroom', '15000', '456 Oak Ave, City, State 67890', 'Bathroom remodel', '1-2 months', 'website', 'Interested in quartz']
    ];

    const csv = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-clients.csv';
    a.click();
    URL.revokeObjectURL(url);

    showAlert('Sample CSV downloaded! Use this format for your bulk upload.');
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setClientDetailOpen(true);
  };

  const handleDeleteClient = (clientId) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    setClientDetailOpen(false);
    setSelectedClient(null);
    showAlert('Client deleted successfully');
  };

  const handleLoadSampleData = () => {
    const sampleLoaded = loadSampleData();
    if (sampleLoaded) {
      const newSavedClients = localStorage.getItem('sg-crm-clients');
      if (newSavedClients) {
        setClients(JSON.parse(newSavedClients));
        showAlert('Sample data loaded successfully!');
      }
    } else {
      showAlert('Sample data is already loaded or clients already exist.', 'info');
    }
  };

  const filteredClients = clients.filter(client =>
    client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.projectType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: clients.length,
    totalRevenue: clients.reduce((sum, client) => sum + client.budget, 0),
    avgBudget: clients.length > 0 ? Math.round(clients.reduce((sum, client) => sum + client.budget, 0) / clients.length) : 0
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      pb: 4
    }}>
      {/* Header */}
      <Box sx={{ 
        backgroundColor: '#1e3a8a',
        color: 'white',
        p: 4,
        mb: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h3" sx={{ 
          mb: 1, 
          fontWeight: 700,
          color: '#ffffff'
        }}>
          📋 Client Management
        </Typography>
        <Typography variant="h5" sx={{ 
          mb: 4, 
          opacity: 0.9,
          fontWeight: 400,
          color: '#e2e8f0'
        }}>
          Surprise Granite & Cabinetry - CRM System
        </Typography>

        {/* Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center', 
              backgroundColor: '#ffffff',
              borderRadius: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#1e3a8a',
                mb: 1
              }}>
                {stats.total}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#6b7280',
                fontWeight: 500
              }}>
                Total Clients
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center', 
              backgroundColor: '#ffffff',
              borderRadius: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#dc2626',
                mb: 1
              }}>
                ${stats.totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#6b7280',
                fontWeight: 500
              }}>
                Pipeline Value
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center', 
              backgroundColor: '#ffffff',
              borderRadius: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#eab308',
                mb: 1
              }}>
                ${stats.avgBudget.toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#6b7280',
                fontWeight: 500
              }}>
                Average Budget
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: 4 }}>
        {/* Actions */}
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              backgroundColor: '#1e3a8a',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: '#1e40af'
              }
            }}
          >
            Add New Client
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setBulkUploadOpen(true)}
            sx={{
              backgroundColor: '#dc2626',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: '#dc2626'
              }
            }}
          >
            Bulk Upload CSV
          </Button>
        </Box>

        {/* Search */}
        <Paper sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <TextField
            fullWidth
            label="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                '&:hover fieldset': {
                  borderColor: '#1e3a8a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1e3a8a',
                }
              }
            }}
          />
        </Paper>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <Paper sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: 1,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <PersonIcon sx={{ fontSize: 80, color: '#9ca3af', mb: 3 }} />
            <Typography variant="h4" sx={{ 
              mb: 2, 
              color: '#374151',
              fontWeight: 600
            }}>
              {searchTerm ? 'No Results Found' : 'No Clients Yet'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first client to get started!'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                onClick={handleLoadSampleData}
                sx={{
                  backgroundColor: '#eab308',
                  color: '#000000',
                  px: 4,
                  py: 1.5,
                  borderRadius: 1,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#d97706'
                  }
                }}
              >
                Load Sample Data
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredClients.map((client) => (
              <Grid item xs={12} sm={6} lg={4} key={client.id}>
                <StyledCard 
                  onClick={() => handleViewClient(client)}
                  sx={{
                    borderRadius: 1,
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderColor: '#1e3a8a'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      color: '#111827', 
                      fontWeight: 700
                    }}>
                      {client.firstName} {client.lastName}
                    </Typography>
                  
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 16, mr: 1, color: '#1e3a8a' }} />
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {client.email}
                      </Typography>
                    </Box>
                  
                    {client.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16, mr: 1, color: '#059669' }} />
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          {client.phone}
                        </Typography>
                      </Box>
                    )}
                  
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        <strong>Project:</strong> {client.projectType.charAt(0).toUpperCase() + client.projectType.slice(1)}
                      </Typography>
                    </Box>
                  
                    {client.address && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, mr: 1, color: '#9ca3af' }} />
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          {client.address}
                        </Typography>
                      </Box>
                    )}
                  
                    {client.budget > 0 && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 1, 
                        backgroundColor: '#eab308', 
                        color: '#000000', 
                        borderRadius: 1, 
                        textAlign: 'center' 
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Budget: ${client.budget.toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Add Client Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#1e3a8a',
          color: 'white',
          textAlign: 'center',
          fontWeight: 600
        }}>
          Add New Client
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={formData.projectType}
                  label="Project Type"
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                >
                  <MenuItem value="kitchen">Kitchen</MenuItem>
                  <MenuItem value="bathroom">Bathroom</MenuItem>
                  <MenuItem value="commercial">Commercial</MenuItem>
                  <MenuItem value="outdoor">Outdoor</MenuItem>
                  <MenuItem value="countertops">Countertops Only</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Budget ($)"
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Description"
                multiline
                rows={3}
                value={formData.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Timeline"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Lead Source</InputLabel>
                <Select
                  value={formData.leadSource}
                  label="Lead Source"
                  onChange={(e) => handleInputChange('leadSource', e.target.value)}
                >
                  <MenuItem value="website">Website</MenuItem>
                  <MenuItem value="referral">Referral</MenuItem>
                  <MenuItem value="google">Google</MenuItem>
                  <MenuItem value="facebook">Facebook</MenuItem>
                  <MenuItem value="instagram">Instagram</MenuItem>
                  <MenuItem value="yelp">Yelp</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setAddDialogOpen(false)}
            sx={{ 
              color: '#6b7280',
              fontWeight: 600,
              px: 3,
              py: 1.5
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddClient} 
            variant="contained"
            sx={{
              backgroundColor: '#1e3a8a',
              px: 4,
              py: 1.5,
              borderRadius: 1,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#1e40af'
              }
            }}
          >
            Save Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog 
        open={bulkUploadOpen} 
        onClose={() => setBulkUploadOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#1e3a8a',
          color: 'white',
          textAlign: 'center',
          fontWeight: 600
        }}>
          Bulk Upload Clients
        </DialogTitle>
        <DialogContent>
          <FileUploadArea onClick={() => document.getElementById('csvFile').click()}>
            <UploadIcon sx={{ fontSize: 48, color: '#bdc3c7', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Drop CSV File Here or Click to Browse
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Upload a CSV file with your existing client data
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', mt: 2, display: 'block' }}>
              Required columns: firstName, lastName, email<br />
              Optional: phone, projectType, budget, address, projectDescription, timeline, leadSource, notes
            </Typography>
          </FileUploadArea>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleBulkUpload}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={downloadSampleCSV}
            sx={{ 
              color: '#dc2626',
              fontWeight: 600,
              px: 3,
              py: 1.5
            }}
          >
            Download Sample CSV
          </Button>
          <Button 
            onClick={() => setBulkUploadOpen(false)}
            sx={{ 
              color: '#6b7280',
              fontWeight: 600,
              px: 3,
              py: 1.5
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Client Detail Dialog */}
      <Dialog 
        open={clientDetailOpen} 
        onClose={() => setClientDetailOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#1e3a8a',
          color: 'white',
          textAlign: 'center',
          fontWeight: 600
        }}>
          Client Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedClient && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#111827' }}>
                  {selectedClient.firstName} {selectedClient.lastName}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  <strong>Email:</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827' }}>
                  {selectedClient.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  <strong>Phone:</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827' }}>
                  {selectedClient.phone || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  <strong>Project Type:</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827' }}>
                  {selectedClient.projectType.charAt(0).toUpperCase() + selectedClient.projectType.slice(1)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  <strong>Budget:</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600 }}>
                  ${selectedClient.budget.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  <strong>Address:</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827' }}>
                  {selectedClient.address || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  <strong>Timeline:</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827' }}>
                  {selectedClient.timeline || 'Not specified'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  <strong>Lead Source:</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827' }}>
                  {selectedClient.leadSource}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  <strong>Project Description:</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827' }}>
                  {selectedClient.projectDescription || 'No description provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  <strong>Notes:</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827' }}>
                  {selectedClient.notes || 'No notes'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                  <strong>Created:</strong>
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827' }}>
                  {new Date(selectedClient.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setClientDetailOpen(false)}
            sx={{ 
              color: '#6b7280',
              fontWeight: 600,
              px: 3,
              py: 1.5
            }}
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              if (selectedClient && window.confirm('Are you sure you want to delete this client?')) {
                handleDeleteClient(selectedClient.id);
              }
            }}
            variant="contained"
            sx={{
              backgroundColor: '#dc2626',
              px: 4,
              py: 1.5,
              borderRadius: 1,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#b91c1c'
              }
            }}
          >
            Delete Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SimpleClients;
