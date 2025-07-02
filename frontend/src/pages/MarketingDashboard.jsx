import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Alert,
  Fab,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Notifications,
  AutoAwesome,
  Assessment,
} from '@mui/icons-material';
import { useSettings } from '../contexts/SettingsContext';
import MarketingMetricCard from '../components/Marketing/MarketingMetricCard';
import SocialPostCard from '../components/Marketing/SocialPostCard';
import SocialPostComposer from '../components/Marketing/SocialPostComposer';

const MarketingDashboard = () => {
  const { settings, updateSettings } = useSettings();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [currentTab, setCurrentTab] = useState(0);
  const [showComposer, setShowComposer] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Enhanced mock data with more realistic metrics
  const platformMetrics = {
    overview: {
      totalFollowers: 15847,
      totalEngagement: 4.8,
      monthlyReach: 89234,
      contentPieces: 156,
      avgEngagementRate: 4.8,
      topPerformingPost: "Kitchen transformation reveal",
      growthRate: 12.5,
      conversionRate: 2.3,
    },
    platforms: {
      facebook: { 
        followers: 3200, 
        engagement: 4.2, 
        posts: 23, 
        reach: 15678,
        growth: 8.5,
        bestTime: "7-9 PM",
        topContent: "Before/After photos",
        avgLikes: 45,
        avgComments: 8,
        avgShares: 12
      },
      instagram: { 
        followers: 8900, 
        engagement: 6.1, 
        posts: 34, 
        reach: 45891,
        growth: 15.2,
        bestTime: "8-10 AM, 7-9 PM",
        topContent: "Story highlights",
        avgLikes: 234,
        avgComments: 18,
        avgShares: 45
      },
      linkedin: { 
        followers: 1250, 
        engagement: 3.8, 
        posts: 12, 
        reach: 8945,
        growth: 22.1,
        bestTime: "9-11 AM",
        topContent: "Industry insights",
        avgLikes: 28,
        avgComments: 5,
        avgShares: 8
      },
      youtube: { 
        followers: 2497, 
        engagement: 5.2, 
        posts: 8, 
        reach: 18720,
        growth: 35.7,
        bestTime: "6-8 PM",
        topContent: "Project walkthroughs",
        avgLikes: 89,
        avgComments: 15,
        avgShares: 23
      },
    }
  };

  const recentPosts = [
    {
      id: 1,
      platform: 'instagram',
      content: 'Transform your kitchen with stunning Carrara marble countertops! This beautiful installation showcases the timeless elegance and durability of natural stone. What do you think of this classic choice? ✨ #CarraraMarble #KitchenRenovation #NaturalStone #SurpriseGranite',
      status: 'published',
      createdAt: '2025-07-01T10:30:00Z',
      metrics: { 
        views: 2847, 
        likes: 234, 
        comments: 18, 
        shares: 45,
        engagement: 6.1
      },
      media: ['kitchen-carrara-1.jpg', 'kitchen-carrara-2.jpg']
    },
    {
      id: 2,
      platform: 'facebook',
      content: 'Did you know that granite countertops can increase your home value by up to 15%? Our premium granite installations not only look stunning but are also a smart investment for your property. Contact us for a free estimate!',
      status: 'published',
      createdAt: '2025-06-30T14:15:00Z',
      metrics: { 
        views: 1523, 
        likes: 89, 
        comments: 12, 
        shares: 28,
        engagement: 4.2
      }
    },
    {
      id: 3,
      platform: 'linkedin',
      content: 'The granite and marble industry continues to evolve with new technologies and sustainable practices. At Surprise Granite, we\'re committed to eco-friendly sourcing and cutting-edge fabrication techniques that minimize waste.',
      status: 'published',
      createdAt: '2025-06-29T09:45:00Z',
      metrics: { 
        views: 892, 
        likes: 45, 
        comments: 8, 
        shares: 15,
        engagement: 3.8
      }
    },
    {
      id: 4,
      platform: 'youtube',
      content: 'New video: Complete bathroom renovation featuring stunning Calacatta marble vanity tops and shower surrounds. Watch the full transformation process!',
      status: 'published',
      createdAt: '2025-06-28T16:20:00Z',
      metrics: { 
        views: 3456, 
        likes: 156, 
        comments: 23, 
        shares: 67,
        engagement: 5.2
      }
    }
  ];

  const scheduledPosts = settings.marketing?.scheduledPosts || [];
  const drafts = settings.marketing?.drafts || [];

  const handlePostSubmit = async (postData) => {
    try {
      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to published posts (in real app, this would be handled by backend)
      console.log('Publishing post:', postData);
      setShowComposer(false);
      
      // Show success message
      alert('Post published successfully!');
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Error publishing post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePost = async (postData) => {
    try {
      const posts = scheduledPosts;
      await updateSettings({
        marketing: {
          ...settings.marketing,
          scheduledPosts: [...posts, { ...postData, id: Date.now() }]
        }
      });
      setShowComposer(false);
      alert('Post scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling post:', error);
    }
  };

  const handleSaveDraft = async (draftData) => {
    try {
      const currentDrafts = drafts;
      await updateSettings({
        marketing: {
          ...settings.marketing,
          drafts: [...currentDrafts, { ...draftData, id: Date.now() }]
        }
      });
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handlePostEdit = (postId, newContent) => {
    console.log('Editing post:', postId, newContent);
    // Implement post editing logic
  };

  const handlePostDelete = (postId) => {
    console.log('Deleting post:', postId);
    // Implement post deletion logic
  };

  const handlePostAnalytics = (post) => {
    console.log('Viewing analytics for post:', post);
    // Open detailed analytics view
  };

  const tabContent = [
    {
      label: 'Overview',
      icon: <AnalyticsIcon />,
      component: (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MarketingMetricCard
                title="Total Followers"
                value={platformMetrics.overview.totalFollowers}
                icon={TrendingUpIcon}
                color="primary"
                trend="up"
                trendValue={12.5}
                subtitle="Across all platforms"
                details={{
                  'Facebook': platformMetrics.platforms.facebook.followers.toLocaleString(),
                  'Instagram': platformMetrics.platforms.instagram.followers.toLocaleString(),
                  'LinkedIn': platformMetrics.platforms.linkedin.followers.toLocaleString(),
                  'YouTube': platformMetrics.platforms.youtube.followers.toLocaleString(),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MarketingMetricCard
                title="Avg. Engagement"
                value={platformMetrics.overview.avgEngagementRate}
                unit="%"
                icon={AnalyticsIcon}
                color="success"
                trend="up"
                trendValue={8.3}
                target={5.0}
                subtitle="Industry avg: 3.2%"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MarketingMetricCard
                title="Monthly Reach"
                value={platformMetrics.overview.monthlyReach}
                icon={CampaignIcon}
                color="info"
                trend="up"
                trendValue={15.7}
                subtitle="Unique accounts reached"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MarketingMetricCard
                title="Content Pieces"
                value={platformMetrics.overview.contentPieces}
                icon={ScheduleIcon}
                color="warning"
                subtitle="Published this month"
                target={200}
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>AI Insights</Typography>
            Your Instagram engagement rate increased by 15% this week. Consider posting more 
            before/after content between 8-10 AM for maximum reach.
          </Alert>
        </Box>
      )
    },
    {
      label: 'Create Content',
      icon: <AddIcon />,
      component: (
        <Box>
          <SocialPostComposer
            onPost={handlePostSubmit}
            onSchedule={handleSchedulePost}
            onSaveDraft={handleSaveDraft}
          />
        </Box>
      )
    },
    {
      label: 'Recent Posts',
      icon: <CampaignIcon />,
      component: (
        <Box>
          {recentPosts.map((post) => (
            <SocialPostCard
              key={post.id}
              post={post}
              platform={post.platform}
              onEdit={handlePostEdit}
              onDelete={handlePostDelete}
              onAnalytics={handlePostAnalytics}
            />
          ))}
        </Box>
      )
    },
    {
      label: 'Scheduled',
      icon: <ScheduleIcon />,
      component: (
        <Box>
          {scheduledPosts.length > 0 ? (
            scheduledPosts.map((post) => (
              <SocialPostCard
                key={post.id}
                post={post}
                platform={post.platforms?.[0] || 'facebook'}
                onEdit={handlePostEdit}
                onDelete={handlePostDelete}
                showMetrics={false}
              />
            ))
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No scheduled posts</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create and schedule content to maintain a consistent posting schedule
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => setCurrentTab(1)}
                  startIcon={<AddIcon />}
                >
                  Create Your First Scheduled Post
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      )
    },
    {
      label: 'Analytics',
      icon: <Assessment />,
      component: (
        <Box>
          <Grid container spacing={3}>
            {Object.entries(platformMetrics.platforms).map(([platform, metrics]) => (
              <Grid item xs={12} md={6} key={platform}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                      {platform} Performance
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Followers</Typography>
                        <Typography variant="h6">{metrics.followers.toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Growth Rate</Typography>
                        <Typography variant="h6" color="success.main">+{metrics.growth}%</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Engagement</Typography>
                        <Typography variant="h6">{metrics.engagement}%</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Best Time</Typography>
                        <Typography variant="body2">{metrics.bestTime}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Top Content Type</Typography>
                        <Typography variant="body2">{metrics.topContent}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Marketing Hub
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your social presence, create content, and track performance
          </Typography>
        </Box>
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Badge badgeContent={scheduledPosts.length} color="primary">
              <Button variant="outlined" startIcon={<ScheduleIcon />}>
                Scheduled ({scheduledPosts.length})
              </Button>
            </Badge>
            <Badge badgeContent={drafts.length} color="secondary">
              <Button variant="outlined" startIcon={<AutoAwesome />}>
                Drafts ({drafts.length})
              </Button>
            </Badge>
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 1.5,
            },
          }}
        >
          {tabContent.map((tab, index) => (
            <Tab 
              key={index}
              icon={tab.icon} 
              label={tab.label}
              iconPosition="start"
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 48,
              }}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ mt: 3 }}>
        {tabContent[currentTab]?.component}
      </Box>

      {/* Floating Action Button for quick post creation */}
      <Fab
        color="primary"
        aria-label="create post"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' }, // Only show on mobile
        }}
        onClick={() => setCurrentTab(1)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default MarketingDashboard;
