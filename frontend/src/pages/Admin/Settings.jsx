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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Integration as IntegrationIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  CloudUpload,
  Check,
  Error,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Campaign as CampaignIcon,
  Analytics as AnalyticsIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Launch as LaunchIcon,
  ContentCopy as CopyIcon,
  Schedule as ScheduleIcon,
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
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [postDialog, setPostDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

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

  // Marketing & Social Media Functions
  const handleSocialMediaUpdate = async (platform, config) => {
    const result = await updateIntegration(`social_${platform}`, config);
    if (result.success) {
      showAlert(`${platform} settings updated successfully`);
    } else {
      showAlert(result.error, 'error');
    }
  };

  const handleCampaignSave = async (campaignData) => {
    // Save marketing campaign
    const campaigns = settings.marketing?.campaigns || [];
    const updatedCampaigns = selectedCampaign 
      ? campaigns.map(c => c.id === selectedCampaign.id ? { ...campaignData, id: selectedCampaign.id } : c)
      : [...campaigns, { ...campaignData, id: Date.now(), createdAt: new Date().toISOString() }];
    
    const result = await updateSettings({
      marketing: {
        ...settings.marketing,
        campaigns: updatedCampaigns
      }
    });
    
    if (result.success) {
      showAlert('Campaign saved successfully');
      setCampaignDialog(false);
      setSelectedCampaign(null);
    } else {
      showAlert(result.error, 'error');
    }
  };

  const handlePostSchedule = async (postData) => {
    // Schedule social media post
    const posts = settings.marketing?.scheduledPosts || [];
    const updatedPosts = selectedPost
      ? posts.map(p => p.id === selectedPost.id ? { ...postData, id: selectedPost.id } : p)
      : [...posts, { ...postData, id: Date.now(), createdAt: new Date().toISOString() }];
    
    const result = await updateSettings({
      marketing: {
        ...settings.marketing,
        scheduledPosts: updatedPosts
      }
    });
    
    if (result.success) {
      showAlert('Post scheduled successfully');
      setPostDialog(false);
      setSelectedPost(null);
    } else {
      showAlert(result.error, 'error');
    }
  };

  const getSocialIcon = (platform) => {
    const icons = {
      facebook: <Facebook sx={{ color: '#1877f2' }} />,
      twitter: <Twitter sx={{ color: '#1da1f2' }} />,
      instagram: <Instagram sx={{ color: '#e4405f' }} />,
      linkedin: <LinkedIn sx={{ color: '#0077b5' }} />,
      youtube: <YouTube sx={{ color: '#ff0000' }} />,
    };
    return icons[platform] || <ShareIcon />;
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

  const SocialMediaCard = ({ platform, config = {}, onUpdate }) => {
    const [localConfig, setLocalConfig] = useState({
      appId: '',
      appSecret: '',
      accessToken: '',
      pageId: '',
      enabled: false,
      autoPost: false,
      ...config
    });
    
    const handleSave = async () => {
      await onUpdate(platform, localConfig);
    };

    const platformFields = {
      facebook: ['appId', 'appSecret', 'accessToken', 'pageId'],
      twitter: ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret'],
      instagram: ['appId', 'appSecret', 'accessToken'],
      linkedin: ['clientId', 'clientSecret', 'accessToken'],
      youtube: ['apiKey', 'clientId', 'clientSecret', 'channelId']
    };

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {getSocialIcon(platform)}
            <Typography variant="h6" sx={{ ml: 2, flexGrow: 1, textTransform: 'capitalize' }}>
              {platform}
            </Typography>
            <Switch
              checked={localConfig.enabled}
              onChange={(e) => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
            />
          </Box>
          
          {localConfig.enabled && (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {(platformFields[platform] || []).map((field) => (
                  <Grid item xs={12} md={6} key={field}>
                    <TextField
                      fullWidth
                      label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                      type={field.includes('secret') || field.includes('token') ? 'password' : 'text'}
                      value={localConfig[field] || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, [field]: e.target.value })}
                      size="small"
                    />
                  </Grid>
                ))}
              </Grid>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={localConfig.autoPost}
                    onChange={(e) => setLocalConfig({ ...localConfig, autoPost: e.target.checked })}
                  />
                }
                label="Auto-post new content"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={handleSave}>
                  Save Configuration
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => handleIntegrationTest(`social_${platform}`)}
                  disabled={testing[`social_${platform}`]}
                >
                  {testing[`social_${platform}`] ? 'Testing...' : 'Test Connection'}
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<LaunchIcon />}
                  onClick={() => window.open(`https://developers.${platform}.com`, '_blank')}
                >
                  Developer Console
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // Campaign Dialog Component
  const CampaignDialog = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      type: 'social_media',
      budget: '',
      startDate: '',
      endDate: '',
      targetAudience: '',
      platforms: [],
      status: 'draft',
      ...selectedCampaign
    });

    return (
      <Dialog open={campaignDialog} onClose={() => setCampaignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="social_media">Social Media</MenuItem>
                  <MenuItem value="email">Email Marketing</MenuItem>
                  <MenuItem value="google_ads">Google Ads</MenuItem>
                  <MenuItem value="content">Content Marketing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Budget ($)"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCampaignDialog(false)}>Cancel</Button>
          <Button onClick={() => handleCampaignSave(formData)} variant="contained">
            {selectedCampaign ? 'Update' : 'Create'} Campaign
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Social Media Post Dialog
  const PostDialog = () => {
    const [formData, setFormData] = useState({
      content: '',
      platforms: [],
      scheduledTime: '',
      image: '',
      status: 'scheduled',
      ...selectedPost
    });

    return (
      <Dialog open={postDialog} onClose={() => setPostDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPost ? 'Edit Post' : 'Schedule New Post'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Post Content"
                multiline
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="What's happening in your business today?"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Schedule Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Select Platforms:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((platform) => (
                  <Chip
                    key={platform}
                    icon={getSocialIcon(platform)}
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    clickable
                    color={formData.platforms.includes(platform) ? 'primary' : 'default'}
                    onClick={() => {
                      const platforms = formData.platforms.includes(platform)
                        ? formData.platforms.filter(p => p !== platform)
                        : [...formData.platforms, platform];
                      setFormData({ ...formData, platforms });
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPostDialog(false)}>Cancel</Button>
          <Button onClick={() => handlePostSchedule(formData)} variant="contained">
            {selectedPost ? 'Update' : 'Schedule'} Post
          </Button>
        </DialogActions>
      </Dialog>
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
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<BusinessIcon />} label="Company" />
          <Tab icon={<IntegrationIcon />} label="Integrations" />
          <Tab icon={<ShareIcon />} label="Social Media" />
          <Tab icon={<CampaignIcon />} label="Marketing" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
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
            config={settings.integrations?.quickbooks || {}}
            onUpdate={updateIntegration}
            onTest={handleIntegrationTest}
          />

          <IntegrationCard
            name="stripe"
            icon={<BusinessIcon color="primary" />}
            config={settings.integrations?.stripe || {}}
            onUpdate={updateIntegration}
            onTest={handleIntegrationTest}
          />

          <IntegrationCard
            name="googleCalendar"
            icon={<BusinessIcon color="primary" />}
            config={settings.integrations?.googleCalendar || {}}
            onUpdate={updateIntegration}
            onTest={handleIntegrationTest}
          />

          <IntegrationCard
            name="sendgrid"
            icon={<BusinessIcon color="primary" />}
            config={settings.integrations?.sendgrid || {}}
            onUpdate={updateIntegration}
            onTest={handleIntegrationTest}
          />

          <IntegrationCard
            name="twilio"
            icon={<BusinessIcon color="primary" />}
            config={settings.integrations?.twilio || {}}
            onUpdate={updateIntegration}
            onTest={handleIntegrationTest}
          />
        </TabPanel>

        {/* Social Media */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Social Media Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure your social media accounts and manage posts
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => {
                setSelectedPost(null);
                setPostDialog(true);
              }}
            >
              Schedule Post
            </Button>
          </Box>

          {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((platform) => (
            <SocialMediaCard
              key={platform}
              platform={platform}
              config={settings.integrations?.[`social_${platform}`] || {}}
              onUpdate={handleSocialMediaUpdate}
            />
          ))}

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scheduled Posts
              </Typography>
              {settings.marketing?.scheduledPosts?.length > 0 ? (
                <List>
                  {settings.marketing.scheduledPosts.map((post) => (
                    <ListItem key={post.id}>
                      <ListItemText
                        primary={post.content.substring(0, 100) + '...'}
                        secondary={`Scheduled for: ${new Date(post.scheduledTime).toLocaleString()} | Platforms: ${post.platforms.join(', ')}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() => {
                            setSelectedPost(post);
                            setPostDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No scheduled posts. Click "Schedule Post" to get started.
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Marketing Campaigns */}
        <TabPanel value={currentTab} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Marketing Campaigns
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage your marketing campaigns across all channels
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedCampaign(null);
                setCampaignDialog(true);
              }}
            >
              New Campaign
            </Button>
          </Box>

          <Grid container spacing={3}>
            {settings.marketing?.campaigns?.map((campaign) => (
              <Grid item xs={12} md={6} lg={4} key={campaign.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {campaign.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {campaign.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={campaign.type.replace('_', ' ').toUpperCase()}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={campaign.status.toUpperCase()}
                        size="small"
                        color={campaign.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Budget: ${campaign.budget || 'Not set'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Duration: {campaign.startDate} to {campaign.endDate}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setCampaignDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="small" color="error">
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )) || (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <CampaignIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No campaigns yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first marketing campaign to reach more customers
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedCampaign(null);
                      setCampaignDialog(true);
                    }}
                  >
                    Create Campaign
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Analytics */}
        <TabPanel value={currentTab} index={4}>
          <Typography variant="h6" gutterBottom>
            Marketing Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Track your marketing performance and ROI
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    1,234
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Reach
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    89
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Leads Generated
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    4.2%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conversion Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    $2,450
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ROI This Month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Performance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analytics integration coming soon. Connect Google Analytics, Facebook Insights, and other platforms to see detailed performance metrics.
              </Typography>
            </CardContent>
          </Card>
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

      <CampaignDialog />
      <PostDialog />
    </Box>
  );
};

export default Settings;
