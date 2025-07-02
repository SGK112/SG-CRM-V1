import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Tooltip,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Share,
  Analytics,
  Schedule,
  Visibility,
  ThumbUp,
  Comment,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

const SocialPostCard = ({ 
  post, 
  platform, 
  onEdit, 
  onDelete, 
  onShare, 
  onAnalytics,
  showMetrics = true 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getPlatformIcon = (platformName) => {
    const icons = {
      facebook: { icon: '📘', color: '#1877f2' },
      twitter: { icon: '🐦', color: '#1da1f2' },
      instagram: { icon: '📷', color: '#e4405f' },
      linkedin: { icon: '💼', color: '#0077b5' },
      youtube: { icon: '📺', color: '#ff0000' },
      tiktok: { icon: '🎵', color: '#000000' },
      pinterest: { icon: '📌', color: '#bd081c' },
    };
    return icons[platformName] || { icon: '📱', color: '#666' };
  };

  const getEngagementRate = () => {
    if (!post.metrics) return 0;
    const { likes, comments, shares, views } = post.metrics;
    const totalEngagement = (likes || 0) + (comments || 0) + (shares || 0);
    const totalViews = views || Math.max(totalEngagement * 10, 100);
    return ((totalEngagement / totalViews) * 100).toFixed(1);
  };

  const platformData = getPlatformIcon(platform);
  const engagementRate = getEngagementRate();
  const isScheduled = post.status === 'scheduled';
  const isPublished = post.status === 'published';

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: platformData.color, width: 40, height: 40 }}>
                {platformData.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {platform}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={post.status} 
                    size="small" 
                    color={isPublished ? 'success' : isScheduled ? 'warning' : 'default'}
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {isScheduled ? 
                      `Scheduled for ${new Date(post.scheduledTime).toLocaleDateString()}` :
                      new Date(post.createdAt).toLocaleDateString()
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVert />
            </IconButton>
          </Box>

          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            {post.content}
          </Typography>

          {post.media && post.media.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Chip label={`${post.media.length} media file(s)`} size="small" color="info" />
            </Box>
          )}

          {showMetrics && post.metrics && isPublished && (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
              gap: 2, 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1 
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                  <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="h6" color="primary">
                    {(post.metrics.views || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">Views</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                  <ThumbUp sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="h6" color="success.main">
                    {(post.metrics.likes || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">Likes</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                  <Comment sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="h6" color="info.main">
                    {(post.metrics.comments || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">Comments</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                  <Share sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="h6" color="warning.main">
                    {(post.metrics.shares || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">Shares</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                  {parseFloat(engagementRate) > 3 ? 
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} /> :
                    <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                  }
                  <Typography variant="h6" color={parseFloat(engagementRate) > 3 ? 'success.main' : 'error.main'}>
                    {engagementRate}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">Engagement</Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { setEditDialog(true); handleMenuClose(); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit Post</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onAnalytics?.(post); handleMenuClose(); }}>
          <ListItemIcon><Analytics fontSize="small" /></ListItemIcon>
          <ListItemText>View Analytics</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onShare?.(post); handleMenuClose(); }}>
          <ListItemIcon><Share fontSize="small" /></ListItemIcon>
          <ListItemText>Share Again</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onDelete?.(post.id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Post Content"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              onEdit?.(post.id, editContent);
              setEditDialog(false);
            }}
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SocialPostCard;
