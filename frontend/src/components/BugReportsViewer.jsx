import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  BugReport as BugIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  AutoFix as FixIcon,
  Visibility as ViewIcon,
  Timeline as AnalysisIcon
} from '@mui/icons-material';
import api from '../services/api';

const BugReportsViewer = () => {
  const [reports, setReports] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedReport, setExpandedReport] = useState(null);
  const [showFixDialog, setShowFixDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadReports();
    loadAnalysis();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedback/submissions');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to load bug reports:', error);
      showAlert('Failed to load bug reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysis = async () => {
    try {
      const response = await api.get('/feedback/analysis');
      setAnalysis(response.data);
    } catch (error) {
      console.error('Failed to load analysis:', error);
    }
  };

  const createInstantFix = async (report) => {
    if (!report.annotations || report.annotations.length === 0) {
      showAlert('No annotations found to create fix', 'warning');
      return;
    }

    const annotation = report.annotations[0]; // Use first annotation
    const description = `${annotation.title}: ${annotation.description}`;
    
    try {
      setLoading(true);
      const response = await api.post('/instant-fix/suggest', {
        bug_description: description,
        element_selector: annotation.element?.selector || annotation.element?.tagName,
        page_url: report.session_info?.url || window.location.href
      });
      
      showAlert(`Generated ${response.data.count} instant fix suggestions`, 'success');
      setShowFixDialog(false);
    } catch (error) {
      console.error('Failed to create instant fix:', error);
      showAlert('Failed to create instant fix', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ message, severity });
    setTimeout(() => setAlert(null), 5000);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'bug': return 'error';
      case 'ui': return 'warning';
      case 'performance': return 'info';
      case 'feature': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugIcon />
          Bug Reports & Analysis
        </Typography>
        <Button
          variant="outlined"
          onClick={loadReports}
          disabled={loading}
        >
          Refresh
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
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Reports
              </Typography>
              <Typography variant="h4">
                {reports.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Critical Issues
              </Typography>
              <Typography variant="h4" color="error.main">
                {reports.reduce((acc, r) => acc + (r.annotations?.filter(a => a.priority === 'critical').length || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Bug Reports
              </Typography>
              <Typography variant="h4" color="warning.main">
                {reports.reduce((acc, r) => acc + (r.annotations?.filter(a => a.type === 'bug').length || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Analysis Done
              </Typography>
              <Typography variant="h4" color="primary.main">
                {analysis.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bug Reports
          </Typography>
          
          {reports.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No bug reports yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Use the feedback annotator to submit your first bug report
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="50">Actions</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Issues</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Page URL</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => {
                    const isExpanded = expandedReport === report._id;
                    const annotations = report.annotations || [];
                    
                    return (
                      <React.Fragment key={report._id}>
                        <TableRow>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => setExpandedReport(isExpanded ? null : report._id)}
                            >
                              {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            {formatDate(report.submitted_at)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {annotations.map((annotation, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${annotation.type} - ${annotation.priority}`}
                                  color={getPriorityColor(annotation.priority)}
                                  size="small"
                                />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={report.status || 'received'} 
                              color={report.status === 'resolved' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {report.session_info?.url || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<FixIcon />}
                              onClick={() => {
                                setSelectedReport(report);
                                createInstantFix(report);
                              }}
                              disabled={loading || !annotations.length}
                            >
                              Create Fix
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell colSpan={6} sx={{ p: 0 }}>
                            <Collapse in={isExpanded}>
                              <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="h6" gutterBottom>
                                  Report Details
                                </Typography>
                                
                                {annotations.map((annotation, idx) => (
                                  <Card key={idx} sx={{ mb: 2 }}>
                                    <CardContent>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="h6">
                                          {annotation.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Chip 
                                            label={annotation.type} 
                                            color={getTypeColor(annotation.type)}
                                            size="small"
                                          />
                                          <Chip 
                                            label={annotation.priority} 
                                            color={getPriorityColor(annotation.priority)}
                                            size="small"
                                          />
                                        </Box>
                                      </Box>
                                      
                                      <Typography variant="body2" color="textSecondary" paragraph>
                                        {annotation.description}
                                      </Typography>
                                      
                                      {annotation.element && (
                                        <Box sx={{ mt: 2 }}>
                                          <Typography variant="subtitle2" gutterBottom>
                                            Element Information:
                                          </Typography>
                                          <Box sx={{ pl: 2 }}>
                                            <Typography variant="body2">
                                              <strong>Tag:</strong> {annotation.element.tagName}
                                            </Typography>
                                            {annotation.element.className && (
                                              <Typography variant="body2">
                                                <strong>Class:</strong> {annotation.element.className}
                                              </Typography>
                                            )}
                                            {annotation.element.id && (
                                              <Typography variant="body2">
                                                <strong>ID:</strong> {annotation.element.id}
                                              </Typography>
                                            )}
                                            {annotation.element.textContent && (
                                              <Typography variant="body2">
                                                <strong>Text:</strong> {annotation.element.textContent.substring(0, 100)}...
                                              </Typography>
                                            )}
                                          </Box>
                                        </Box>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                                
                                {report.session_info && (
                                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Session Information:
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>URL:</strong> {report.session_info.url}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>User Agent:</strong> {report.session_info.userAgent}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Viewport:</strong> {report.session_info.viewport?.width}x{report.session_info.viewport?.height}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BugReportsViewer;
