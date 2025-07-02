import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Extension as IntegrationIcon,
  Palette as ThemeIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const EnhancedSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stripeConnected] = useState(true);
  const [paymentMethodDialog, setPaymentMethodDialog] = useState(false);
  const [invoiceSettings, setInvoiceSettings] = useState({
    autoSend: true,
    reminderDays: [7, 3, 1],
    lateFee: 5.0,
    currency: 'USD',
    taxRate: 8.25,
    paymentTerms: 'Net 30',
  });

  const [businessInfo, setBusinessInfo] = useState({
    name: 'Surprise Granite & Marble',
    address: '123 Granite Way, Surprise, AZ 85374',
    phone: '(623) 555-0123',
    email: 'info@surprisegranite.com',
    website: 'https://www.surprisegranite.com',
    license: 'AZ-ROC-123456',
    taxId: '12-3456789',
  });

  const integrations = [
    {
      name: 'Stripe',
      description: 'Payment processing and invoicing',
      icon: <CreditCardIcon />,
      connected: true,
      status: 'active',
      color: '#635bff',
    },
    {
      name: 'QuickBooks',
      description: 'Accounting and financial management',
      icon: <ReceiptIcon />,
      connected: false,
      status: 'available',
      color: '#0077c5',
    },
    {
      name: 'Google Calendar',
      description: 'Appointment and schedule sync',
      icon: <TimelineIcon />,
      connected: true,
      status: 'active',
      color: '#4285f4',
    },
    {
      name: 'Mailchimp',
      description: 'Email marketing and campaigns',
      icon: <EmailIcon />,
      connected: false,
      status: 'available',
      color: '#ffe01b',
    },
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'Credit Card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/25',
      isDefault: true,
    },
    {
      id: 2,
      type: 'Bank Account',
      last4: '1234',
      bank: 'Chase Bank',
      isDefault: false,
    },
  ];

  const BillingInvoicingTab = () => (
    <Box>
      {/* Payment Processing */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon sx={{ color: '#8B4513' }} />
          Payment Processing
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ border: stripeConnected ? '2px solid #4caf50' : '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ backgroundColor: '#635bff' }}>
                      <CreditCardIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">Stripe</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accept credit cards, ACH, and digital wallets
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={stripeConnected ? 'Connected' : 'Not Connected'} 
                    color={stripeConnected ? 'success' : 'default'}
                    icon={stripeConnected ? <CheckIcon /> : <WarningIcon />}
                  />
                </Box>
                
                {stripeConnected ? (
                  <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Your Stripe account is connected and ready to process payments.
                    </Alert>
                    <Typography variant="body2" gutterBottom>
                      <strong>Account ID:</strong> acct_1234567890
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Processing Fee:</strong> 2.9% + $0.30 per transaction
                    </Typography>
                    <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                      Manage in Stripe Dashboard
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Connect your Stripe account to start accepting payments.
                    </Alert>
                    <Button variant="contained" sx={{ backgroundColor: '#635bff' }}>
                      Connect Stripe Account
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Payment Methods</Typography>
                <List>
                  {paymentMethods.map((method) => (
                    <ListItem key={method.id} divider>
                      <ListItemIcon>
                        {method.type === 'Credit Card' ? <CreditCardIcon /> : <BankIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${method.type} ending in ${method.last4}`}
                        secondary={method.type === 'Credit Card' ? 
                          `${method.brand} • Expires ${method.expiry}` : 
                          method.bank
                        }
                      />
                      <ListItemSecondaryAction>
                        {method.isDefault && (
                          <Chip label="Default" size="small" color="primary" sx={{ mr: 1 }} />
                        )}
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setPaymentMethodDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Invoice Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon sx={{ color: '#8B4513' }} />
          Invoice Settings
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Default Payment Terms</InputLabel>
              <Select
                value={invoiceSettings.paymentTerms}
                label="Default Payment Terms"
                onChange={(e) => setInvoiceSettings(prev => ({ ...prev, paymentTerms: e.target.value }))}
              >
                <MenuItem value="Due on Receipt">Due on Receipt</MenuItem>
                <MenuItem value="Net 15">Net 15 Days</MenuItem>
                <MenuItem value="Net 30">Net 30 Days</MenuItem>
                <MenuItem value="Net 60">Net 60 Days</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Tax Rate (%)"
              type="number"
              value={invoiceSettings.taxRate}
              onChange={(e) => setInvoiceSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
              margin="normal"
              InputProps={{
                endAdornment: '%',
              }}
            />
            
            <TextField
              fullWidth
              label="Late Fee (%)"
              type="number"
              value={invoiceSettings.lateFee}
              onChange={(e) => setInvoiceSettings(prev => ({ ...prev, lateFee: parseFloat(e.target.value) }))}
              margin="normal"
              InputProps={{
                endAdornment: '%',
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={invoiceSettings.autoSend}
                  onChange={(e) => setInvoiceSettings(prev => ({ ...prev, autoSend: e.target.checked }))}
                />
              }
              label="Automatically send invoices"
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Payment Reminder Schedule
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send automatic reminders before due date
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {[7, 3, 1].map((days) => (
                  <Chip
                    key={days}
                    label={`${days} days`}
                    color="primary"
                    size="small"
                    onDelete={() => {
                      // Remove reminder logic
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Pro Tip:</strong> Automatic invoicing and reminders can improve your cash flow by up to 30%.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Paper>

      {/* Business Information */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon sx={{ color: '#8B4513' }} />
          Business Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Business Name"
              value={businessInfo.name}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Business Address"
              value={businessInfo.address}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={businessInfo.phone}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={businessInfo.email}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website"
              value={businessInfo.website}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, website: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="License Number"
              value={businessInfo.license}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, license: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Tax ID / EIN"
              value={businessInfo.taxId}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, taxId: e.target.value }))}
              margin="normal"
            />
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                This information will appear on your invoices and estimates.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const IntegrationsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IntegrationIcon sx={{ color: '#8B4513' }} />
        Connected Apps & Integrations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Connect your favorite tools to streamline your workflow
      </Typography>

      <Grid container spacing={3}>
        {integrations.map((integration) => (
          <Grid item xs={12} md={6} key={integration.name}>
            <Card sx={{ 
              border: integration.connected ? '2px solid #4caf50' : '1px solid #e0e0e0',
              position: 'relative'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ backgroundColor: integration.color }}>
                      {integration.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{integration.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {integration.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={integration.connected ? 'Connected' : 'Available'}
                    color={integration.connected ? 'success' : 'default'}
                    icon={integration.connected ? <CheckIcon /> : <AddIcon />}
                  />
                </Box>

                {integration.connected ? (
                  <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {integration.name} is connected and syncing data.
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" size="small" startIcon={<SyncIcon />}>
                        Sync Now
                      </Button>
                      <Button variant="outlined" size="small" startIcon={<SettingsIcon />}>
                        Configure
                      </Button>
                      <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />}>
                        Disconnect
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Connect {integration.name} to enhance your CRM capabilities.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{
                        backgroundColor: integration.color,
                        '&:hover': { backgroundColor: integration.color, opacity: 0.8 }
                      }}
                    >
                      Connect {integration.name}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const tabs = [
    { label: 'Billing & Invoicing', icon: <PaymentIcon /> },
    { label: 'Integrations', icon: <IntegrationIcon /> },
    { label: 'Notifications', icon: <NotificationsIcon /> },
    { label: 'Security', icon: <SecurityIcon /> },
    { label: 'Appearance', icon: <ThemeIcon /> },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your CRM settings, integrations, and preferences
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 72,
              flexDirection: 'row',
              gap: 1,
            },
            '& .Mui-selected': { color: '#8B4513' },
            '& .MuiTabs-indicator': { backgroundColor: '#8B4513' },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {tabValue === 0 && <BillingInvoicingTab />}
        {tabValue === 1 && <IntegrationsTab />}
        {tabValue === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Notification Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              Configure how and when you receive notifications
            </Typography>
          </Paper>
        )}
        {tabValue === 3 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Security Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your account security and privacy settings
            </Typography>
          </Paper>
        )}
        {tabValue === 4 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Appearance Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              Customize the look and feel of your CRM
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: '#8B4513',
            '&:hover': { backgroundColor: '#D4A574' },
            px: 4,
          }}
        >
          Save Changes
        </Button>
      </Box>

      {/* Payment Method Dialog */}
      <Dialog open={paymentMethodDialog} onClose={() => setPaymentMethodDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add a new payment method for processing client payments
          </Typography>
          {/* Payment method form would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentMethodDialog(false)}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: '#8B4513' }}>
            Add Method
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedSettings;
