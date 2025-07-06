import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip
} from '@mui/material';
import {
  BugReport as BugIcon,
  TouchApp as ClickIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

const FeedbackInstructions = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Activate Feedback Mode',
      description: 'Click the feedback button (bug icon) in the bottom right corner',
      icon: <BugIcon color="primary" />
    },
    {
      label: 'Click on Issues',
      description: 'Click on any element that has problems or needs improvement',
      icon: <ClickIcon color="primary" />
    },
    {
      label: 'Describe the Issue',
      description: 'Fill out the feedback form with details about the problem',
      icon: <EditIcon color="primary" />
    },
    {
      label: 'Submit Feedback',
      description: 'Your feedback is sent to developers with technical details',
      icon: <SendIcon color="primary" />
    },
    {
      label: 'View Analytics',
      description: 'Check the feedback dashboard to see analysis and recommendations',
      icon: <AnalyticsIcon color="primary" />
    }
  ];

  const issueTypes = [
    { type: 'bug', label: 'Bug', description: 'Something is broken or not working', color: '#f44336' },
    { type: 'ui', label: 'UI/UX Issue', description: 'Design or user experience problems', color: '#ff9800' },
    { type: 'broken-link', label: 'Broken Link', description: 'Links that don\'t work or go nowhere', color: '#e91e63' },
    { type: 'performance', label: 'Performance', description: 'Slow loading or laggy interactions', color: '#9c27b0' },
    { type: 'feature', label: 'Feature Request', description: 'New functionality you\'d like to see', color: '#2196f3' },
    { type: 'improvement', label: 'Improvement', description: 'Ways to make existing features better', color: '#4caf50' }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <BugIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Feedback Annotation Tool
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
          Help improve the app by reporting issues and suggesting improvements
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box>
          {/* How it Works */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            How It Works
          </Typography>
          
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      backgroundColor: activeStep >= index ? '#1976d2' : '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      {activeStep > index ? <CheckIcon fontSize="small" /> : index + 1}
                    </Box>
                  )}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box display="flex" alignItems="center" gap={2} sx={{ ml: 2 }}>
                    {step.icon}
                    <Typography variant="body2">
                      {step.description}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      disabled={index === steps.length - 1}
                    >
                      {index === steps.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length && (
            <Paper square elevation={0} sx={{ p: 3, mt: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                🎉 You're ready to provide feedback!
              </Typography>
              <Typography variant="body2" paragraph>
                Start by clicking the feedback button and then click on any element that needs attention.
              </Typography>
              <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                Review Steps
              </Button>
            </Paper>
          )}

          {/* Issue Types */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Types of Feedback
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
            {issueTypes.map((issue) => (
              <Chip
                key={issue.type}
                label={issue.label}
                variant="outlined"
                sx={{
                  borderColor: issue.color,
                  color: issue.color,
                  '&:hover': {
                    backgroundColor: issue.color + '10'
                  }
                }}
              />
            ))}
          </Box>

          <List dense>
            {issueTypes.map((issue) => (
              <ListItem key={issue.type}>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: issue.color
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight="bold">
                      {issue.label}
                    </Typography>
                  }
                  secondary={issue.description}
                />
              </ListItem>
            ))}
          </List>

          {/* What Gets Captured */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            What Information is Captured
          </Typography>
          
          <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
            <Typography variant="body2" component="div">
              When you click on an element, the system automatically captures:
              <List dense>
                <ListItem>
                  <ListItemText primary="• Element details (tag, classes, IDs)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Position and size information" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Page URL and context" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Browser and device information" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Timestamp of the issue" />
                </ListItem>
              </List>
            </Typography>
          </Paper>

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="body2" color="primary">
              <strong>Privacy Note:</strong> No personal data is collected. Only technical information 
              about the elements and your feedback description are stored to help developers improve the app.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Maybe Later
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          Got It, Let's Start!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackInstructions;
