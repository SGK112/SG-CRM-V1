import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Divider,
  Avatar,
  Fab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tab,
  Tabs,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Send as SendIcon,
  FileCopy as DuplicateIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  AutoFixHigh as AutoIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

// Enhanced estimate templates with professional granite/marble options
const estimateTemplates = {
  kitchen: {
    name: 'Kitchen Countertops',
    icon: <HomeIcon />,
    color: '#8B4513',
    items: [
      { name: 'Granite Slab - Premium', category: 'Material', unit: 'sq ft', basePrice: 85, description: 'High-quality granite slab with professional installation' },
      { name: 'Edge Profile - Bullnose', category: 'Fabrication', unit: 'linear ft', basePrice: 15, description: 'Standard bullnose edge finishing' },
      { name: 'Cutouts - Sink', category: 'Fabrication', unit: 'each', basePrice: 150, description: 'Professional sink cutout and polishing' },
      { name: 'Cutouts - Cooktop', category: 'Fabrication', unit: 'each', basePrice: 125, description: 'Precision cooktop cutout' },
      { name: 'Installation - Standard', category: 'Labor', unit: 'sq ft', basePrice: 25, description: 'Professional installation with seaming' },
      { name: 'Removal of Old Countertops', category: 'Labor', unit: 'sq ft', basePrice: 8, description: 'Safe removal and disposal' },
    ]
  },
  bathroom: {
    name: 'Bathroom Vanity',
    icon: <BusinessIcon />,
    color: '#2196f3',
    items: [
      { name: 'Marble Slab - Carrara', category: 'Material', unit: 'sq ft', basePrice: 95, description: 'Premium Carrara marble with natural veining' },
      { name: 'Edge Profile - Ogee', category: 'Fabrication', unit: 'linear ft', basePrice: 18, description: 'Elegant ogee edge profile' },
      { name: 'Cutouts - Undermount Sink', category: 'Fabrication', unit: 'each', basePrice: 175, description: 'Precise undermount sink cutout' },
      { name: 'Backsplash - 4 inch', category: 'Material', unit: 'linear ft', basePrice: 35, description: 'Matching material backsplash' },
      { name: 'Installation - Premium', category: 'Labor', unit: 'sq ft', basePrice: 30, description: 'Expert installation with templating' },
    ]
  },
  commercial: {
    name: 'Commercial Project',
    icon: <BusinessIcon />,
    color: '#9c27b0',
    items: [
      { name: 'Quartz Surface - Commercial Grade', category: 'Material', unit: 'sq ft', basePrice: 75, description: 'Durable commercial-grade quartz' },
      { name: 'Edge Profile - Straight', category: 'Fabrication', unit: 'linear ft', basePrice: 12, description: 'Clean straight edge profile' },
      { name: 'Installation - Commercial', category: 'Labor', unit: 'sq ft', basePrice: 35, description: 'Commercial installation with warranty' },
      { name: 'Project Management', category: 'Service', unit: 'project', basePrice: 500, description: 'Dedicated project coordination' },
      { name: 'After-hours Installation', category: 'Labor', unit: 'hour', basePrice: 125, description: 'Off-hours installation premium' },
    ]
  },
  outdoor: {
    name: 'Outdoor Kitchen',
    icon: <AutoIcon />,
    color: '#4caf50',
    items: [
      { name: 'Granite - Weather Resistant', category: 'Material', unit: 'sq ft', basePrice: 90, description: 'Weather-treated granite for outdoor use' },
      { name: 'Edge Profile - Weathered', category: 'Fabrication', unit: 'linear ft', basePrice: 20, description: 'Weather-resistant edge treatment' },
      { name: 'Cutouts - Grill Insert', category: 'Fabrication', unit: 'each', basePrice: 200, description: 'Custom grill cutout and finishing' },
      { name: 'Outdoor Installation', category: 'Labor', unit: 'sq ft', basePrice: 40, description: 'Specialized outdoor installation' },
      { name: 'Sealing Treatment', category: 'Service', unit: 'sq ft', basePrice: 5, description: 'Weather protection sealing' },
    ]
  }
};

