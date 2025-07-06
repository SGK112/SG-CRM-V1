import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Divider,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Stack,
  Avatar
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';

const Forms = () => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState(null);
  const [showDocument, setShowDocument] = useState(false);

  const generateDocument = (formType, data) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleString();
    
    switch (formType) {
      case 'liability-waiver':
        return {
          title: 'LIABILITY WAIVER AND RELEASE AGREEMENT',
          content: `
WAIVER AND RELEASE OF LIABILITY

This Liability Waiver and Release Agreement ("Agreement") is entered into on ${data.workDate || currentDate} by and between:

CUSTOMER: ${data.customerName || '[Customer Name]'}
ADDRESS: ${data.customerAddress || '[Customer Address]'}

SERVICE PROVIDER: SG Construction Services
ADDRESS: [Company Address]

WORK DESCRIPTION: ${data.workDescription || '[Work Description]'}

1. ASSUMPTION OF RISK
The Customer acknowledges that they understand the nature of the work to be performed and voluntarily assume all risks associated with such work, including but not limited to property damage, personal injury, or other losses.

2. RELEASE OF LIABILITY
In consideration for the services provided, the Customer hereby releases, waives, and discharges SG Construction Services, its officers, employees, agents, and contractors from any and all liability, claims, demands, actions, or causes of action arising out of or related to any loss, damage, or injury that may be sustained during the performance of the work described above.

3. INDEMNIFICATION
The Customer agrees to indemnify and hold harmless SG Construction Services from any loss, liability, damage, or cost incurred as a result of claims arising from the work performed.

4. ACKNOWLEDGMENT
By signing below, the Customer acknowledges that they have read this Agreement, understand its terms, and agree to be bound by its provisions.

CUSTOMER SIGNATURE: ${data.customerSignature || '[Signature Required]'}
DATE: ${data.workDate || currentDate}

WITNESS SIGNATURE: ${data.witnessSignature || '[Witness Signature]'}
DATE: ${currentDate}

Document Generated: ${currentTime}
`
        };
        
      case 'work-acceptance':
        return {
          title: 'WORK ACCEPTANCE AND SATISFACTION FORM',
          content: `
WORK ACCEPTANCE CERTIFICATE

Project Details:
Customer: ${data.customerName || '[Customer Name]'}
Project Number: ${data.projectNumber || '[Project Number]'}
Completion Date: ${data.completionDate || currentDate}

Work Completed:
${data.workCompleted || '[Work Description]'}

Customer Satisfaction Rating: ${data.satisfactionRating || '[Not Rated]'}

Additional Comments:
${data.additionalComments || 'None provided'}

CUSTOMER CERTIFICATION:
I hereby certify that the work described above has been completed to my satisfaction. I acknowledge that all work has been performed in accordance with the agreed specifications and that I am satisfied with the quality of workmanship.

CUSTOMER SIGNATURE: ${data.customerSignature || '[Signature Required]'}
DATE: ${data.completionDate || currentDate}

This certificate serves as formal acceptance of the completed work and releases SG Construction Services from any further obligations related to this project, except as may be covered under warranty terms.

Document Generated: ${currentTime}
`
        };
        
      case 'material-delivery':
        return {
          title: 'MATERIAL DELIVERY CONFIRMATION',
          content: `
DELIVERY RECEIPT AND CONFIRMATION

Delivery Information:
Date: ${data.deliveryDate || currentDate}
Delivery Address: ${data.deliveryAddress || '[Delivery Address]'}
Received By: ${data.receivedBy || '[Recipient Name]'}

Materials Delivered:
${data.materialsList || '[Materials List]'}

Condition on Arrival: ${data.condition || '[Condition]'}

Additional Notes:
${data.notes || 'None'}

ACKNOWLEDGMENT:
By signing below, the recipient acknowledges receipt of the materials listed above and confirms their condition as noted.

RECIPIENT SIGNATURE: ${data.receiverSignature || '[Signature Required]'}
DATE: ${data.deliveryDate || currentDate}

DRIVER SIGNATURE: ${data.driverSignature || '[Driver Signature]'}
DATE: ${data.deliveryDate || currentDate}

This receipt serves as proof of delivery and acceptance of materials. Any discrepancies should be noted above.

Document Generated: ${currentTime}
`
        };
        
      case 'installation-acceptance':
        return {
          title: 'INSTALLATION ACCEPTANCE CERTIFICATE',
          content: `
INSTALLATION COMPLETION AND ACCEPTANCE

Customer: ${data.customerName || '[Customer Name]'}
Installation Date: ${data.installationDate || currentDate}

Equipment/System Installed:
${data.equipmentInstalled || '[Equipment Description]'}

COMPLETION CHECKLIST:
☐ Testing Completed: ${data.testingCompleted ? 'YES' : 'NO'}
☐ Customer Training Provided: ${data.trainingProvided ? 'YES' : 'NO'}
☐ Warranty Information Explained: ${data.warrantyExplained ? 'YES' : 'NO'}
☐ Customer Satisfied with Installation: ${data.customerSatisfied ? 'YES' : 'NO'}

FINAL ACCEPTANCE:
I hereby acknowledge that the installation has been completed and I am satisfied with the work performed. All testing has been completed successfully, and I have received appropriate training on the installed equipment.

CUSTOMER SIGNATURE: ${data.customerSignature || '[Signature Required]'}
DATE: ${data.installationDate || currentDate}

TECHNICIAN SIGNATURE: ${data.technicianSignature || '[Technician Signature]'}
DATE: ${data.installationDate || currentDate}

This certificate confirms successful completion and acceptance of the installation work.

Document Generated: ${currentTime}
`
        };
        
      case 'safety-checklist':
        return {
          title: 'SAFETY INSPECTION CHECKLIST',
          content: `
PRE-WORK SAFETY INSPECTION

Job Site: ${data.jobSite || '[Job Site Address]'}
Inspection Date: ${data.inspectionDate || currentDate}
Inspected By: ${data.inspectedBy || '[Inspector Name]'}

SAFETY ASSESSMENT:
Hazards Identified:
${data.hazardIdentified || 'None identified'}

SAFETY REQUIREMENTS:
☐ PPE Required: ${data.ppeRequired ? 'YES' : 'NO'}
☐ Safety Briefing Completed: ${data.safetyBriefing ? 'YES' : 'NO'}
☐ Emergency Procedures Reviewed: ${data.emergencyProcedures ? 'YES' : 'NO'}

SUPERVISOR CERTIFICATION:
I certify that this safety inspection has been completed and all necessary safety measures have been implemented before work commencement.

SUPERVISOR SIGNATURE: ${data.supervisorSignature || '[Signature Required]'}
DATE: ${data.inspectionDate || currentDate}

This inspection must be completed before any work begins on the job site.

Document Generated: ${currentTime}
`
        };
        
      case 'change-order':
        return {
          title: 'CHANGE ORDER AUTHORIZATION',
          content: `
CHANGE ORDER FORM

Original Contract: ${data.originalContract || '[Contract Number]'}
Change Order Date: ${currentDate}

CHANGE DESCRIPTION:
${data.changeDescription || '[Change Description]'}

FINANCIAL IMPACT:
Cost Change: $${data.costChange || '0.00'}
Time Change: ${data.timeChange || '0'} days

REASON FOR CHANGE:
${data.reason || '[Reason for Change]'}

CUSTOMER AUTHORIZATION:
☐ Customer Approval: ${data.customerApproval ? 'APPROVED' : 'PENDING'}

By signing below, the customer authorizes the changes described above and agrees to the associated cost and schedule impacts.

CUSTOMER SIGNATURE: ${data.customerSignature || '[Signature Required]'}
DATE: ${currentDate}

CONTRACTOR SIGNATURE: ${data.contractorSignature || '[Contractor Signature]'}
DATE: ${currentDate}

This change order modifies the original contract and must be signed by all parties before work proceeds.

Document Generated: ${currentTime}
`
        };
        
      default:
        return {
          title: 'FORM SUBMISSION',
          content: `Form data submitted successfully.\n\nDocument Generated: ${currentTime}`
        };
    }
  };

  const formTypes = [
    {
      id: 'liability-waiver',
      title: 'Liability Waiver',
      description: 'Release of liability for work performed on customer property',
      icon: <ShieldIcon color="primary" />,
      category: 'Legal',
      fields: [
        { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
        { name: 'customerAddress', label: 'Customer Address', type: 'text', required: true },
        { name: 'workDescription', label: 'Work Description', type: 'textarea', required: true },
        { name: 'workDate', label: 'Work Date', type: 'date', required: true },
        { name: 'customerSignature', label: 'Customer Signature', type: 'signature', required: true },
        { name: 'witnessSignature', label: 'Witness Signature', type: 'signature', required: false }
      ]
    },
    {
      id: 'work-acceptance',
      title: 'Work Acceptance Form',
      description: 'Customer acceptance and satisfaction confirmation',
      icon: <CheckCircleIcon color="success" />,
      category: 'Completion',
      fields: [
        { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
        { name: 'projectNumber', label: 'Project Number', type: 'text', required: true },
        { name: 'workCompleted', label: 'Work Completed', type: 'textarea', required: true },
        { name: 'satisfactionRating', label: 'Satisfaction Rating', type: 'radio', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { name: 'additionalComments', label: 'Additional Comments', type: 'textarea', required: false },
        { name: 'customerSignature', label: 'Customer Signature', type: 'signature', required: true },
        { name: 'completionDate', label: 'Completion Date', type: 'date', required: true }
      ]
    },
    {
      id: 'material-delivery',
      title: 'Material Delivery Form',
      description: 'Confirmation of materials delivered to job site',
      icon: <LocalShippingIcon color="warning" />,
      category: 'Logistics',
      fields: [
        { name: 'deliveryDate', label: 'Delivery Date', type: 'date', required: true },
        { name: 'deliveryAddress', label: 'Delivery Address', type: 'text', required: true },
        { name: 'receivedBy', label: 'Received By', type: 'text', required: true },
        { name: 'materialsList', label: 'Materials List', type: 'textarea', required: true },
        { name: 'condition', label: 'Condition on Arrival', type: 'radio', required: true, options: ['Good', 'Damaged', 'Partial'] },
        { name: 'notes', label: 'Notes', type: 'textarea', required: false },
        { name: 'receiverSignature', label: 'Receiver Signature', type: 'signature', required: true },
        { name: 'driverSignature', label: 'Driver Signature', type: 'signature', required: true }
      ]
    },
    {
      id: 'installation-acceptance',
      title: 'Installation Acceptance',
      description: 'Final acceptance of installation work',
      icon: <BuildIcon color="info" />,
      category: 'Completion',
      fields: [
        { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
        { name: 'installationDate', label: 'Installation Date', type: 'date', required: true },
        { name: 'equipmentInstalled', label: 'Equipment Installed', type: 'textarea', required: true },
        { name: 'testingCompleted', label: 'Testing Completed', type: 'checkbox', required: true },
        { name: 'trainingProvided', label: 'Training Provided', type: 'checkbox', required: true },
        { name: 'warrantyExplained', label: 'Warranty Explained', type: 'checkbox', required: true },
        { name: 'customerSatisfied', label: 'Customer Satisfied', type: 'checkbox', required: true },
        { name: 'customerSignature', label: 'Customer Signature', type: 'signature', required: true },
        { name: 'technicianSignature', label: 'Technician Signature', type: 'signature', required: true }
      ]
    },
    {
      id: 'safety-checklist',
      title: 'Safety Checklist',
      description: 'Pre-work safety inspection and checklist',
      icon: <AssignmentIcon color="error" />,
      category: 'Safety',
      fields: [
        { name: 'jobSite', label: 'Job Site', type: 'text', required: true },
        { name: 'inspectionDate', label: 'Inspection Date', type: 'date', required: true },
        { name: 'inspectedBy', label: 'Inspected By', type: 'text', required: true },
        { name: 'hazardIdentified', label: 'Hazards Identified', type: 'textarea', required: false },
        { name: 'ppeRequired', label: 'PPE Required', type: 'checkbox', required: true },
        { name: 'safetyBriefing', label: 'Safety Briefing Completed', type: 'checkbox', required: true },
        { name: 'emergencyProcedures', label: 'Emergency Procedures Reviewed', type: 'checkbox', required: true },
        { name: 'supervisorSignature', label: 'Supervisor Signature', type: 'signature', required: true }
      ]
    },
    {
      id: 'change-order',
      title: 'Change Order Form',
      description: 'Authorization for changes to original work scope',
      icon: <DescriptionIcon color="secondary" />,
      category: 'Legal',
      fields: [
        { name: 'originalContract', label: 'Original Contract Number', type: 'text', required: true },
        { name: 'changeDescription', label: 'Change Description', type: 'textarea', required: true },
        { name: 'costChange', label: 'Cost Change', type: 'number', required: true },
        { name: 'timeChange', label: 'Time Change (Days)', type: 'number', required: false },
        { name: 'reason', label: 'Reason for Change', type: 'textarea', required: true },
        { name: 'customerApproval', label: 'Customer Approval', type: 'checkbox', required: true },
        { name: 'customerSignature', label: 'Customer Signature', type: 'signature', required: true },
        { name: 'contractorSignature', label: 'Contractor Signature', type: 'signature', required: true }
      ]
    }
  ];

  const handleFormOpen = (form) => {
    setSelectedForm(form);
    setFormData({});
    setOpenDialog(true);
  };

  const handleFormClose = () => {
    setOpenDialog(false);
    setSelectedForm(null);
    setFormData({});
    setGeneratedDocument(null);
    setShowDocument(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    const requiredFields = selectedForm.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }
    
    // Generate the document
    const document = generateDocument(selectedForm.id, formData);
    setGeneratedDocument(document);
    setShowDocument(true);
    
    console.log('Form submitted:', { formType: selectedForm.id, data: formData, document });
    
    // Close the form dialog
    setOpenDialog(false);
  };

  const renderFormField = (field) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'date':
      case 'number':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            margin="normal"
            InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
          />
        );
      
      case 'textarea':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            multiline
            rows={4}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
            margin="normal"
          />
        );
      
      case 'radio':
        return (
          <FormControl key={field.name} margin="normal" required={field.required}>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            >
              {field.options.map(option => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      
      case 'checkbox':
        return (
          <FormGroup key={field.name} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={value || false}
                  onChange={(e) => handleInputChange(field.name, e.target.checked)}
                />
              }
              label={field.label}
              required={field.required}
            />
          </FormGroup>
        );
      
      case 'signature':
        return (
          <Box key={field.name} sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: value ? '#f0f8ff' : '#f5f5f5',
                cursor: 'pointer',
                border: value ? '2px solid #1976d2' : '1px solid #e0e0e0',
                '&:hover': {
                  backgroundColor: value ? '#e3f2fd' : '#eeeeee'
                }
              }}
              onClick={() => {
                const name = prompt('Enter your full name for digital signature:');
                if (name) {
                  handleInputChange(field.name, `${name} - ${new Date().toLocaleDateString()}`);
                }
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                {value ? (
                  <Box>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                      ✓ Signed
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Click to add digital signature
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your signature will be timestamped
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        );
      
      default:
        return null;
    }
  };

  const categories = [...new Set(formTypes.map(form => form.category))];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Business Forms
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Access and manage various business forms including waivers, acceptance forms, and delivery confirmations.
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <DescriptionIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">24</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Forms Available
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">142</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed This Month
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <DateRangeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">8</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Signatures
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">96%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Compliance Rate
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {categories.map(category => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {category === 'Legal' && <ShieldIcon />}
            {category === 'Completion' && <CheckCircleIcon />}
            {category === 'Logistics' && <LocalShippingIcon />}
            {category === 'Safety' && <AssignmentIcon />}
            {category} Forms
          </Typography>
          
          <Grid container spacing={3}>
            {formTypes.filter(form => form.category === category).map((form) => (
              <Grid item xs={12} md={6} lg={4} key={form.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    '&:hover': { boxShadow: 3 }
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {form.icon}
                      <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
                        {form.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {form.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={form.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      variant="contained" 
                      startIcon={<DescriptionIcon />}
                      onClick={() => handleFormOpen(form)}
                      fullWidth
                    >
                      Fill Form
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Recent Forms Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Recent Forms
        </Typography>
        <Paper sx={{ p: 2 }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <ShieldIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Liability Waiver - John Smith" 
                secondary="Pool installation project - Completed 2 hours ago"
              />
              <Button size="small" startIcon={<DownloadIcon />} sx={{ mr: 1 }}>
                PDF
              </Button>
              <Button size="small" startIcon={<EmailIcon />}>
                Email
              </Button>
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Work Acceptance - ABC Corp" 
                secondary="Solar panel installation - Completed yesterday"
              />
              <Button size="small" startIcon={<DownloadIcon />} sx={{ mr: 1 }}>
                PDF
              </Button>
              <Button size="small" startIcon={<EmailIcon />}>
                Email
              </Button>
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <LocalShippingIcon color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Material Delivery - Project #123" 
                secondary="Concrete supplies delivery - Completed 3 days ago"
              />
              <Button size="small" startIcon={<DownloadIcon />} sx={{ mr: 1 }}>
                PDF
              </Button>
              <Button size="small" startIcon={<EmailIcon />}>
                Email
              </Button>
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <BuildIcon color="info" />
              </ListItemIcon>
              <ListItemText 
                primary="Installation Acceptance - HVAC System" 
                secondary="Commercial building project - Completed 1 week ago"
              />
              <Button size="small" startIcon={<DownloadIcon />} sx={{ mr: 1 }}>
                PDF
              </Button>
              <Button size="small" startIcon={<EmailIcon />}>
                Email
              </Button>
            </ListItem>
          </List>
        </Paper>
      </Box>

      {/* Form Builder Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Form Management
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => alert('Custom form builder coming soon!')}
                sx={{ p: 2 }}
              >
                Create Custom Form
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<DescriptionIcon />}
                onClick={() => alert('Form templates coming soon!')}
                sx={{ p: 2 }}
              >
                Browse Templates
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleFormClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {selectedForm?.icon}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {selectedForm?.title}
              </Typography>
            </Box>
            <IconButton onClick={handleFormClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {selectedForm?.description}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {selectedForm?.fields.map(field => renderFormField(field))}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleFormClose}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            startIcon={<CheckCircleIcon />}
          >
            Submit Form
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog 
        open={showDocument} 
        onClose={() => setShowDocument(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Generated Document
            </Typography>
            <IconButton onClick={() => setShowDocument(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {generatedDocument && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                {generatedDocument.title}
              </Typography>
              <Paper sx={{ p: 3, mt: 2, backgroundColor: '#fafafa' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-line', 
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    lineHeight: 1.6
                  }}
                >
                  {generatedDocument.content}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowDocument(false)}
            variant="outlined"
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => {
              // Create a downloadable text file
              const element = document.createElement('a');
              const file = new Blob([generatedDocument.content], {type: 'text/plain'});
              element.href = URL.createObjectURL(file);
              element.download = `${selectedForm?.title || 'document'}_${new Date().toISOString().split('T')[0]}.txt`;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
          >
            Download
          </Button>
          <Button 
            variant="contained" 
            startIcon={<EmailIcon />}
            onClick={() => {
              alert('Email functionality will be integrated with your email system');
            }}
          >
            Email
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PrintIcon />}
            onClick={() => {
              const printWindow = window.open('', '_blank');
              printWindow.document.write(`
                <html>
                  <head>
                    <title>${generatedDocument.title}</title>
                    <style>
                      body { font-family: Arial, sans-serif; margin: 40px; }
                      h1 { text-align: center; }
                      pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
                    </style>
                  </head>
                  <body>
                    <h1>${generatedDocument.title}</h1>
                    <pre>${generatedDocument.content}</pre>
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.print();
            }}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Forms;
