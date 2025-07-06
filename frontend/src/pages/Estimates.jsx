import React from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Estimates = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Estimates
      </Typography>
      
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Estimates Feature Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The estimates feature is currently under development.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/dashboard')}
          sx={{ mr: 2 }}
        >
          Go to Dashboard
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/clients')}
        >
          View Clients
        </Button>
      </Paper>
    </Box>
  );
};

export default Estimates;