const EstimateBuilder = ({ open, onClose, editingEstimate = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [estimateData, setEstimateData] = useState({
    client: '',
    projectName: '',
    projectType: '',
    address: '',
    description: '',
    items: [],
    subtotal: 0,
    tax: 0.08,
    total: 0,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    notes: '',
    terms: 'Payment due upon completion. 50% deposit required to begin work.',
  });

  const steps = [
    'Project Details',
    'Select Template & Items',
    'Pricing & Calculations',
    'Review & Finalize'
  ];

  useEffect(() => {
    if (editingEstimate) {
      setEstimateData(editingEstimate);
      setActiveStep(2); // Skip to pricing if editing
    }
  }, [editingEstimate]);

  useEffect(() => {
    const subtotal = estimateData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = subtotal * estimateData.tax;
    setEstimateData(prev => ({
      ...prev,
      subtotal: subtotal,
      total: subtotal + taxAmount
    }));
  }, [estimateData.items, estimateData.tax]);

  const handleTemplateSelect = (templateKey) => {
    const template = estimateTemplates[templateKey];
    setSelectedTemplate(templateKey);
    setEstimateData(prev => ({
      ...prev,
      projectType: template.name,
      items: template.items.map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        quantity: 1,
        price: item.basePrice,
        total: item.basePrice
      }))
    }));
    setActiveStep(2);
  };

  const handleItemUpdate = (itemId, field, value) => {
    setEstimateData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'price') {
            updatedItem.total = updatedItem.quantity * updatedItem.price;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const addCustomItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Custom Item',
      category: 'Custom',
      unit: 'each',
      quantity: 1,
      price: 0,
      total: 0,
      description: ''
    };
    setEstimateData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (itemId) => {
    setEstimateData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSave = () => {
    // Save estimate logic here
    toast.success('Estimate saved successfully!');
    onClose();
  };

  const ProjectDetailsStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Client Name"
          value={estimateData.client}
          onChange={(e) => setEstimateData(prev => ({ ...prev, client: e.target.value }))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Project Name"
          value={estimateData.projectName}
          onChange={(e) => setEstimateData(prev => ({ ...prev, projectName: e.target.value }))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Project Address"
          value={estimateData.address}
          onChange={(e) => setEstimateData(prev => ({ ...prev, address: e.target.value }))}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Project Description"
          value={estimateData.description}
          onChange={(e) => setEstimateData(prev => ({ ...prev, description: e.target.value }))}
          margin="normal"
        />
      </Grid>
    </Grid>
  );

  const TemplateSelectionStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Choose a Template to Get Started
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {Object.entries(estimateTemplates).map(([key, template]) => (
          <Grid item xs={12} md={6} key={key}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedTemplate === key ? `2px solid ${template.color}` : '1px solid #e0e0e0',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
              onClick={() => handleTemplateSelect(key)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ backgroundColor: template.color, mr: 2 }}>
                    {template.icon}
                  </Avatar>
                  <Typography variant="h6">{template.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {template.items.length} standard items included
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Base price range: ${Math.min(...template.items.map(i => i.basePrice))} - ${Math.max(...template.items.map(i => i.basePrice))} per unit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const PricingStep = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Estimate Items</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={addCustomItem}
          variant="outlined"
          sx={{ borderColor: '#8B4513', color: '#8B4513' }}
        >
          Add Custom Item
        </Button>
      </Box>
      
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Item</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Qty</strong></TableCell>
              <TableCell><strong>Unit</strong></TableCell>
              <TableCell><strong>Price</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estimateData.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <TextField
                    size="small"
                    value={item.name}
                    onChange={(e) => handleItemUpdate(item.id, 'name', e.target.value)}
                    variant="standard"
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    {item.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={item.category} size="small" />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemUpdate(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={item.price}
                    onChange={(e) => handleItemUpdate(item.id, 'price', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ width: 100 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => removeItem(item.id)}
                    sx={{ color: '#f44336' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totals */}
      <Paper sx={{ p: 3, maxWidth: 400, ml: 'auto' }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography>Subtotal:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography align="right">
              ${estimateData.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Tax ({(estimateData.tax * 100).toFixed(1)}%):</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography align="right">
              ${(estimateData.subtotal * estimateData.tax).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" align="right" sx={{ fontWeight: 700, color: '#8B4513' }}>
              ${estimateData.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const ReviewStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Project Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Client:</Typography>
              <Typography>{estimateData.client}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Project:</Typography>
              <Typography>{estimateData.projectName}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Address:</Typography>
              <Typography>{estimateData.address}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Terms & Notes</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Additional Notes"
            value={estimateData.notes}
            onChange={(e) => setEstimateData(prev => ({ ...prev, notes: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Terms & Conditions"
            value={estimateData.terms}
            onChange={(e) => setEstimateData(prev => ({ ...prev, terms: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            type="date"
            label="Valid Until"
            value={estimateData.validUntil}
            onChange={(e) => setEstimateData(prev => ({ ...prev, validUntil: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
          <Typography variant="h6" gutterBottom>Estimate Total</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" sx={{ color: '#8B4513', fontWeight: 700 }}>
              ${estimateData.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {estimateData.items.length} items • {estimateData.items.reduce((sum, item) => sum + item.quantity, 0)} total units
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Button
            fullWidth
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#D4A574' },
              mb: 1,
            }}
          >
            Save Estimate
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EmailIcon />}
            sx={{ borderColor: '#8B4513', color: '#8B4513' }}
          >
            Send to Client
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#8B4513', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {editingEstimate ? 'Edit Estimate' : 'Create New Estimate'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {index === 0 && <ProjectDetailsStep />}
                {index === 1 && <TemplateSelectionStep />}
                {index === 2 && <PricingStep />}
                {index === 3 && <ReviewStep />}
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSave : handleNext}
                    sx={{
                      backgroundColor: '#8B4513',
                      '&:hover': { backgroundColor: '#D4A574' }
                    }}
                  >
                    {index === steps.length - 1 ? 'Save Estimate' : 'Next'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};

const EnhancedEstimates = () => {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Mock data for estimates
  const estimates = [
    {
      id: 1,
      client: 'Sarah Johnson',
      projectName: 'Kitchen Renovation',
      total: 8500.00,
      status: 'sent',
      createdAt: '2024-12-15',
      validUntil: '2025-01-15',
      items: 5
    },
    {
      id: 2,
      client: 'Mike Davis',
      projectName: 'Bathroom Vanity',
      total: 3200.00,
      status: 'accepted',
      createdAt: '2024-12-10',
      validUntil: '2025-01-10',
      items: 3
    },
    {
      id: 3,
      client: 'Corporate Office',
      projectName: 'Reception Desk',
      total: 12000.00,
      status: 'draft',
      createdAt: '2024-12-20',
      validUntil: '2025-01-20',
      items: 8
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'primary';
      case 'viewed': return 'info';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const handleEdit = (estimate) => {
    setEditingEstimate(estimate);
    setBuilderOpen(true);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513' }}>
            Estimates & Quotes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create professional estimates and track client responses
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setBuilderOpen(true)}
          sx={{
            backgroundColor: '#8B4513',
            '&:hover': { backgroundColor: '#D4A574' },
            borderRadius: 2,
            px: 3,
            py: 1.5,
          }}
        >
          Create Estimate
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #8B4513 0%, #D4A574 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">$23,700</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Value
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalculateIcon sx={{ fontSize: 40, mr: 2, color: '#2196f3' }} />
                <Box>
                  <Typography variant="h6">12</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Estimates
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon sx={{ fontSize: 40, mr: 2, color: '#4caf50' }} />
                <Box>
                  <Typography variant="h6">68%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Acceptance Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 40, mr: 2, color: '#ff9800' }} />
                <Box>
                  <Typography variant="h6">3.2</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Days to Accept
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none' },
            '& .Mui-selected': { color: '#8B4513' },
            '& .MuiTabs-indicator': { backgroundColor: '#8B4513' },
          }}
        >
          <Tab label="All Estimates" />
          <Tab label="Drafts" />
          <Tab label="Sent" />
          <Tab label="Accepted" />
          <Tab label="Templates" />
        </Tabs>
      </Paper>

      {/* Estimates Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Estimate #</strong></TableCell>
                <TableCell><strong>Client</strong></TableCell>
                <TableCell><strong>Project</strong></TableCell>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell><strong>Valid Until</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estimates.map((estimate) => (
                <TableRow key={estimate.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      EST-{estimate.id.toString().padStart(4, '0')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, backgroundColor: '#8B4513' }}>
                        {estimate.client.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography>{estimate.client}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography>{estimate.projectName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {estimate.items} items
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ${estimate.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={estimate.status.toUpperCase()}
                      color={getStatusColor(estimate.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{estimate.createdAt}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{estimate.validUntil}</Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View">
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(estimate)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send">
                      <IconButton size="small">
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate">
                      <IconButton size="small">
                        <DuplicateIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Estimate Builder Dialog */}
      <EstimateBuilder
        open={builderOpen}
        onClose={() => {
          setBuilderOpen(false);
          setEditingEstimate(null);
        }}
        editingEstimate={editingEstimate}
      />

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="create estimate"
        onClick={() => setBuilderOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          backgroundColor: '#8B4513',
          '&:hover': {
            backgroundColor: '#D4A574',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CalculateIcon />
      </Fab>
    </Box>
  );
};

export default EnhancedEstimates;
