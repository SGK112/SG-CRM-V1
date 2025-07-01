import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Integration as IntegrationIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  CloudUpload,
  Check,
  Error,
} from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';

const TabPanel = ({ children, value, index, ...other }) => (
  <div hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Settings = () => {
  const { settings, updateSettings, updateIntegration, testIntegration } = useSettings();
  const [currentTab, setCurrentTab] = useState(0);
  const [alert, setAlert] = useState(null);
  const [testing, setTesting] = useState({});

  const showAlert = (message, severity = 'success') => {
    setAlert({ message, severity });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCompanyUpdate = async (field, value) => {
    const result = await updateSettings({
      company: {
        ...settings.company,
        [field]: value,
      },
    });
    
    if (result.success) {
      showAlert('Company settings updated successfully');
    } else {
      showAlert(result.error, 'error');
    }
  };

  const handleIntegrationTest = async (integration) => {
    setTesting({ ...testing, [integration]: true });
    const result = await testIntegration(integration);
    setTesting({ ...testing, [integration]: false });
    
    if (result.success) {
      showAlert(`${integration} connection successful!`);
      await updateIntegration(integration, { connected: true });
    } else {
      showAlert(`${integration} connection failed: ${result.error}`, 'error');
    }
  };

  const IntegrationCard = ({ name, icon, config, onUpdate, onTest }) => {
    const [localConfig, setLocalConfig] = useState(config);
    
    const handleSave = async () => {
      const result = await updateIntegration(name, localConfig);
      if (result.success) {
        showAlert(`${name} configuration saved`);
      } else {
        showAlert(result.error, 'error');
      }
    };

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {icon}
            <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Chip
              label={config.connected ? 'Connected' : 'Not Connected'}
              color={config.connected ? 'success' : 'default'}
              icon={config.connected ? <Check /> : <Error />}
            />
          </Box>
          
          <Grid container spacing={2}>
            {Object.entries(config).filter(([key]) => key !== 'connected').map(([key, value]) => (
              <Grid item xs={12} md={6} key={key}>
                <TextField
                  fullWidth
                  label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  type={key.includes('secret') || key.includes('key') || key.includes('token') ? 'password' : 'text'}
                  value={localConfig[key] || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, [key]: e.target.value })}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleSave}>
              Save Configuration
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => onTest(name)}
              disabled={testing[name]}
            >
              {testing[name] ? 'Testing...' : 'Test Connection'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        Admin Settings
      </Typography>

      {alert && (
        <Alert severity={alert.severity} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      <Card>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<BusinessIcon />} label="Company" />
          <Tab icon={<IntegrationIcon />} label="Integrations" />
          <Tab icon={<SecurityIcon />} label="Permissions" />
          <Tab icon={<SettingsIcon />} label="Features" />
        </Tabs>

        {/* Company Settings */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={settings.company.logo}
                  sx={{ width: 80, height: 80, mr: 3 }}
                />
                <Box>
                  <Typography variant="h6">{settings.company.name}</Typography>
                  <Button startIcon={<CloudUpload />} size="small">
                    Update Logo
                  </Button>
                </Box>
              </Box>
              
              <TextField
                fullWidth
                label="Company Name"
                value={settings.company.name}
                onChange={(e) => handleCompanyUpdate('name', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Website"
                value={settings.company.website}
                onChange={(e) => handleCompanyUpdate('website', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={settings.company.address}
                onChange={(e) => handleCompanyUpdate('address', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Phone"
                value={settings.company.phone}
                onChange={(e) => handleCompanyUpdate('phone', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Email"
                value={settings.company.email}
                onChange={(e) => handleCompanyUpdate('email', e.target.value)}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Integrations */}
        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Connect Your Business Tools
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure your API credentials to connect with external services
          </Typography>

          <IntegrationCard
            name="quickbooks"
            icon={<BusinessIcon color="primary" />}
            config={settings.integrations.quickbooks}
            onUpdate={updateIntegration}
            onTest={handleIntegrationTest}
          />

          <IntegrationCard
            name="stripe"
            icon={<BusinessIcon color="primary" />}
            config={settings.integrations.stripe}
            onUpdate={updateIntegration}
            onTest={handleIntegrationTest}
          />

          <IntegrationCard
            name="googleCalendar"
            icon={<BusinessIcon color="primary" />}
            config={settings.integrations.googleCalendar}
            onUpdate={updateIntegration}
            onTest={handleIntegrationTest}
          />

          <IntegrationCard
            name="sendgrid"
            icon={<BusinessIcon color="primary" />}
            config={settings.integrations.sendgrid}
            onUpdate={updateIntegration}
            onTest={handleIntegrationTest}
          />

          <IntegrationCard
            name="twilio"
            icon={<BusinessIcon color="primary" />}
            config={settings.integrations.twilio}
            onUpdate={updateIntegration}
            onTest={handleIntegrationTest}
          />
        </TabPanel>

        {/* Permissions */}
        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" gutterBottom>
            User Roles & Permissions
          </Typography>
          
          {Object.entries(settings.permissions).map(([role, permissions]) => (
            <Card key={role} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {permissions.map((permission) => (
                    <Chip key={permission} label={permission} size="small" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </TabPanel>

        {/* Features */}
        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Feature Configuration
          </Typography>
          
          <Grid container spacing={2}>
            {Object.entries(settings.features).map(([feature, enabled]) => (
              <Grid item xs={12} md={6} key={feature}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enabled}
                      onChange={(e) => updateSettings({
                        features: {
                          ...settings.features,
                          [feature]: e.target.checked,
                        },
                      })}
                    />
                  }
                  label={feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}
                />
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default Settings;
