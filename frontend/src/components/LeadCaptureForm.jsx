import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { brandColors } from '../theme/mobileFirstTheme';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  background: `linear-gradient(135deg, ${brandColors.white} 0%, ${brandColors.background} 100%)`,
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: `1px solid ${brandColors.secondary}20`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
  }
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiStepLabel-root': {
    color: brandColors.text.secondary,
  },
  '& .MuiStepLabel-active': {
    color: brandColors.accent,
  },
  '& .MuiStepLabel-completed': {
    color: brandColors.secondary,
  },
  '& .MuiStepIcon-root': {
    color: brandColors.text.light,
    '&.Mui-active': {
      color: brandColors.accent,
    },
    '&.Mui-completed': {
      color: brandColors.secondary,
    },
  },
}));

const LeadCaptureForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    project_type: '',
    project_description: '',
    budget: '',
    timeline: '',
    address: '',
    preferred_contact: 'email',
    notes: ''
  });
  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Contact Info', 'Project Details', 'Preferences'];

  useEffect(() => {
    // Load form configuration
    fetchFormConfig();
  }, []);

  const fetchFormConfig = async () => {
    try {
      const response = await fetch('/api/leads/public/lead-form');
      const config = await response.json();
      setFormConfig(config);
    } catch (error) {
      console.error('Failed to load form config:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/leads/public/lead-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          lead_source: 'website'
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(result.detail || 'Failed to submit form');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.first_name && formData.last_name && formData.email;
      case 1:
        return formData.project_type && formData.project_description;
      case 2:
        return true; // Optional step
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={formData.project_type}
                  onChange={(e) => handleInputChange('project_type', e.target.value)}
                  label="Project Type"
                >
                  <MenuItem value="kitchen">Kitchen Remodel</MenuItem>
                  <MenuItem value="bathroom">Bathroom Remodel</MenuItem>
                  <MenuItem value="countertops">Countertops Only</MenuItem>
                  <MenuItem value="commercial">Commercial Project</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Budget Range</InputLabel>
                <Select
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  label="Budget Range"
                >
                  <MenuItem value="under_5k">Under $5,000</MenuItem>
                  <MenuItem value="5k_10k">$5,000 - $10,000</MenuItem>
                  <MenuItem value="10k_25k">$10,000 - $25,000</MenuItem>
                  <MenuItem value="25k_50k">$25,000 - $50,000</MenuItem>
                  <MenuItem value="over_50k">Over $50,000</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Description"
                multiline
                rows={4}
                value={formData.project_description}
                onChange={(e) => handleInputChange('project_description', e.target.value)}
                required
                variant="outlined"
                placeholder="Tell us about your project..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Timeline</InputLabel>
                <Select
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  label="Timeline"
                >
                  <MenuItem value="asap">ASAP</MenuItem>
                  <MenuItem value="1_month">Within 1 month</MenuItem>
                  <MenuItem value="3_months">Within 3 months</MenuItem>
                  <MenuItem value="6_months">Within 6 months</MenuItem>
                  <MenuItem value="planning">Just planning</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Contact Method</InputLabel>
                <Select
                  value={formData.preferred_contact}
                  onChange={(e) => handleInputChange('preferred_contact', e.target.value)}
                  label="Preferred Contact Method"
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="text">Text Message</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                variant="outlined"
                placeholder="Any additional information..."
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <StyledPaper>
        <Box textAlign="center" py={4}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              color: brandColors.secondary,
              fontWeight: 700,
              mb: 2
            }}
          >
            Thank You! 🎉
          </Typography>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: brandColors.primary,
              fontWeight: 600,
              mb: 3
            }}
          >
            Your project inquiry has been submitted successfully.
          </Typography>
          <Typography 
            color="textSecondary" 
            paragraph
            sx={{ 
              fontSize: '1.1rem',
              lineHeight: 1.6,
              mb: 4
            }}
          >
            We'll contact you within 24 hours to discuss your project and schedule a free consultation.
          </Typography>
          <Box mt={3}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: brandColors.primary,
                fontWeight: 600,
                mb: 2
              }}
            >
              What happens next:
            </Typography>
            <Box 
              component="ul" 
              textAlign="left" 
              mt={1} 
              maxWidth={400} 
              mx="auto"
              sx={{
                '& li': {
                  color: brandColors.text.secondary,
                  fontSize: '0.95rem',
                  lineHeight: 1.8,
                  mb: 1
                }
              }}
            >
              <li>Our team will review your project details</li>
              <li>We'll contact you to discuss your needs</li>
              <li>Schedule a free on-site consultation</li>
              <li>Receive a detailed estimate within 48 hours</li>
            </Box>
          </Box>
        </Box>
      </StyledPaper>
    );
  }

  return (
    <Box maxWidth="800px" mx="auto" p={2}>
      <StyledPaper>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ 
            color: brandColors.primary,
            fontWeight: 700,
            mb: 2
          }}
        >
          Get Your Free Quote
        </Typography>
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="textSecondary" 
          paragraph
          sx={{ mb: 4 }}
        >
          Tell us about your project and we'll provide a detailed estimate
        </Typography>

        <StyledStepper activeStep={currentStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </StyledStepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {renderStepContent(currentStep)}

          <Box 
            display="flex" 
            justifyContent="space-between" 
            mt={4}
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}
          >
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="outlined"
              sx={{ 
                borderColor: brandColors.secondary,
                color: brandColors.secondary,
                '&:hover': {
                  borderColor: brandColors.primary,
                  backgroundColor: `${brandColors.secondary}10`
                }
              }}
            >
              Back
            </Button>

            <Box>
              {currentStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !isStepValid(currentStep)}
                  startIcon={loading && <CircularProgress size={20} />}
                  sx={{
                    background: `linear-gradient(135deg, ${brandColors.accent} 0%, #357ABD 100%)`,
                    color: brandColors.white,
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      background: `linear-gradient(135deg, #357ABD 0%, ${brandColors.accent} 100%)`,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
                    }
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Quote Request'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  size="large"
                  disabled={!isStepValid(currentStep)}
                  sx={{
                    background: `linear-gradient(135deg, ${brandColors.accent} 0%, #357ABD 100%)`,
                    color: brandColors.white,
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      background: `linear-gradient(135deg, #357ABD 0%, ${brandColors.accent} 100%)`,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
                    }
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default LeadCaptureForm;
