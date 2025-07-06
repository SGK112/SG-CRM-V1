import React, { useState, useEffect, useRef } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import {
  BugReport as BugIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  PhotoCamera as ScreenshotIcon,
  MyLocation as LocationIcon,
  Code as CodeIcon,
  Brush as DesignIcon,
  Link as LinkIcon,
  Speed as PerformanceIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import FeedbackInstructions from './FeedbackInstructions';

const FeedbackAnnotator = () => {
  const [isActive, setIsActive] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const overlayRef = useRef(null);

  const issueTypes = [
    { value: 'bug', label: 'Bug', icon: <BugIcon />, color: '#f44336' },
    { value: 'ui', label: 'UI/UX Issue', icon: <DesignIcon />, color: '#ff9800' },
    { value: 'broken-link', label: 'Broken Link', icon: <LinkIcon />, color: '#e91e63' },
    { value: 'performance', label: 'Performance', icon: <PerformanceIcon />, color: '#9c27b0' },
    { value: 'feature', label: 'Feature Request', icon: <AddIcon />, color: '#2196f3' },
    { value: 'improvement', label: 'Improvement', icon: <EditIcon />, color: '#4caf50' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' },
    { value: 'critical', label: 'Critical', color: '#d32f2f' }
  ];

  // Load saved annotations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('crm-feedback-annotations');
    if (saved) {
      setAnnotations(JSON.parse(saved));
    }
    
    // Check if instructions have been shown before
    const instructionsShown = localStorage.getItem('crm-feedback-instructions-shown');
    if (!instructionsShown) {
      setShowInstructions(true);
    }
  }, []);

  // Save annotations to localStorage
  useEffect(() => {
    localStorage.setItem('crm-feedback-annotations', JSON.stringify(annotations));
  }, [annotations]);

  const captureElementInfo = (element) => {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    
    return {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      textContent: element.textContent?.substring(0, 100),
      position: {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      },
      styles: {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily
      },
      xpath: getXPath(element),
      selector: getCSSSelector(element)
    };
  };

  const getXPath = (element) => {
    if (element.id !== '') {
      return 'id("' + element.id + '")';
    }
    if (element === document.body) {
      return element.tagName;
    }

    let ix = 0;
    const siblings = element.parentNode.childNodes;
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling === element) {
        return getXPath(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
  };

  const getCSSSelector = (element) => {
    if (element.id) {
      return '#' + element.id;
    }
    
    let selector = element.tagName.toLowerCase();
    if (element.className && typeof element.className === 'string') {
      selector += '.' + element.className.split(' ').filter(cls => cls.trim()).join('.');
    }
    
    return selector;
  };

  const captureScreenshot = async () => {
    try {
      // Use html2canvas if available, otherwise return viewport info
      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return null;
    }
  };

  const handleClick = async (event) => {
    if (!isActive) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const elementInfo = captureElementInfo(event.target);
    const screenshot = await captureScreenshot();
    
    const newAnnotation = {
      id: Date.now(),
      type: 'bug',
      priority: 'medium',
      title: '',
      description: '',
      element: elementInfo,
      screenshot,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      status: 'open'
    };
    
    setCurrentAnnotation(newAnnotation);
    setShowDialog(true);
  };

  const saveAnnotation = () => {
    if (currentAnnotation.id && annotations.find(a => a.id === currentAnnotation.id)) {
      setAnnotations(prev => prev.map(a => a.id === currentAnnotation.id ? currentAnnotation : a));
    } else {
      setAnnotations(prev => [...prev, currentAnnotation]);
    }
    setShowDialog(false);
    setCurrentAnnotation(null);
  };

  const deleteAnnotation = (id) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const sendFeedbackToServer = async () => {
    try {
      const feedbackData = {
        annotations,
        sessionInfo: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (response.ok) {
        setFeedbackSent(true);
        setTimeout(() => setFeedbackSent(false), 3000);
        // Clear annotations after successful send
        setAnnotations([]);
        localStorage.removeItem('crm-feedback-annotations');
      }
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  };

  const handleInstructionsClose = () => {
    setShowInstructions(false);
    localStorage.setItem('crm-feedback-instructions-shown', 'true');
  };

  const getIssueTypeInfo = (type) => issueTypes.find(t => t.value === type);
  const getPriorityInfo = (priority) => priorities.find(p => p.value === priority);

  // Overlay for active mode
  useEffect(() => {
    if (isActive) {
      document.addEventListener('click', handleClick, true);
      document.body.style.cursor = 'crosshair';
      
      // Add visual indicator overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(33, 150, 243, 0.1);
        pointer-events: none;
        z-index: 9998;
        border: 3px dashed #2196f3;
        box-sizing: border-box;
      `;
      document.body.appendChild(overlay);
      overlayRef.current = overlay;
      
      return () => {
        document.removeEventListener('click', handleClick, true);
        document.body.style.cursor = 'default';
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      };
    }
  }, [isActive]);

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color={isActive ? "secondary" : "primary"}
        aria-label="feedback"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999
        }}
        onClick={() => setIsActive(!isActive)}
      >
        <Badge badgeContent={annotations.length} color="error">
          {isActive ? <CloseIcon /> : <BugIcon />}
        </Badge>
      </Fab>

      {/* Annotations Display */}
      {showAnnotations && annotations.length > 0 && (
        <Paper
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: 300,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 9999,
            padding: 16
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Feedback ({annotations.length})</Typography>
            <Box>
              <IconButton size="small" onClick={sendFeedbackToServer}>
                <SendIcon />
              </IconButton>
              <IconButton size="small" onClick={() => setShowAnnotations(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          
          <List dense>
            {annotations.map((annotation) => {
              const typeInfo = getIssueTypeInfo(annotation.type);
              const priorityInfo = getPriorityInfo(annotation.priority);
              
              return (
                <ListItem key={annotation.id} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {typeInfo?.icon}
                        <Typography variant="body2" fontWeight="bold">
                          {annotation.title || 'Untitled'}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {annotation.description?.substring(0, 50)}...
                        </Typography>
                        <Box display="flex" gap={0.5} mt={0.5}>
                          <Chip
                            size="small"
                            label={typeInfo?.label}
                            style={{ backgroundColor: typeInfo?.color, color: 'white' }}
                          />
                          <Chip
                            size="small"
                            label={priorityInfo?.label}
                            style={{ backgroundColor: priorityInfo?.color, color: 'white' }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setCurrentAnnotation(annotation);
                        setShowDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => deleteAnnotation(annotation.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}

      {/* Feedback Success Alert */}
      {feedbackSent && (
        <Alert 
          severity="success" 
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000
          }}
        >
          Feedback sent successfully!
        </Alert>
      )}

      {/* Help Button */}
      <Fab
        size="small"
        color="default"
        style={{
          position: 'fixed',
          bottom: 90,
          right: 80,
          zIndex: 9999
        }}
        onClick={() => setShowInstructions(true)}
      >
        <HelpIcon />
      </Fab>

      {/* Toggle Annotations Visibility */}
      {!showAnnotations && annotations.length > 0 && (
        <Fab
          size="small"
          color="default"
          style={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            zIndex: 9999
          }}
          onClick={() => setShowAnnotations(true)}
        >
          <Badge badgeContent={annotations.length} color="error">
            <VisibilityIcon />
          </Badge>
        </Fab>
      )}

      {/* Annotation Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Create Feedback Annotation
            <IconButton onClick={() => setShowDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {currentAnnotation && (
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Title"
                fullWidth
                value={currentAnnotation.title}
                onChange={(e) => setCurrentAnnotation(prev => ({...prev, title: e.target.value}))}
                placeholder="Brief description of the issue"
              />
              
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={currentAnnotation.description}
                onChange={(e) => setCurrentAnnotation(prev => ({...prev, description: e.target.value}))}
                placeholder="Detailed description of what's wrong or what needs improvement"
              />
              
              <Box display="flex" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Issue Type</InputLabel>
                  <Select
                    value={currentAnnotation.type}
                    label="Issue Type"
                    onChange={(e) => setCurrentAnnotation(prev => ({...prev, type: e.target.value}))}
                  >
                    {issueTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {type.icon}
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={currentAnnotation.priority}
                    label="Priority"
                    onChange={(e) => setCurrentAnnotation(prev => ({...prev, priority: e.target.value}))}
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        <Chip
                          size="small"
                          label={priority.label}
                          style={{ backgroundColor: priority.color, color: 'white' }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              {/* Element Information */}
              <Paper style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  <CodeIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                  Element Information
                </Typography>
                <Typography variant="body2">
                  <strong>Tag:</strong> {currentAnnotation.element?.tagName}<br/>
                  <strong>Class:</strong> {currentAnnotation.element?.className || 'None'}<br/>
                  <strong>ID:</strong> {currentAnnotation.element?.id || 'None'}<br/>
                  <strong>Text:</strong> {currentAnnotation.element?.textContent || 'None'}<br/>
                  <strong>Position:</strong> {Math.round(currentAnnotation.element?.position?.x)}, {Math.round(currentAnnotation.element?.position?.y)}
                </Typography>
              </Paper>
              
              {/* URL Information */}
              <Paper style={{ padding: 16, backgroundColor: '#f0f7ff' }}>
                <Typography variant="subtitle2" gutterBottom>
                  <LocationIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                  Page Information
                </Typography>
                <Typography variant="body2">
                  <strong>URL:</strong> {currentAnnotation.url}<br/>
                  <strong>Timestamp:</strong> {new Date(currentAnnotation.timestamp).toLocaleString()}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={saveAnnotation} variant="contained" color="primary">
            Save Annotation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Instructions when active */}
      {isActive && (
        <Paper
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: 20,
            zIndex: 9999,
            textAlign: 'center',
            maxWidth: 400
          }}
        >
          <Typography variant="h6" gutterBottom>
            Feedback Mode Active
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Click on any element to create a feedback annotation. 
            The system will capture element details, position, and page context.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setIsActive(false)}
            style={{ marginTop: 16 }}
          >
            Exit Feedback Mode
          </Button>
        </Paper>
      )}

      {/* Instructions Dialog */}
      <FeedbackInstructions
        open={showInstructions}
        onClose={handleInstructionsClose}
      />
    </>
  );
};

export default FeedbackAnnotator;
