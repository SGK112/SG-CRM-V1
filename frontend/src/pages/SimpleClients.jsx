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
  styled,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

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
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.background.default
  },
  '&.dragover': {
    borderColor: theme.palette.secondary.main,
    backgroundColor: theme.palette.background.paper
  }
}));

const SimpleClients = () => {
  const theme = useTheme();
  const [clients, setClients] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
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
    const details = `
Name: ${client.firstName} ${client.lastName}
Email: ${client.email}
Phone: ${client.phone || 'Not provided'}
Project: ${client.projectType}
Budget: $${client.budget.toLocaleString()}
Address: ${client.address || 'Not provided'}
Timeline: ${client.timeline || 'Not specified'}
Lead Source: ${client.leadSource}
Description: ${client.projectDescription || 'No description'}
Notes: ${client.notes || 'No notes'}
Created: ${new Date(client.createdAt).toLocaleDateString()}
    `;

    if (window.confirm(`Client Details:\n\n${details}\n\nWould you like to delete this client?`)) {
      setClients(prev => prev.filter(c => c.id !== client.id));
      showAlert('Client deleted successfully');
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ 
        mb: 3, 
        p: 3, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, 
        color: theme.palette.primary.contrastText 
      }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          📋 Client Management
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
          Surprise Granite & Cabinetry - CRM System
        </Typography>

        {/* Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.15)' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.contrastText }}>
                {stats.total}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.primary.contrastText, opacity: 0.8 }}>
                Total Clients
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.15)' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                ${stats.totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.primary.contrastText, opacity: 0.8 }}>
                Pipeline Value
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.15)' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                ${stats.avgBudget.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Average Budget
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          color="primary"
        >
          Add New Client
        </Button>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setBulkUploadOpen(true)}
          color="secondary"
        >
          Bulk Upload CSV
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        label="Search clients..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 64, color: '#bdc3c7', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2, color: '#2c3e50' }}>
            {searchTerm ? 'No Results Found' : 'No Clients Yet'}
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first client to get started!'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredClients.map((client) => (
            <Grid item xs={12} sm={6} lg={4} key={client.id}>
              <StyledCard onClick={() => handleViewClient(client)}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: '#2c3e50', fontWeight: 600 }}>
                    {client.firstName} {client.lastName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'info.main' }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {client.email}
                    </Typography>
                  </Box>
                  
                  {client.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ fontSize: 16, mr: 1, color: '#27ae60' }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {client.phone}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      <strong>Project:</strong> {client.projectType.charAt(0).toUpperCase() + client.projectType.slice(1)}
                    </Typography>
                  </Box>
                  
                  {client.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, mr: 1, color: '#95a5a6' }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {client.address}
                      </Typography>
                    </Box>
                  )}
                  
                  {client.budget > 0 && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 1, 
                      backgroundColor: 'info.main', 
                      color: 'white', 
                      borderRadius: 1, 
                      textAlign: 'center' 
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
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

      {/* Add Client Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
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
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddClient} variant="contained">Save Client</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadOpen} onClose={() => setBulkUploadOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Upload Clients</DialogTitle>
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
        <DialogActions>
          <Button onClick={downloadSampleCSV}>Download Sample CSV</Button>
          <Button onClick={() => setBulkUploadOpen(false)}>Cancel</Button>
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
