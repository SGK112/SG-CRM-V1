import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Fade,
  Slide,
  Divider,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Support as SupportIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  OpenInFull as ExpandIcon,
  Lightbulb as TipIcon,
  BugReport as BugIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Psychology as AIIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from '@mui/icons-material';

const CRMCopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your CRM Assistant. I can help you with estimates, client management, scheduling, and much more. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        'How to create an estimate',
        'Managing client communications',
        'Setting up recurring payments',
        'Scheduling appointments'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { icon: <TipIcon />, label: 'Quick Tips', color: '#2196f3' },
    { icon: <BugIcon />, label: 'Report Issue', color: '#f44336' },
    { icon: <HelpIcon />, label: 'Help Center', color: '#4caf50' },
    { icon: <SettingsIcon />, label: 'Settings', color: '#ff9800' },
  ];

  const crmKnowledge = {
    'estimate': {
      title: 'Creating Estimates',
      content: `Here's how to create professional estimates:

1. **Navigate to Estimates** - Click "Estimates" in the sidebar
2. **Choose Template** - Select from granite, marble, or custom templates
3. **Add Line Items** - Include materials, labor, and additional services
4. **Set Pricing** - Use our built-in calculator for accurate square footage
5. **Preview & Send** - Review and send directly to clients

💡 **Pro Tip**: Use the estimate builder for complex multi-room projects!`,
      actions: ['Create New Estimate', 'View Templates', 'Pricing Guide']
    },
    'client': {
      title: 'Client Management',
      content: `Manage your clients effectively:

1. **Add Clients** - Store contact info, preferences, and project history
2. **Communication Hub** - Track all emails, calls, and messages in one place
3. **Project Timeline** - See all past and upcoming projects
4. **Payment History** - View invoices, payments, and outstanding balances
5. **Notes & Files** - Keep important documents and notes organized

📋 **Best Practice**: Always log client communications for better follow-up!`,
      actions: ['Add New Client', 'Import Contacts', 'Communication Log']
    },
    'payment': {
      title: 'Payment Processing',
      content: `Handle payments seamlessly:

1. **Stripe Integration** - Accept credit cards, ACH, and digital wallets
2. **Recurring Billing** - Set up automatic payments for ongoing projects
3. **Payment Tracking** - Monitor all transactions and outstanding invoices
4. **Customer Portal** - Clients can view and pay invoices online
5. **Reports** - Generate financial reports and tax documents

💳 **Feature**: Clients receive automatic payment reminders!`,
      actions: ['Process Payment', 'Setup Recurring', 'View Reports']
    },
    'schedule': {
      title: 'Scheduling & Calendar',
      content: `Organize your schedule efficiently:

1. **Appointment Booking** - Schedule consultations, measurements, and installations
2. **Team Coordination** - Assign contractors and track availability
3. **Client Reminders** - Automatic email and SMS reminders
4. **Resource Planning** - Track equipment and material needs
5. **Timeline Management** - Visualize project phases and deadlines

📅 **Tip**: Use color coding to distinguish between consultation, measurement, and installation appointments!`,
      actions: ['Schedule Appointment', 'View Calendar', 'Team Availability']
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    let response = {
      id: Date.now() + 1,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      actions: []
    };

    // Check for keywords and provide relevant responses
    if (input.includes('estimate') || input.includes('quote')) {
      response = { ...response, ...crmKnowledge.estimate };
    } else if (input.includes('client') || input.includes('customer')) {
      response = { ...response, ...crmKnowledge.client };
    } else if (input.includes('payment') || input.includes('invoice') || input.includes('billing')) {
      response = { ...response, ...crmKnowledge.payment };
    } else if (input.includes('schedule') || input.includes('appointment') || input.includes('calendar')) {
      response = { ...response, ...crmKnowledge.schedule };
    } else if (input.includes('help') || input.includes('how')) {
      response.content = `I'd be happy to help! Here are some things I can assist with:

🏗️ **Project Management**: Creating estimates, tracking progress, managing timelines
👥 **Client Relations**: Communication tracking, follow-ups, client portals
💰 **Financial**: Payment processing, invoicing, financial reports
📅 **Scheduling**: Appointments, team coordination, reminders
📊 **Analytics**: Business insights, performance metrics, growth tracking

What specific area would you like to explore?`;
      response.suggestions = ['Show me estimates', 'Client management tips', 'Payment setup', 'Schedule demo'];
    } else {
      // General response
      response.content = `I understand you're asking about "${userInput}". Let me provide some guidance:

As your CRM assistant, I can help you with:
• **Estimates & Quotes** - Create professional proposals
• **Client Management** - Track relationships and communications  
• **Project Scheduling** - Organize timelines and appointments
• **Payment Processing** - Handle invoicing and collections
• **Business Analytics** - Monitor performance and growth

Could you be more specific about what you'd like help with?`;
      response.suggestions = ['Create estimate', 'Manage clients', 'Process payments', 'View reports'];
    }

    return response;
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const CopilotFab = () => (
    <Tooltip title="CRM Assistant" placement="left">
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
        }}
      >
        <Badge
          badgeContent={messages.filter(m => m.type === 'bot' && !m.read).length}
          color="error"
          max={9}
        >
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={{
              width: 60,
              height: 60,
              backgroundColor: '#8B4513',
              color: 'white',
              boxShadow: '0 4px 20px rgba(139, 69, 19, 0.3)',
              '&:hover': {
                backgroundColor: '#D4A574',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <AIIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Badge>
      </Box>
    </Tooltip>
  );

  const CopilotWindow = () => (
    <Fade in={isOpen}>
      <Paper
        sx={{
          position: 'fixed',
          bottom: isMinimized ? -400 : 100,
          right: 24,
          width: { xs: 'calc(100vw - 48px)', sm: 400 },
          height: { xs: 'calc(100vh - 148px)', sm: 500 },
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: '#8B4513',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, backgroundColor: '#D4A574' }}>
              <AIIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                CRM Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Online • Ready to help
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton
              size="small"
              onClick={() => setIsMinimized(!isMinimized)}
              sx={{ color: 'white', mr: 1 }}
            >
              {isMinimized ? <ExpandIcon /> : <MinimizeIcon />}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {!isMinimized && (
          <>
            {/* Quick Actions */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Grid container spacing={1}>
                {quickActions.map((action, index) => (
                  <Grid item xs={3} key={index}>
                    <Tooltip title={action.label}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          textAlign: 'center',
                          p: 1,
                          '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                      >
                        <Box sx={{ color: action.color, mb: 0.5 }}>
                          {action.icon}
                        </Box>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                          {action.label.split(' ')[0]}
                        </Typography>
                      </Card>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              <List sx={{ p: 0 }}>
                {messages.map((message) => (
                  <ListItem
                    key={message.id}
                    sx={{
                      flexDirection: 'column',
                      alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                      p: 1,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '85%',
                        backgroundColor: message.type === 'user' ? '#8B4513' : '#f5f5f5',
                        color: message.type === 'user' ? 'white' : 'text.primary',
                        borderRadius: 2,
                        p: 2,
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                      
                      {message.suggestions && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {message.suggestions.map((suggestion, index) => (
                            <Chip
                              key={index}
                              label={suggestion}
                              size="small"
                              onClick={() => handleSuggestionClick(suggestion)}
                              sx={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: message.type === 'user' ? 'white' : '#8B4513',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      {message.actions && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {message.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: message.type === 'user' ? 'white' : '#8B4513',
                                color: message.type === 'user' ? 'white' : '#8B4513',
                                '&:hover': {
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                },
                              }}
                            >
                              {action}
                            </Button>
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </ListItem>
                ))}
                {isTyping && (
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 1 }}>
                    <Box
                      sx={{
                        backgroundColor: '#f5f5f5',
                        borderRadius: 2,
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CircularProgress size={16} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Assistant is typing...
                      </Typography>
                    </Box>
                  </ListItem>
                )}
                <div ref={messagesEndRef} />
              </List>
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Ask me anything about your CRM..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#8B4513' },
                      '&.Mui-focused fieldset': { borderColor: '#8B4513' },
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  sx={{
                    backgroundColor: '#8B4513',
                    color: 'white',
                    '&:hover': { backgroundColor: '#D4A574' },
                    '&:disabled': { backgroundColor: '#e0e0e0' },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Fade>
  );

  return (
    <>
      {!isOpen && <CopilotFab />}
      {isOpen && <CopilotWindow />}
    </>
  );
};

export default CRMCopilot;
