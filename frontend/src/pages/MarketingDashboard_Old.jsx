import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  Share as ShareIconAction,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSettings } from '../contexts/SettingsContext';

const MarketingDashboard = () => {
  const { settings, updateSettings } = useSettings();
  const [quickPostDialog, setQuickPostDialog] = useState(false);
  const [quickPostContent, setQuickPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  // Mock data for demonstration
  const socialMetrics = {
    facebook: { followers: 1234, engagement: 4.2, posts: 23, reach: 5678 },
    twitter: { followers: 890, engagement: 3.8, posts: 45, reach: 3456 },
    instagram: { followers: 2100, engagement: 5.1, posts: 34, reach: 8901 },
    linkedin: { followers: 567, engagement: 2.9, posts: 12, reach: 2345 },
  };

  const recentPosts = [
    {
      id: 1,
      platform: 'facebook',
      content: 'Check out our latest granite installation! Beautiful kitchen transformation...',
      timestamp: '2 hours ago',
      metrics: { likes: 24, comments: 8, shares: 3 }
    },
    {
      id: 2,
      platform: 'instagram',
      content: 'Before and after: stunning bathroom renovation with marble countertops',
      timestamp: '1 day ago',
      metrics: { likes: 67, comments: 12, shares: 15 }
    },
    {
      id: 3,
      platform: 'twitter',
      content: 'Pro tip: Proper sealing is essential for natural stone longevity. Ask us how!',
      timestamp: '2 days ago',
      metrics: { likes: 18, comments: 5, shares: 8 }
    },
  ];

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

  const handleQuickPost = async () => {
    if (!quickPostContent.trim() || selectedPlatforms.length === 0) return;

    const newPost = {
      id: Date.now(),
      content: quickPostContent,
      platforms: selectedPlatforms,
      scheduledTime: new Date().toISOString(),
      status: 'published',
      createdAt: new Date().toISOString(),
    };

    const posts = settings.marketing?.scheduledPosts || [];
    await updateSettings({
      marketing: {
        ...settings.marketing,
        scheduledPosts: [...posts, newPost]
      }
    });

    setQuickPostContent('');
    setSelectedPlatforms([]);
    setQuickPostDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Marketing Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your social media presence and track marketing performance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setQuickPostDialog(true)}
          sx={{ minWidth: 150 }}
        >
          Quick Post
        </Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary" gutterBottom>
                12.4K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Followers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AnalyticsIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main" gutterBottom>
                4.1%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. Engagement
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShareIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main" gutterBottom>
                114
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Posts This Month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CampaignIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main" gutterBottom>
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Campaigns
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Social Media Platforms */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Performance
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(socialMetrics).map(([platform, metrics]) => (
                  <Grid item xs={12} sm={6} key={platform}>
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getSocialIcon(platform)}
                        <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                          {platform}
                        </Typography>
                      </Box>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Followers
                          </Typography>
                          <Typography variant="h6">
                            {metrics.followers.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Engagement
                          </Typography>
                          <Typography variant="h6">
                            {metrics.engagement}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Posts
                          </Typography>
                          <Typography variant="h6">
                            {metrics.posts}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Reach
                          </Typography>
                          <Typography variant="h6">
                            {metrics.reach.toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                      <LinearProgress 
                        variant="determinate" 
                        value={metrics.engagement * 10} 
                        sx={{ mt: 2, borderRadius: 1, height: 6 }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Posts
              </Typography>
              <List>
                {recentPosts.map((post) => (
                  <ListItem key={post.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar>
                        {getSocialIcon(post.platform)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={post.content}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {post.timestamp}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LikeIcon sx={{ fontSize: 16 }} />
                              <Typography variant="caption">{post.metrics.likes}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CommentIcon sx={{ fontSize: 16 }} />
                              <Typography variant="caption">{post.metrics.comments}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ShareIconAction sx={{ fontSize: 16 }} />
                              <Typography variant="caption">{post.metrics.shares}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    <Box>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  href="/admin/settings"
                >
                  Schedule Post
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CampaignIcon />}
                  href="/admin/settings"
                >
                  Create Campaign
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                  href="/admin/settings"
                >
                  View Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Upcoming Posts */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Posts
              </Typography>
              {settings.marketing?.scheduledPosts?.filter(post => 
                new Date(post.scheduledTime) > new Date() && post.status === 'scheduled'
              ).slice(0, 3).map((post) => (
                <Box key={post.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {post.content.substring(0, 60)}...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(post.scheduledTime).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                    {post.platforms.map((platform) => (
                      <Chip
                        key={platform}
                        label={platform}
                        size="small"
                        icon={getSocialIcon(platform)}
                      />
                    ))}
                  </Box>
                </Box>
              )) || (
                <Typography variant="body2" color="text.secondary">
                  No upcoming posts scheduled
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Post Dialog */}
      <Dialog open={quickPostDialog} onClose={() => setQuickPostDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="What's happening?"
            value={quickPostContent}
            onChange={(e) => setQuickPostContent(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
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
                color={selectedPlatforms.includes(platform) ? 'primary' : 'default'}
                onClick={() => {
                  const platforms = selectedPlatforms.includes(platform)
                    ? selectedPlatforms.filter(p => p !== platform)
                    : [...selectedPlatforms, platform];
                  setSelectedPlatforms(platforms);
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickPostDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleQuickPost} 
            variant="contained"
            disabled={!quickPostContent.trim() || selectedPlatforms.length === 0}
          >
            Post Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarketingDashboard;
