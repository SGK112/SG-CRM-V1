import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Build as FixIcon,
  PlayArrow as ApplyIcon,
  Undo as RollbackIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  AutoFix as AutoFixIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import api from '../services/api';

const InstantFixDashboard = () => {
  const [fixes, setFixes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestDialog, setShowSuggestDialog] = useState(false);
  const [bugDescription, setBugDescription] = useState('');
  const [elementSelector, setElementSelector] = useState('');
  const [pageUrl, setPageUrl] = useState(window.location.href);
  const [suggestions, setSuggestions] = useState([]);
  const [expandedFix, setExpandedFix] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadFixes();
  }, []);

  const loadFixes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/instant-fix');
      setFixes(response.data);
    } catch (error) {
      console.error('Failed to load fixes:', error);
      showAlert('Failed to load fixes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const suggestFixes = async () => {
    if (!bugDescription.trim()) {
      showAlert('Please describe the bug', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/instant-fix/suggest', {
        bug_description: bugDescription,
        element_selector: elementSelector,
        page_url: pageUrl
      });
      
      setSuggestions(response.data.suggestions);
      showAlert(`Generated ${response.data.count} fix suggestions`, 'success');
      setShowSuggestDialog(false);
      setBugDescription('');
      setElementSelector('');
      loadFixes(); // Reload to show new suggestions
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      showAlert('Failed to generate fix suggestions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFix = async (fixId) => {
    try {
      setLoading(true);
      const response = await api.post(`/instant-fix/apply/${fixId}`, {
        applied_by: 'developer',
        notes: 'Applied via dashboard'
      });
      
      showAlert(response.data.message, 'success');
      loadFixes();
    } catch (error) {
      console.error('Failed to apply fix:', error);
      showAlert('Failed to apply fix', 'error');
    } finally {
      setLoading(false);
    }
  };

  const rollbackFix = async (fixId) => {
    try {
      setLoading(true);
      await api.delete(`/instant-fix/${fixId}`);
      showAlert('Fix rolled back successfully', 'success');
      loadFixes();
    } catch (error) {
      console.error('Failed to rollback fix:', error);
      showAlert('Failed to rollback fix', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ message, severity });
    setTimeout(() => setAlert(null), 5000);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'suggested': return 'primary';
      case 'applied': return 'success';
      case 'rolled_back': return 'error';
      default: return 'default';
    }
  };

  const formatFixDetails = (fix) => {
    if (fix.fix_type === 'css' && fix.css_fix) {
      return {
        type: 'CSS Fix',
        details: `${fix.css_fix.selector} { ${fix.css_fix.property}: ${fix.css_fix.new_value}; }`
      };
    } else if (fix.fix_type === 'text' && fix.text_fix) {
      return {
        type: 'Text Fix',
        details: `"${fix.text_fix.old_text}" → "${fix.text_fix.new_text}"`
      };
    } else if (fix.fix_type === 'config' && fix.config_fix) {
      return {
        type: 'Config Fix',
        details: `${fix.config_fix.config_key}: ${JSON.stringify(fix.config_fix.new_value)}`
      };
    }
    return { type: 'Unknown Fix', details: 'No details available' };
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SpeedIcon />
          Instant Fix Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AutoFixIcon />}
          onClick={() => setShowSuggestDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Suggest Fix
        </Button>
      </Box>

      {/* Alert */}
      {alert && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Fixes
              </Typography>
              <Typography variant="h4">
                {fixes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Applied Fixes
              </Typography>
              <Typography variant="h4" color="success.main">
                {fixes.filter(f => f.status === 'applied').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Fixes
              </Typography>
              <Typography variant="h4" color="primary.main">
                {fixes.filter(f => f.status === 'suggested').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fixes List */}
      <Grid container spacing={2}>
        {fixes.map((fix) => {
          const fixDetails = formatFixDetails(fix);
          const isExpanded = expandedFix === fix.fix_id;
          
          return (
            <Grid item xs={12} md={6} key={fix.fix_id}>
              <Card sx={{ 
                height: '100%',
                border: fix.status === 'applied' ? '2px solid #4caf50' : undefined
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h3">
                      {fix.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={fix.status} 
                        color={getStatusColor(fix.status)}
                        size="small"
                      />
                      <Chip 
                        label={fix.risk_level} 
                        color={getRiskColor(fix.risk_level)}
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {fix.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip 
                      icon={<FixIcon />}
                      label={fixDetails.type}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {fixDetails.details}
                      </Typography>
                      
                      {fix.created_at && (
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                          Created: {new Date(fix.created_at).toLocaleString()}
                        </Typography>
                      )}
                      
                      {fix.applied_at && (
                        <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                          Applied: {new Date(fix.applied_at).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <IconButton 
                    onClick={() => setExpandedFix(isExpanded ? null : fix.fix_id)}
                    size="small"
                  >
                    {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                  </IconButton>
                  
                  <Box>
                    {fix.status === 'suggested' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ApplyIcon />}
                        onClick={() => applyFix(fix.fix_id)}
                        disabled={loading}
                        sx={{ mr: 1 }}
                      >
                        Apply
                      </Button>
                    )}
                    
                    {fix.status === 'applied' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<RollbackIcon />}
                        onClick={() => rollbackFix(fix.fix_id)}
                        disabled={loading}
                      >
                        Rollback
                      </Button>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {fixes.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No instant fixes yet
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create a fix suggestion to get started
          </Typography>
        </Box>
      )}

      {/* Suggest Fix Dialog */}
      <Dialog 
        open={showSuggestDialog} 
        onClose={() => setShowSuggestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoFixIcon />
            Suggest Instant Fix
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Bug Description"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={bugDescription}
            onChange={(e) => setBugDescription(e.target.value)}
            placeholder="Describe the bug or issue you want to fix..."
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Element Selector (optional)"
            fullWidth
            variant="outlined"
            value={elementSelector}
            onChange={(e) => setElementSelector(e.target.value)}
            placeholder="e.g., .button-primary, #header-nav"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Page URL"
            fullWidth
            variant="outlined"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuggestDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={suggestFixes}
            variant="contained"
            disabled={loading || !bugDescription.trim()}
          >
            Generate Suggestions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Tooltip title="Quick Fix">
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 20, right: 20 }}
          onClick={() => setShowSuggestDialog(true)}
        >
          <SpeedIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default InstantFixDashboard;
