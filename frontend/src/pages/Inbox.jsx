import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  Badge,
  Button,
  Menu,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Phone as PhoneIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Add as AddIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  Mark as MarkIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

// Mock data for inbox messages
const mockMessages = [
  {
    id: 1,
    contact: { name: 'Sarah Johnson', avatar: 'SJ', type: 'client' },
    channel: 'email',
    subject: 'Kitchen Countertop Quote Request',
    preview: 'Hi, I would like to get a quote for granite countertops for my kitchen renovation...',
    timestamp: '2 min ago',
    unread: true,
    starred: false,
    priority: 'high',
    attachments: 2,
    tags: ['quote-request', 'kitchen']
  },
  {
    id: 2,
    contact: { name: 'Mike Davis', avatar: 'MD', type: 'prospect' },
    channel: 'sms',
    subject: 'Re: Bathroom vanity tops',
    preview: 'Thanks for the samples! The Carrara marble looks perfect. When can we schedule installation?',
    timestamp: '15 min ago',
    unread: true,
    starred: true,
    priority: 'medium',
    attachments: 0,
    tags: ['installation', 'marble']
  },
  {
    id: 3,
    contact: { name: 'Jennifer Smith', avatar: 'JS', type: 'client' },
    channel: 'whatsapp',
    subject: 'Commercial project update',
    preview: 'The office lobby granite installation looks amazing! Can you send the final invoice?',
    timestamp: '1 hr ago',
    unread: false,
    starred: false,
    priority: 'low',
    attachments: 5,
    tags: ['commercial', 'invoice']
  },
  {
    id: 4,
    contact: { name: 'Robert Wilson', avatar: 'RW', type: 'vendor' },
    channel: 'email',
    subject: 'New granite slab arrivals',
    preview: 'We have new Calacatta Gold and Black Galaxy slabs available. Updated price list attached.',
    timestamp: '3 hr ago',
    unread: false,
    starred: true,
    priority: 'medium',
    attachments: 1,
    tags: ['vendor', 'price-list']
  },
  {
    id: 5,
    contact: { name: 'Lisa Chen', avatar: 'LC', type: 'client' },
    channel: 'phone',
    subject: 'Missed call: Kitchen island quote',
    preview: 'Customer called regarding kitchen island granite options. Left voicemail.',
    timestamp: '5 hr ago',
    unread: true,
    starred: false,
    priority: 'high',
    attachments: 0,
    tags: ['missed-call', 'kitchen-island']
  },
  {
    id: 6,
    contact: { name: 'David Rodriguez', avatar: 'DR', type: 'client' },
    channel: 'facebook',
    subject: 'Outdoor kitchen project',
    preview: 'Saw your work on Instagram! Interested in granite for outdoor kitchen. Can we discuss?',
    timestamp: '1 day ago',
    unread: false,
    starred: false,
    priority: 'medium',
    attachments: 0,
    tags: ['outdoor', 'social-media']
  }
];

