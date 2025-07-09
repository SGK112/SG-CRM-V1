import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Slide,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  AutoAwesome as CopilotIcon,
  Close as CloseIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AIAssistant = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "GitHub Copilot for CRM\n\nI can help you navigate and control your CRM. Try commands like:\n\n• `/clients` - Open clients page\n• `/estimates` - Create new estimate\n• `/calendar` - View calendar\n• `/payments` - Check payments\n\nWhat would you like to do?",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 200);
    }
  }, [isOpen]);

  const executeCommand = useCallback((command) => {
    const cmd = command.toLowerCase().trim();
    
    // Navigation commands
    if (cmd === '/clients' || cmd === 'clients') {
      navigate('/clients');
      return "✓ Opened Clients page";
    }
    
    if (cmd === '/calendar' || cmd === 'calendar') {
      navigate('/calendar');
      return "✓ Opened Calendar";
    }
    
    if (cmd === '/estimates' || cmd === 'estimates' || cmd === '/new-estimate') {
      navigate('/estimates');
      return "✓ Opened Estimates page";
    }
    
    if (cmd === '/payments' || cmd === 'payments') {
      navigate('/payments');
      return "✓ Opened Payments page";
    }
    
    if (cmd === '/dashboard' || cmd === 'dashboard' || cmd === '/home') {
      navigate('/dashboard');
      return "✓ Opened Dashboard";
    }
    
    if (cmd === '/settings' || cmd === 'settings') {
      navigate('/settings');
      return "✓ Opened Settings";
    }
    
    if (cmd === '/marketing' || cmd === 'marketing') {
      navigate('/marketing');
      return "✓ Opened Marketing Dashboard";
    }
    
    if (cmd === '/contractors' || cmd === 'contractors') {
      navigate('/contractors');
      return "✓ Opened Contractors page";
    }
    
    if (cmd === '/vendors' || cmd === 'vendors') {
      navigate('/vendors');
      return "✓ Opened Vendors page";
    }
    
    if (cmd === '/inbox' || cmd === 'inbox') {
      navigate('/inbox');
      return "✓ Opened Inbox";
    }
    
    return null;
  }, [navigate]);

  const getAIResponse = useCallback((userInput) => {
    const input = userInput.toLowerCase().trim();
    
    // Try to execute as command first
    const commandResult = executeCommand(input);
    if (commandResult) {
      return commandResult;
    }
    
    // Help commands
    if (input === '/help' || input === 'help' || input.includes('command')) {
      return "**Available Commands:**\n\n`/clients` - Manage clients\n`/calendar` - View schedule\n`/estimates` - Create estimates\n`/payments` - Track payments\n`/dashboard` - Main dashboard\n`/marketing` - Marketing tools\n`/settings` - App settings\n`/inbox` - Messages\n\nType any command to navigate instantly.";
    }
    
    // Quick responses for common queries
    if (input.includes('client') && !input.startsWith('/')) {
      return "Use `/clients` to open the clients page where you can add, edit, and manage all your clients.";
    }
    
    if (input.includes('estimate') && !input.startsWith('/')) {
      return "Use `/estimates` to create new estimates or manage existing ones.";
    }
    
    if (input.includes('schedule') || input.includes('appointment')) {
      return "Use `/calendar` to view and manage your schedule and appointments.";
    }
    
    if (input.includes('payment') || input.includes('invoice')) {
      return "Use `/payments` to track payments, create invoices, and manage billing.";
    }
    
    if (input.includes('marketing') || input.includes('campaign')) {
      return "Use `/marketing` to access marketing tools, campaigns, and analytics.";
    }
    
    // Default response
    return "I can help you navigate your CRM. Try commands like `/clients`, `/calendar`, or `/estimates`. Type `/help` for all commands.";
  }, [executeCommand]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue.trim();
    setInputValue('');

    // Show typing indicator
    setIsTyping(true);

    // AI response
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getAIResponse(userInput),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 600);
  }, [inputValue, getAIResponse]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen) {
    return (
      <Box
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 20 : 0,
          right: isMobile ? 20 : 40,
          zIndex: 9999,
          width: isMobile ? '60px' : '50px',
          height: isMobile ? '60px' : '40px',
          backgroundColor: '#0f0f0f',
          color: '#ffffff',
          borderRadius: isMobile ? '50%' : '6px 6px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid #333',
          borderBottom: isMobile ? '1px solid #333' : 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#1a1a1a',
            borderColor: '#555',
          },
        }}
      >
        <CopilotIcon sx={{ fontSize: isMobile ? 24 : 20 }} />
      </Box>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={handleBackdropClick}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9997,
        }}
      />
      
      {/* Chat popup */}
      <Slide direction="up" in={isOpen} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            right: isMobile ? 0 : 40,
            width: isMobile ? '100%' : '420px',
            height: isMobile ? '85vh' : '500px',
            backgroundColor: '#0f0f0f',
            borderRadius: isMobile ? '12px 12px 0 0' : '8px 8px 0 0',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.6)',
            zIndex: 9998,
            border: '1px solid #333',
            borderBottom: 'none',
            fontFamily: 'Monaco, "Cascadia Code", "Fira Code", Consolas, monospace',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1a1a1a',
              borderRadius: isMobile ? '12px 12px 0 0' : '8px 8px 0 0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ 
                width: 28, 
                height: 28, 
                backgroundColor: '#333',
                border: '1px solid #555'
              }}>
                <CopilotIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ 
                  color: '#ffffff', 
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  fontFamily: 'inherit'
                }}>
                  GitHub Copilot
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: '#888', 
                  fontSize: '0.7rem',
                  fontFamily: 'inherit'
                }}>
                  CRM Assistant
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={handleClose} 
              sx={{ 
                color: '#888',
                width: 32,
                height: 32,
                '&:hover': { color: '#fff', backgroundColor: '#333' }
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              backgroundColor: '#0f0f0f',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#1a1a1a',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#333',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              },
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '85%',
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: message.type === 'user' ? '#2a2a2a' : '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #333',
                    fontFamily: 'inherit',
                    fontSize: '0.85rem',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      '& code': {
                        backgroundColor: '#333',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        fontSize: '0.8rem',
                      }
                    }}
                  >
                    {message.content}
                  </Typography>
                </Box>
              </Box>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: '#1a1a1a',
                    color: '#888',
                    border: '1px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <TerminalIcon sx={{ fontSize: 14 }} />
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontFamily: 'inherit' }}>
                    Thinking...
                  </Typography>
                </Box>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ 
            p: 2, 
            borderTop: '1px solid #333',
            backgroundColor: '#1a1a1a',
          }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                ref={inputRef}
                fullWidth
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or question..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0f0f0f',
                    color: '#ffffff',
                    fontFamily: 'Monaco, "Cascadia Code", "Fira Code", Consolas, monospace',
                    fontSize: '0.85rem',
                    '& fieldset': {
                      borderColor: '#333',
                    },
                    '&:hover fieldset': {
                      borderColor: '#555',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#777',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '12px 16px',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#666',
                    opacity: 1,
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                sx={{
                  backgroundColor: '#333',
                  color: '#ffffff',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: '#555',
                  },
                  '&:disabled': {
                    backgroundColor: '#222',
                    color: '#666',
                  },
                }}
              >
                <SendIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            
            {/* Command suggestions */}
            <Box sx={{ 
              mt: 1.5,
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}>
              {['/clients', '/calendar', '/estimates', '/payments'].map((cmd) => (
                <Chip
                  key={cmd}
                  label={cmd}
                  size="small"
                  onClick={() => setInputValue(cmd)}
                  sx={{
                    backgroundColor: '#333',
                    color: '#ccc',
                    fontSize: '0.75rem',
                    height: '24px',
                    fontFamily: 'inherit',
                    '&:hover': {
                      backgroundColor: '#555',
                      color: '#fff',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Slide>
    </>
  );
};

export default AIAssistant;
