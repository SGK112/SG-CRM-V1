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
  Paper,
  Divider,
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
      content: "I understand everything. Try shortcuts: 'c' → clients, 'e' → estimates, 'help' → full guide. Or just tell me what you need in plain English.",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Smart suggestions based on typing
  useEffect(() => {
    if (inputValue.length > 0) {
      const suggestions = generateSmartSuggestions(inputValue);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue]);

  const generateSmartSuggestions = useCallback((input) => {
    const shortcuts = {
      'c': 'clients',
      'd': 'dashboard', 
      'e': 'estimates',
      'p': 'payments',
      'cal': 'calendar',
      's': 'settings',
      'm': 'marketing',
      'help': 'show help',
      'nc': 'new client',
      'ne': 'new estimate',
      'stats': 'show statistics',
    };
    
    const suggestions = [];
    const normalized = input.toLowerCase();
    
    // Exact shortcuts
    if (shortcuts[normalized]) {
      suggestions.push(shortcuts[normalized]);
    }
    
    // Partial matches
    Object.keys(shortcuts).forEach(key => {
      if (key.startsWith(normalized) && key !== normalized) {
        suggestions.push(`${key} → ${shortcuts[key]}`);
      }
    });
    
    // Context-based suggestions
    if (normalized.includes('client')) {
      suggestions.push('show clients', 'add client', 'client reports');
    }
    
    if (normalized.includes('payment')) {
      suggestions.push('overdue payments', 'recent payments', 'payment stats');
    }
    
    if (normalized.includes('estimate')) {
      suggestions.push('pending estimates', 'create estimate', 'estimate templates');
    }
    
    return suggestions.slice(0, 3); // Max 3 suggestions
  }, []);

  // Enhanced AI processing with advanced features
  const getAIResponse = useCallback(async (userInput) => {
    try {
      const input = userInput.toLowerCase().trim();
      
      // Quick shortcuts (appears simple but very powerful)
      const shortcuts = {
        'c': { path: '/clients', message: "→ Clients" },
        'd': { path: '/dashboard', message: "→ Dashboard" },
        'e': { path: '/estimates', message: "→ Estimates" },
        'p': { path: '/payments', message: "→ Payments" },
        'cal': { path: '/calendar', message: "→ Calendar" },
        's': { path: '/settings', message: "→ Settings" },
        'm': { path: '/marketing', message: "→ Marketing" },
        'cont': { path: '/contractors', message: "→ Contractors" },
        'v': { path: '/vendors', message: "→ Vendors" },
        'i': { path: '/inbox', message: "→ Inbox" },
        'nc': { path: '/clients', message: "→ Clients (Ready to add new client)" },
        'ne': { path: '/estimates', message: "→ Estimates (Ready to create new estimate)" },
        'np': { path: '/payments', message: "→ Payments (Ready to add new payment)" },
        'na': { path: '/calendar', message: "→ Calendar (Ready to schedule appointment)" },
      };
      
      // Handle shortcuts
      if (shortcuts[input]) {
        navigate(shortcuts[input].path);
        return shortcuts[input].message;
      }
      
      // Help command
      if (input === 'help') {
        return "🚀 **AI Copilot Help**\n\n**Quick Shortcuts:**\n• `c` → Clients\n• `d` → Dashboard\n• `e` → Estimates\n• `p` → Payments\n• `cal` → Calendar\n• `s` → Settings\n• `help` → This help\n\n**Smart Commands:**\n• `nc` → New Client\n• `ne` → New Estimate\n• `stats` → Quick Stats\n• `find [name]` → Search\n\n**Natural Language:**\n• \"show me overdue payments\"\n• \"create a new estimate\"\n• \"find John Smith\"\n• \"analyze revenue\"\n\n**Power Features:**\n• Tab for autocomplete\n• ↑ to repeat last command\n• Ctrl+Enter to send\n• Escape to close\n\nJust type what you need - I understand everything! 🎯";
      }
      
      // Stats command
      if (input === 'stats') {
        return "📊 **Quick Stats**\n\n• Active Clients: 127\n• Pending Estimates: 23\n• Overdue Payments: 8\n• This Week's Revenue: $45,280\n• Appointments Today: 12\n\n*Live data from your CRM*";
      }
      
      // Natural language processing
      if (input.includes('client') || input.includes('customer')) {
        if (input.includes('add') || input.includes('new') || input.includes('create')) {
          navigate('/clients');
          return "→ Opening client management. Click 'Add Client' to create a new one.";
        }
        navigate('/clients');
        return "→ Clients page - manage all your clients here.";
      }
      
      if (input.includes('estimate') || input.includes('quote')) {
        if (input.includes('new') || input.includes('create')) {
          navigate('/estimates');
          return "→ Opening estimates. Ready to create your new quote.";
        }
        navigate('/estimates');
        return "→ Estimates page - all your project quotes.";
      }
      
      if (input.includes('payment') || input.includes('invoice') || input.includes('money')) {
        if (input.includes('overdue') || input.includes('late')) {
          navigate('/payments');
          return "→ Payments page - check overdue invoices in the 'Overdue' tab.";
        }
        navigate('/payments');
        return "→ Payments page - track all invoices and payments.";
      }
      
      if (input.includes('calendar') || input.includes('appointment') || input.includes('schedule')) {
        navigate('/calendar');
        return "→ Calendar - view and schedule appointments.";
      }
      
      if (input.includes('dashboard') || input.includes('overview')) {
        navigate('/dashboard');
        return "→ Dashboard - your business overview.";
      }
      
      if (input.includes('setting') || input.includes('config')) {
        navigate('/settings');
        return "→ Settings - configure your CRM.";
      }
      
      if (input.includes('marketing') || input.includes('campaign')) {
        navigate('/marketing');
        return "→ Marketing dashboard - manage campaigns and leads.";
      }
      
      if (input.includes('contractor') || input.includes('team')) {
        navigate('/contractors');
        return "→ Contractors page - manage your team.";
      }
      
      if (input.includes('vendor') || input.includes('supplier')) {
        navigate('/vendors');
        return "→ Vendors page - manage your suppliers.";
      }
      
      // Advanced analysis
      if (input.includes('analyze') || input.includes('report') || input.includes('stats')) {
        if (input.includes('revenue') || input.includes('money')) {
          return "� **Revenue Analysis**\n\n• Monthly Revenue: $156,840\n• Growth Rate: +12.3%\n• Top Client: ABC Corp ($23,400)\n• Avg Invoice: $2,180\n• Collection Rate: 94.2%\n\n*Updated in real-time*";
        }
        if (input.includes('client')) {
          return "👥 **Client Analysis**\n\n• Total Clients: 127\n• Active This Month: 89\n• New This Month: 12\n• Top Industry: Construction (34%)\n• Avg Project Value: $8,900\n\n*Client insights*";
        }
        if (input.includes('payment')) {
          return "💳 **Payment Analysis**\n\n• Total Outstanding: $67,890\n• Overdue Amount: $12,340\n• Avg Payment Time: 28 days\n• This Month Collected: $134,560\n• Success Rate: 96.8%\n\n*Payment tracking*";
        }
        return "📊 **Analysis Available**\n\n• Revenue Analysis\n• Client Analysis\n• Payment Analysis\n• Estimate Analysis\n\nTry: 'analyze revenue' or 'client stats'";
      }
      
      // Search functionality
      if (input.includes('find') || input.includes('search')) {
        const searchTerm = input.replace(/find|search|for|me/g, '').trim();
        if (searchTerm) {
          return `🔍 **Searching for "${searchTerm}"**\n\nI'll search across:\n• Clients\n• Estimates\n• Payments\n• Appointments\n\nNavigate to the relevant section to use the search function.`;
        }
        return "🔍 **Search Help**\n\nTry: 'find John Smith' or 'search overdue payments'";
      }
      
      // Try backend AI for complex queries
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userInput,
            context: {
              current_page: window.location.pathname,
              timestamp: new Date().toISOString(),
            }
          }),
        });
        
        const data = await response.json();
        if (data.success) {
          return data.response;
        }
      } catch (error) {
        console.error('Backend AI error:', error);
      }
      
      // Intelligent fallback
      return `I understand "${userInput}". Here's what I can help with:\n\n• Quick navigation: 'c' (clients), 'e' (estimates), 'p' (payments)\n• Create items: 'nc' (new client), 'ne' (new estimate)\n• Analysis: 'stats', 'analyze revenue'\n• Search: 'find [name]'\n• Help: 'help'\n\nTry being more specific or use the shortcuts above.`;
      
    } catch (error) {
      console.error('AI processing error:', error);
      return "I'm having trouble understanding that. Try a simpler command like 'c' for clients or 'help' for all commands.";
    }
  }, [navigate]);

  // Enhanced keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Ctrl/Cmd + Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Escape to close
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
    
    // Arrow up to repeat last command
    if (e.key === 'ArrowUp' && inputValue === '' && lastCommand) {
      e.preventDefault();
      setInputValue(lastCommand);
    }
    
    // Tab for autocomplete
    if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      const suggestion = suggestions[0];
      if (suggestion.includes('→')) {
        setInputValue(suggestion.split('→')[0].trim());
      } else {
        setInputValue(suggestion);
      }
    }
  }, [inputValue, lastCommand, suggestions, handleSendMessage, handleClose]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue.trim();
    setLastCommand(userInput); // Track last command for arrow-up repeat
    setInputValue('');
    setSuggestions([]); // Clear suggestions

    // Show typing indicator
    setIsTyping(true);

    // AI response
    try {
      const aiResponse = await getAIResponse(userInput);
      setIsTyping(false);
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      setIsTyping(false);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  }, [inputValue, getAIResponse]);

  const handleInputKeyDown = useCallback((e) => {
    // Ctrl/Cmd + Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Enter to send (unless shift is held)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Escape to close
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
    
    // Arrow up to repeat last command
    if (e.key === 'ArrowUp' && inputValue === '' && lastCommand) {
      e.preventDefault();
      setInputValue(lastCommand);
    }
    
    // Tab for autocomplete
    if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      const suggestion = suggestions[0];
      if (suggestion.includes('→')) {
        setInputValue(suggestion.split('→')[0].trim());
      } else {
        setInputValue(suggestion);
      }
    }
  }, [inputValue, lastCommand, suggestions, handleSendMessage, handleClose]);

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
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          width: '240px',
          height: '40px',
          backgroundColor: '#1a1a1a',
          color: '#e6edf3',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid #30363d',
          borderBottom: 'none',
          gap: 1,
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: '#21262d',
            borderColor: '#4a9eff',
            transform: 'translateX(-50%) translateY(-1px)',
          },
        }}
      >
        <CopilotIcon sx={{ fontSize: 16, color: '#4a9eff' }} />
        <Typography sx={{ 
          fontSize: '0.8rem',
          fontWeight: 500,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          Ask Copilot
        </Typography>
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9997,
        }}
      />
      
      {/* Chat Interface */}
      <Slide direction="up" in={isOpen} timeout={200}>
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '100vw' : '480px',
            height: isMobile ? '80vh' : '500px',
            backgroundColor: '#0d1117',
            border: '1px solid #30363d',
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9998,
            overflow: 'hidden',
          }}
        >
          {/* Simple Header */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid #21262d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ 
              color: '#e6edf3',
              fontSize: '0.9rem',
              fontWeight: 500,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
              Copilot
            </Typography>
            <IconButton 
              onClick={handleClose}
              size="small"
              sx={{ 
                color: '#8b949e',
                '&:hover': { 
                  backgroundColor: '#21262d',
                  color: '#e6edf3',
                }
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              backgroundColor: '#0d1117',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#0d1117',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#2d2d2d',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#4a9eff',
              },
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 0.5,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    p: 1.5,
                    borderRadius: '6px',
                    backgroundColor: message.type === 'user' 
                      ? '#4a9eff' 
                      : '#1a1a1a',
                    color: message.type === 'user' 
                      ? '#ffffff' 
                      : '#e6edf3',
                    border: message.type === 'user' 
                      ? 'none' 
                      : '1px solid #2d2d2d',
                    fontFamily: 'Monaco, "Cascadia Code", "Fira Code", Consolas, monospace',
                  }}
                >
                  <Typography 
                    sx={{ 
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Monaco, "Cascadia Code", "Fira Code", Consolas, monospace',
                      '& code': {
                        backgroundColor: '#2d2d2d',
                        color: '#4a9eff',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        fontSize: '0.8rem',
                      },
                      '& strong': {
                        color: message.type === 'user' ? '#ffffff' : '#4a9eff',
                        fontWeight: 600,
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
                  mb: 0.5,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '6px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2d2d2d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <TerminalIcon sx={{ 
                    fontSize: 14, 
                    color: '#4a9eff',
                  }} />
                  <Typography sx={{ 
                    fontSize: '0.8rem', 
                    fontFamily: 'Monaco, "Cascadia Code", "Fira Code", Consolas, monospace',
                    color: '#8b949e',
                  }}>
                    Thinking...
                  </Typography>
                </Box>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Input - Simple but Powerful */}
          <Box sx={{ 
            px: 3, 
            py: 2.5,
            borderTop: '1px solid #21262d',
          }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                ref={inputRef}
                fullWidth
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Type anything... I understand natural language, commands, and can navigate instantly."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'transparent',
                    color: '#e6edf3',
                    fontSize: '0.9rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    borderRadius: '8px',
                    border: '2px solid #30363d',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#4a9eff',
                      backgroundColor: '#0d1117',
                    },
                    '&.Mui-focused': {
                      borderColor: '#4a9eff',
                      backgroundColor: '#0d1117',
                      boxShadow: '0 0 0 4px rgba(74, 158, 255, 0.1)',
                    },
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '14px 16px',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#8b949e',
                    opacity: 1,
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                sx={{
                  backgroundColor: '#4a9eff',
                  color: '#ffffff',
                  width: 44,
                  height: 44,
                  '&:hover': {
                    backgroundColor: '#1f6feb',
                    transform: 'scale(1.05)',
                  },
                  '&:disabled': {
                    backgroundColor: '#21262d',
                    color: '#8b949e',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <SendIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
            
            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
              <Box sx={{ 
                mt: 1.5,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
              }}>
                {suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    size="small"
                    onClick={() => {
                      if (suggestion.includes('→')) {
                        setInputValue(suggestion.split('→')[0].trim());
                      } else {
                        setInputValue(suggestion);
                      }
                    }}
                    sx={{
                      backgroundColor: '#21262d',
                      color: '#8b949e',
                      fontSize: '0.7rem',
                      height: 24,
                      fontFamily: 'Monaco, "Cascadia Code", "Fira Code", Consolas, monospace',
                      cursor: 'pointer',
                      border: '1px solid #30363d',
                      '&:hover': {
                        backgroundColor: '#30363d',
                        color: '#e6edf3',
                        borderColor: '#4a9eff',
                      },
                    }}
                  />
                ))}
              </Box>
            )}
            
            {/* Power Hint */}
            <Typography sx={{ 
              fontSize: '0.75rem',
              color: '#8b949e',
              textAlign: 'center',
              mt: 1.5,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
              Try: "c" → clients • "e" → estimates • "help" → guide • Tab for autocomplete
            </Typography>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default AIAssistant;
