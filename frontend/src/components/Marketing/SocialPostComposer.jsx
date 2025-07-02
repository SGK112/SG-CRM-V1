import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Schedule,
  CameraAlt,
  GifBox,
  Poll,
  LocationOn,
  Mood,
  Tag,
  AttachFile,
  Send,
  SaveDraft,
  Preview,
} from '@mui/icons-material';

const SocialPostComposer = ({ onPost, onSchedule, onSaveDraft, platforms = [] }) => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [postType, setPostType] = useState('text');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);

  const availablePlatforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877f2', maxChars: 63206 },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1da1f2', maxChars: 280 },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: '#e4405f', maxChars: 2200 },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0077b5', maxChars: 3000 },
    { id: 'youtube', name: 'YouTube', icon: '📺', color: '#ff0000', maxChars: 5000 },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000', maxChars: 150 },
    ...platforms
  ];

  const getCharacterLimit = () => {
    if (selectedPlatforms.length === 0) return null;
    return Math.min(...selectedPlatforms.map(id => 
      availablePlatforms.find(p => p.id === id)?.maxChars || 1000
    ));
  };

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = () => {
    const postData = {
      content,
      platforms: selectedPlatforms,
      hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
      location,
      attachments,
      type: postType,
      scheduledTime: isScheduled ? scheduledTime : null,
      status: isScheduled ? 'scheduled' : 'published',
      createdAt: new Date().toISOString(),
    };

    if (isScheduled) {
      onSchedule?.(postData);
    } else {
      onPost?.(postData);
    }

    // Reset form
    setContent('');
    setSelectedPlatforms([]);
    setHashtags('');
    setLocation('');
    setAttachments([]);
    setScheduledTime('');
    setIsScheduled(false);
  };

  const handleSaveDraft = () => {
    const draftData = {
      content,
      platforms: selectedPlatforms,
      hashtags,
      location,
      attachments,
      type: postType,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    onSaveDraft?.(draftData);
  };

  const characterLimit = getCharacterLimit();
  const remainingChars = characterLimit ? characterLimit - content.length : null;
  const isOverLimit = remainingChars !== null && remainingChars < 0;
  const canPost = content.trim() && selectedPlatforms.length > 0 && !isOverLimit;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Add />
          Create New Post
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Select Platforms:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availablePlatforms.map((platform) => (
              <Chip
                key={platform.id}
                avatar={<Avatar sx={{ bgcolor: 'transparent', fontSize: '16px' }}>{platform.icon}</Avatar>}
                label={platform.name}
                clickable
                color={selectedPlatforms.includes(platform.id) ? 'primary' : 'default'}
                variant={selectedPlatforms.includes(platform.id) ? 'filled' : 'outlined'}
                onClick={() => handlePlatformToggle(platform.id)}
              />
            ))}
          </Box>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="What's happening?"
          placeholder="Share updates about your latest projects, tips, or company news..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={isOverLimit}
          helperText={
            remainingChars !== null 
              ? `${remainingChars} characters remaining`
              : 'Select platforms to see character limits'
          }
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hashtags"
              placeholder="#granite #countertops #renovation"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              InputProps={{
                startAdornment: <Tag sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location"
              placeholder="Phoenix, AZ"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Tooltip title="Add Photo">
            <IconButton color="primary">
              <CameraAlt />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add GIF">
            <IconButton color="primary">
              <GifBox />
            </IconButton>
          </Tooltip>
          <Tooltip title="Create Poll">
            <IconButton color="primary">
              <Poll />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Emoji">
            <IconButton color="primary">
              <Mood />
            </IconButton>
          </Tooltip>
          <Tooltip title="Attach File">
            <IconButton color="primary">
              <AttachFile />
            </IconButton>
          </Tooltip>
        </Box>

        <FormControlLabel
          control={
            <Switch 
              checked={isScheduled} 
              onChange={(e) => setIsScheduled(e.target.checked)} 
            />
          }
          label="Schedule for later"
        />

        {isScheduled && (
          <TextField
            fullWidth
            type="datetime-local"
            label="Schedule Time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        )}

        {selectedPlatforms.length > 0 && content && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This post will be published to {selectedPlatforms.length} platform(s): {
              selectedPlatforms.map(id => 
                availablePlatforms.find(p => p.id === id)?.name
              ).join(', ')
            }
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<SaveDraft />}
            onClick={handleSaveDraft}
            disabled={!content.trim()}
          >
            Save Draft
          </Button>
          <Button
            variant="outlined"
            startIcon={<Preview />}
            onClick={() => setPreviewDialog(true)}
            disabled={!canPost}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            startIcon={isScheduled ? <Schedule /> : <Send />}
            onClick={handleSubmit}
            disabled={!canPost}
          >
            {isScheduled ? 'Schedule Post' : 'Post Now'}
          </Button>
        </Box>
      </CardContent>

      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Post Preview</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {content}
          </Typography>
          {hashtags && (
            <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
              {hashtags}
            </Typography>
          )}
          {location && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 16 }} />
              {location}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isScheduled ? 'Schedule Post' : 'Post Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SocialPostComposer;
