import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Chip,
  Fade,
  Slide,
} from '@mui/material';
import {
  Send as SendIcon,
  AutoAwesome as CopilotIcon,
  Close as CloseIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AIAssistant = () => {
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "I understand everything. Try shortcuts: 'c' → clients, 'e' → estimates, 'help' → full guide.",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
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

  const generateSuggestions = useCallback((input) => {
    const shortcuts = {
      'c': 'clients',
      'd': 'dashboard', 
      'e': 'estimates',
      'p': 'payments',
      'help': 'show help',
    };
    
    const suggestions = [];
    const normalized = input.toLowerCase();
    
    Object.keys(shortcuts).forEach(key => {
      if (key.startsWith(normalized) && key !== normalized) {
        suggestions.push(`${key} → ${shortcuts[key]}`);
      }
    });
    
    return suggestions.slice(0, 3);
  }, []);

  useEffect(() => {
    if (inputValue.length > 0) {
      const suggestions = generateSuggestions(inputValue);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, generateSuggestions]);

  const getAIResponse = useCallback(async (userInput) => {
    try {
      const input = userInput.toLowerCase().trim();
      
      // Quick shortcuts
      const shortcuts = {
        'c': { path: '/clients', message: "→ Clients" },
        'd': { path: '/dashboard', message: "→ Dashboard" },
        'e': { path: '/estimates', message: "→ Estimates" },
        'p': { path: '/payments', message: "→ Payments" },
        'cal': { path: '/calendar', message: "→ Calendar" },
        's': { path: '/settings', message: "→ Settings" },
      };
      
      if (shortcuts[input]) {
        navigate(shortcuts[input].path);
        return shortcuts[input].message;
      }
      
      if (input === 'help') {
        return "🚀 **AI Copilot Help**\n\n**Quick Shortcuts:**\n• `c` → Clients\n• `d` → Dashboard\n• `e` → Estimates\n• `p` → Payments\n• `s` → Settings\n• `help` → This help\n\nJust type what you need!";
      }
      
      // Natural language
      if (input.includes('client')) {
        navigate('/clients');
        return "→ Clients page";
      }
      
      if (input.includes('estimate')) {
        navigate('/estimates');
        return "→ Estimates page";
      }
      
      if (input.includes('payment')) {
        navigate('/payments');
        return "→ Payments page";
      }
      
      return `I understand "${userInput}". Try shortcuts like 'c' for clients, 'e' for estimates, or 'help' for all commands.`;
      
    } catch (error) {
      console.error('AI processing error:', error);
      return "Try simple commands like 'c' for clients or 'help' for all commands.";
    }
  }, [navigate]);

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
    setInputValue('');
    setSuggestions([]);

    setIsTyping(true);

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
        content: "I'm having trouble. Try 'help' for commands.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  }, [inputValue, getAIResponse]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [handleSendMessage]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => setInputValue(e.target.value);

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
      {/* Chat Interface */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: '95%', sm: '480px' },
            maxWidth: '480px',
            height: '500px',
            backgroundColor: '#0d1117',
            color: '#e6edf3',
            borderRadius: '12px 12px 0 0',
            border: '1px solid #30363d',
            borderBottom: 'none',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid #21262d',
            backgroundColor: '#161b22',
            borderRadius: '12px 12px 0 0',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CopilotIcon sx={{ fontSize: 20, color: '#4a9eff' }} />
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                AI Copilot
              </Typography>
            </Box>
            <IconButton
              onClick={handleToggle}
              sx={{ 
                color: '#8b949e', 
                '&:hover': { color: '#e6edf3', backgroundColor: '#21262d' } 
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}>
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
                    maxWidth: '80%',
                    p: 1.5,
                    borderRadius: '6px',
                    backgroundColor: message.type === 'user' ? '#21262d' : '#1a1a1a',
                    border: '1px solid #30363d',
                  }}
                >
                  <Typography 
                    sx={{ 
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Monaco, monospace',
                    }}
                  >
                    {message.content}
                  </Typography>
                </Box>
              </Box>
            ))}
            
            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: '6px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #30363d',
                }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#8b949e' }}>
                    Thinking...
                  </Typography>
                </Box>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid #21262d', backgroundColor: '#0d1117' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                ref={inputRef}
                fullWidth
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type anything... I understand shortcuts and natural language."
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#21262d',
                    color: '#e6edf3',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    '&:hover fieldset': {
                      borderColor: '#4a9eff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4a9eff',
                    },
                    '& fieldset': {
                      borderColor: '#30363d',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '10px 12px',
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
                  width: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: '#1f6feb',
                  },
                  '&:disabled': {
                    backgroundColor: '#21262d',
                    color: '#8b949e',
                  },
                }}
              >
                <SendIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            
            {suggestions.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#30363d',
                        color: '#e6edf3',
                      },
                    }}
                  />
                ))}
              </Box>
            )}
            
            <Typography sx={{ 
              fontSize: '0.7rem',
              color: '#8b949e',
              textAlign: 'center',
              mt: 1,
            }}>
              Try: "c" → clients • "e" → estimates • "help" → guide
            </Typography>
          </Box>
        </Paper>
      </Slide>

      {/* Trigger Tab */}
      <Fade in={!isOpen}>
        <Box
          onClick={handleToggle}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '160px',
            height: '36px',
            backgroundColor: '#1a1a1a',
            color: '#e6edf3',
            borderRadius: '18px 18px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid #30363d',
            borderBottom: 'none',
            gap: 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.2)',
            '&:hover': {
              backgroundColor: '#21262d',
              borderColor: '#4a9eff',
              transform: 'translateX(-50%) translateY(-2px)',
            },
          }}
        >
          <CopilotIcon sx={{ fontSize: 14, color: '#4a9eff' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
            Ask Copilot
          </Typography>
          <ArrowUpIcon sx={{ fontSize: 14, color: '#8b949e' }} />
        </Box>
      </Fade>
    </Box>
  );
};

export default AIAssistant;
