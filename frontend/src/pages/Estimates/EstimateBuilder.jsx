import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Calculate as CalculatorIcon,
  PictureAsPdf as PdfIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const EstimateBuilder = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [estimate, setEstimate] = useState({
    clientInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      projectAddress: '',
    },
    project: {
      type: 'kitchen',
      description: '',
      sqft: 0,
      timeline: '',
      specialRequests: '',
    },
    materials: [],
    labor: [],
    miscCosts: [],
    markup: {
      materialMarkup: 30, // 30%
      laborMarkup: 0, // 0%
      overhead: 10, // 10%
    },
    totals: {
      materialCost: 0,
      laborCost: 0,
      miscCost: 0,
      subtotal: 0,
      markup: 0,
      total: 0,
    },
  });

  const [materialLibrary, setMaterialLibrary] = useState([
    { id: 1, name: 'Granite - Standard', unit: 'sqft', basePrice: 45, category: 'countertop' },
    { id: 2, name: 'Granite - Premium', unit: 'sqft', basePrice: 65, category: 'countertop' },
    { id: 3, name: 'Quartz - Standard', unit: 'sqft', basePrice: 55, category: 'countertop' },
    { id: 4, name: 'Quartz - Premium', unit: 'sqft', basePrice: 85, category: 'countertop' },
    { id: 5, name: 'Edge Treatment - Standard', unit: 'linear ft', basePrice: 15, category: 'edge' },
    { id: 6, name: 'Edge Treatment - Premium', unit: 'linear ft', basePrice: 25, category: 'edge' },
    { id: 7, name: 'Sink Cutout', unit: 'each', basePrice: 150, category: 'cutout' },
    { id: 8, name: 'Cooktop Cutout', unit: 'each', basePrice: 200, category: 'cutout' },
  ]);

  const [laborTemplates] = useState([
    { id: 1, name: 'Template & Measurement', hours: 4, rate: 75 },
    { id: 2, name: 'Fabrication', hours: 8, rate: 65 },
    { id: 3, name: 'Installation', hours: 6, rate: 75 },
    { id: 4, name: 'Cleanup', hours: 2, rate: 45 },
  ]);

  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    calculateTotals();
  }, [estimate.materials, estimate.labor, estimate.miscCosts, estimate.markup]);

  // Initialize estimate with client data from navigation state
  useEffect(() => {
    if (location.state?.clientData) {
      const { clientData } = location.state;
      setEstimate(prev => ({
        ...prev,
        clientInfo: {
          name: `${clientData.first_name} ${clientData.last_name}`,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address ? 
            `${clientData.address.street}, ${clientData.address.city}, ${clientData.address.state} ${clientData.address.zip_code}` : 
            '',
          projectAddress: clientData.project_address || '',
        },
        project: {
          ...prev.project,
          type: clientData.project_type || 'kitchen',
          description: clientData.project_description || '',
        }
      }));
    }
  }, [location.state]);

  const calculateTotals = () => {
    const materialCost = estimate.materials.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );
    
    const laborCost = estimate.labor.reduce((sum, item) => 
      sum + (item.hours * item.rate), 0
    );
    
    const miscCost = estimate.miscCosts.reduce((sum, item) => 
      sum + item.amount, 0
    );

    const subtotal = materialCost + laborCost + miscCost;
    const markupAmount = (materialCost * estimate.markup.materialMarkup / 100) + 
                        (subtotal * estimate.markup.overhead / 100);
    const total = subtotal + markupAmount;

    setEstimate(prev => ({
      ...prev,
      totals: {
        materialCost,
        laborCost,
        miscCost,
        subtotal,
        markup: markupAmount,
        total,
      },
    }));
  };

  const addMaterial = (material = null) => {
    const newMaterial = material || {
      id: Date.now(),
      name: '',
      description: '',
      quantity: 1,
      unit: 'sqft',
      price: 0,
      category: 'countertop',
    };

    setEstimate(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial],
    }));
  };

  const updateMaterial = (index, field, value) => {
    setEstimate(prev => ({
      ...prev,
      materials: prev.materials.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeMaterial = (index) => {
    setEstimate(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const addLabor = (template = null) => {
    const newLabor = template || {
      id: Date.now(),
      name: '',
      description: '',
      hours: 1,
      rate: 65,
    };

    setEstimate(prev => ({
      ...prev,
      labor: [...prev.labor, newLabor],
    }));
  };

  const SquareFootageCalculator = () => (
    <Dialog open={showCalculator} onClose={() => setShowCalculator(false)} maxWidth="md" fullWidth>
      <DialogTitle>Square Footage Calculator</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Countertop Measurements
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Length (inches)"
              type="number"
              size="small"
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Width (inches)"
              type="number"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Total Square Footage: 0 sq ft
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Pro Tip:</strong> Add 10% for waste and cutouts, 15% for complex layouts
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowCalculator(false)}>Cancel</Button>
        <Button variant="contained">Apply to Estimate</Button>
      </DialogActions>
    </Dialog>
  );

  // Save mutation
  const saveMutation = useMutation(
    (estimateData) => api.post('/estimates', estimateData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('estimates');
        toast.success('Estimate saved successfully');
        // Optionally navigate to estimates list or stay on current page
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to save estimate');
      },
    }
  );

  // Send mutation
  const sendMutation = useMutation(
    (estimateData) => api.post('/estimates/send', estimateData),
    {
      onSuccess: () => {
        toast.success('Estimate sent successfully');
        navigate('/estimates');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to send estimate');
      },
    }
  );

  const handleSave = () => {
    if (!estimate.clientInfo.name || !estimate.clientInfo.email) {
      toast.error('Client information is required');
      return;
    }
    
    const estimateData = {
      ...estimate,
      status: 'draft',
      created_at: new Date().toISOString(),
    };
    
    saveMutation.mutate(estimateData);
  };

  const handleSend = () => {
    if (!estimate.clientInfo.name || !estimate.clientInfo.email) {
      toast.error('Client information is required');
      return;
    }
    
    if (estimate.totals.total <= 0) {
      toast.error('Please add materials or labor to the estimate');
      return;
    }
    
    const estimateData = {
      ...estimate,
      status: 'sent',
      sent_at: new Date().toISOString(),
    };
    
    sendMutation.mutate(estimateData);
  };

  const handleGeneratePDF = () => {
    // For now, just show a success message
    toast.success('PDF generation functionality coming soon');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Enhanced Estimate Builder
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<CalculatorIcon />} onClick={() => setShowCalculator(true)}>
            Calculator
          </Button>
          <Button startIcon={<SaveIcon />} variant="outlined" onClick={handleSave}>
            Save Draft
          </Button>
          <Button startIcon={<PdfIcon />} variant="contained" onClick={handleGeneratePDF}>
            Generate PDF
          </Button>
          <Button startIcon={<SendIcon />} variant="contained" color="success" onClick={handleSend}>
            Send to Client
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Client Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Client Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Client Name"
                    value={estimate.clientInfo.name}
                    onChange={(e) => setEstimate(prev => ({
                      ...prev,
                      clientInfo: { ...prev.clientInfo, name: e.target.value }
                    }))}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={estimate.clientInfo.email}
                    onChange={(e) => setEstimate(prev => ({
                      ...prev,
                      clientInfo: { ...prev.clientInfo, email: e.target.value }
                    }))}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={estimate.clientInfo.phone}
                    onChange={(e) => setEstimate(prev => ({
                      ...prev,
                      clientInfo: { ...prev.clientInfo, phone: e.target.value }
                    }))}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Project Address"
                    value={estimate.clientInfo.projectAddress}
                    onChange={(e) => setEstimate(prev => ({
                      ...prev,
                      clientInfo: { ...prev.clientInfo, projectAddress: e.target.value }
                    }))}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Project Type</InputLabel>
                    <Select
                      value={estimate.project.type}
                      onChange={(e) => setEstimate(prev => ({
                        ...prev,
                        project: { ...prev.project, type: e.target.value }
                      }))}
                    >
                      <MenuItem value="kitchen">Kitchen</MenuItem>
                      <MenuItem value="bathroom">Bathroom</MenuItem>
                      <MenuItem value="outdoor">Outdoor Kitchen</MenuItem>
                      <MenuItem value="commercial">Commercial</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Square Footage"
                    type="number"
                    value={estimate.project.sqft}
                    onChange={(e) => setEstimate(prev => ({
                      ...prev,
                      project: { ...prev.project, sqft: Number(e.target.value) }
                    }))}
                    size="small"
                    InputProps={{
                      endAdornment: <Button size="small" onClick={() => setShowCalculator(true)}>Calc</Button>
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Project Description"
                    multiline
                    rows={3}
                    value={estimate.project.description}
                    onChange={(e) => setEstimate(prev => ({
                      ...prev,
                      project: { ...prev.project, description: e.target.value }
                    }))}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Materials Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Materials & Products
                </Typography>
                <Box>
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={() => addMaterial()}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Add Custom
                  </Button>
                  <Autocomplete
                    size="small"
                    sx={{ width: 300, display: 'inline-block' }}
                    options={materialLibrary}
                    getOptionLabel={(option) => `${option.name} - $${option.basePrice}/${option.unit}`}
                    renderInput={(params) => (
                      <TextField {...params} label="Add from Library" size="small" />
                    )}
                    onChange={(event, value) => {
                      if (value) {
                        addMaterial({
                          ...value,
                          quantity: 1,
                          price: value.basePrice,
                        });
                      }
                    }}
                  />
                </Box>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {estimate.materials.map((material, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            size="small"
                            value={material.name}
                            onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                            placeholder="Material name"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={material.description}
                            onChange={(e) => updateMaterial(index, 'description', e.target.value)}
                            placeholder="Description"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={material.quantity}
                            onChange={(e) => updateMaterial(index, 'quantity', Number(e.target.value))}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={material.unit}
                            onChange={(e) => updateMaterial(index, 'unit', e.target.value)}
                            sx={{ width: 80 }}
                          >
                            <MenuItem value="sqft">sqft</MenuItem>
                            <MenuItem value="lnft">lnft</MenuItem>
                            <MenuItem value="each">each</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={material.price}
                            onChange={(e) => updateMaterial(index, 'price', Number(e.target.value))}
                            InputProps={{ startAdornment: '$' }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            ${(material.quantity * material.price).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => removeMaterial(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Totals Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing & Markup
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Material Markup %"
                    type="number"
                    value={estimate.markup.materialMarkup}
                    onChange={(e) => setEstimate(prev => ({
                      ...prev,
                      markup: { ...prev.markup, materialMarkup: Number(e.target.value) }
                    }))}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Overhead %"
                    type="number"
                    value={estimate.markup.overhead}
                    onChange={(e) => setEstimate(prev => ({
                      ...prev,
                      markup: { ...prev.markup, overhead: Number(e.target.value) }
                    }))}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estimate Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Materials:</Typography>
                  <Typography>${estimate.totals.materialCost.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Labor:</Typography>
                  <Typography>${estimate.totals.laborCost.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Miscellaneous:</Typography>
                  <Typography>${estimate.totals.miscCost.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>${estimate.totals.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Markup & Overhead:</Typography>
                  <Typography>${estimate.totals.markup.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    ${estimate.totals.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <SquareFootageCalculator />
    </Box>
  );
};

export default EstimateBuilder;