const Inbox = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [composeOpen, setComposeOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Filter messages based on current tab and filters
  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      tabValue === 0 || // All
      (tabValue === 1 && message.unread) || // Unread
      (tabValue === 2 && message.starred) || // Starred
      (tabValue === 3 && message.channel === 'email') || // Email
      (tabValue === 4 && message.channel === 'sms') || // SMS
      (tabValue === 5 && ['whatsapp', 'facebook', 'instagram'].includes(message.channel)); // Social

    return matchesSearch && matchesTab;
  });

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return <EmailIcon sx={{ color: '#4285f4' }} />;
      case 'sms': return <SmsIcon sx={{ color: '#34a853' }} />;
      case 'phone': return <PhoneIcon sx={{ color: '#fbbc05' }} />;
      case 'whatsapp': return <WhatsAppIcon sx={{ color: '#25d366' }} />;
      case 'facebook': return <FacebookIcon sx={{ color: '#1877f2' }} />;
      case 'instagram': return <InstagramIcon sx={{ color: '#e4405f' }} />;
      default: return <EmailIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getContactTypeIcon = (type) => {
    switch (type) {
      case 'client': return <PersonIcon sx={{ color: '#8B4513' }} />;
      case 'prospect': return <PersonIcon sx={{ color: '#2196f3' }} />;
      case 'vendor': return <BusinessIcon sx={{ color: '#9c27b0' }} />;
      default: return <PersonIcon />;
    }
  };

  const unreadCount = mockMessages.filter(m => m.unread).length;
  const starredCount = mockMessages.filter(m => m.starred).length;

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f5f7fa'
    }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700,
              color: '#8B4513'
            }}>
              Inbox
            </Typography>
            <Chip 
              label={`${unreadCount} unread`}
              size="small"
              sx={{ 
                backgroundColor: unreadCount > 0 ? '#f44336' : '#e0e0e0',
                color: unreadCount > 0 ? 'white' : '#757575',
                fontWeight: 600
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton sx={{ color: '#8B4513' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mark all as read">
              <IconButton sx={{ color: '#8B4513' }}>
                <MarkIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setComposeOpen(true)}
              sx={{
                backgroundColor: '#8B4513',
                '&:hover': { backgroundColor: '#D4A574' },
                textTransform: 'none',
                borderRadius: 2,
                px: 3
              }}
            >
              Compose
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Message List */}
        <Paper sx={{ 
          width: 400, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 0,
          borderRight: '1px solid #e0e0e0'
        }}>
          {/* Search and Filters */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <TextField
              fullWidth
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#8B4513' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small">
                      <FilterIcon sx={{ color: '#8B4513' }} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#f8f9fa',
                  '&:hover fieldset': { borderColor: '#8B4513' },
                  '&.Mui-focused fieldset': { borderColor: '#8B4513' }
                }
              }}
            />
          </Box>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': {
                textTransform: 'none',
                minWidth: 80,
                fontSize: '0.875rem'
              },
              '& .Mui-selected': {
                color: '#8B4513'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#8B4513'
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  All
                  <Chip label={mockMessages.length} size="small" />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Unread
                  {unreadCount > 0 && <Badge badgeContent={unreadCount} color="error" />}
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Starred
                  {starredCount > 0 && <Chip label={starredCount} size="small" />}
                </Box>
              } 
            />
            <Tab label="Email" />
            <Tab label="SMS" />
            <Tab label="Social" />
          </Tabs>

          {/* Message List */}
          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {filteredMessages.map((message) => (
              <ListItem
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                sx={{
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: selectedMessage?.id === message.id ? '#f8f9fa' : 'transparent',
                  '&:hover': { backgroundColor: '#f8f9fa' },
                  py: 2,
                  px: 2,
                  position: 'relative'
                }}
              >
                {/* Priority indicator */}
                <Box sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  backgroundColor: getPriorityColor(message.priority)
                }} />

                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={getChannelIcon(message.channel)}
                  >
                    <Avatar sx={{ 
                      backgroundColor: message.unread ? '#8B4513' : '#e0e0e0',
                      color: message.unread ? 'white' : '#757575',
                      fontWeight: 600
                    }}>
                      {message.contact.avatar}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: message.unread ? 700 : 500,
                          color: message.unread ? '#2c3e50' : '#666'
                        }}
                      >
                        {message.contact.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getContactTypeIcon(message.contact.type)}
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {message.timestamp}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: message.unread ? 600 : 400,
                          color: message.unread ? '#2c3e50' : '#666',
                          mb: 1
                        }}
                      >
                        {message.subject}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#999',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mb: 1
                        }}
                      >
                        {message.preview}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={0.5}>
                          {message.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.7rem',
                                backgroundColor: '#f0f0f0',
                                color: '#666'
                              }}
                            />
                          ))}
                        </Stack>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {message.attachments > 0 && (
                            <Chip
                              icon={<AttachFileIcon />}
                              label={message.attachments}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                          <IconButton size="small" sx={{ opacity: 0.7 }}>
                            {message.starred ? 
                              <StarIcon sx={{ color: '#ffc107', fontSize: 18 }} /> : 
                              <StarBorderIcon sx={{ fontSize: 18 }} />
                            }
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Right Content - Message Detail */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <Paper sx={{ 
                p: 3, 
                borderRadius: 0,
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: 'white'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={getChannelIcon(selectedMessage.channel)}
                    >
                      <Avatar sx={{ 
                        width: 48, 
                        height: 48,
                        backgroundColor: '#8B4513',
                        fontSize: '1.2rem',
                        fontWeight: 700
                      }}>
                        {selectedMessage.contact.avatar}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                        {selectedMessage.contact.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getContactTypeIcon(selectedMessage.contact.type)}
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {selectedMessage.contact.type} • {selectedMessage.timestamp}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Reply">
                      <IconButton sx={{ color: '#8B4513' }}>
                        <ReplyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Forward">
                      <IconButton sx={{ color: '#8B4513' }}>
                        <ForwardIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Archive">
                      <IconButton sx={{ color: '#8B4513' }}>
                        <ArchiveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton sx={{ color: '#f44336' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="h6" sx={{ mb: 1, color: '#2c3e50' }}>
                  {selectedMessage.subject}
                </Typography>
                
                <Stack direction="row" spacing={1}>
                  {selectedMessage.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        backgroundColor: '#f0f0f0',
                        color: '#666'
                      }}
                    />
                  ))}
                </Stack>
              </Paper>

              {/* Message Content */}
              <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
                <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#2c3e50' }}>
                    {selectedMessage.preview}
                  </Typography>
                  
                  {selectedMessage.attachments > 0 && (
                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
                        Attachments ({selectedMessage.attachments})
                      </Typography>
                      <Grid container spacing={2}>
                        {Array.from({ length: selectedMessage.attachments }, (_, i) => (
                          <Grid item xs={12} sm={6} md={4} key={i}>
                            <Card sx={{ 
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#f0f0f0' }
                            }}>
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <AttachFileIcon sx={{ color: '#8B4513' }} />
                                  <Typography variant="body2">
                                    Document_{i + 1}.pdf
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* Reply Box */}
              <Paper sx={{ 
                p: 3, 
                borderRadius: 0,
                borderTop: '1px solid #e0e0e0',
                backgroundColor: 'white'
              }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Type your reply..."
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small">
                      <AttachFileIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EmojiIcon />
                    </IconButton>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    sx={{
                      backgroundColor: '#8B4513',
                      '&:hover': { backgroundColor: '#D4A574' },
                      textTransform: 'none'
                    }}
                  >
                    Send Reply
                  </Button>
                </Box>
              </Paper>
            </>
          ) : (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}>
              <EmailIcon sx={{ fontSize: 80, color: '#e0e0e0' }} />
              <Typography variant="h6" sx={{ color: '#999' }}>
                Select a message to view
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                Choose a conversation from the inbox to read and reply
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Compose Dialog */}
      <Dialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#8B4513',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            New Message
          </Typography>
          <IconButton onClick={() => setComposeOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="To"
                placeholder="Select contact or enter email/phone"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message"
                placeholder="Type your message..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
          <Button onClick={() => setComposeOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#D4A574' }
            }}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="compose"
        onClick={() => setComposeOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#8B4513',
          '&:hover': {
            backgroundColor: '#D4A574',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Inbox;
