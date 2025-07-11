import React from 'react';
import { Box, Typography } from '@mui/material';

const TestAI = () => {
  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      p: 2, 
      backgroundColor: '#1a1a1a', 
      color: 'white',
      borderRadius: 2 
    }}>
      <Typography>AI Copilot Test</Typography>
    </Box>
  );
};

export default TestAI;
