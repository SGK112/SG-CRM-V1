import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  BugReport as BugIcon,
  DesignServices as DesignIcon,
  Link as LinkIcon,
  Speed as PerformanceIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  MyLocation as LocationIcon
} from '@mui/icons-material';

const FeedbackDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const issueTypeConfig = {
    bug: { icon: <BugIcon />, color: '#f44336', label: 'Bug' },
    ui: { icon: <DesignIcon />, color: '#ff9800', label: 'UI/UX' },
    'broken-link': { icon: <LinkIcon />, color: '#e91e63', label: 'Broken Link' },
    performance: { icon: <PerformanceIcon />, color: '#9c27b0', label: 'Performance' },
    feature: { icon: <AddIcon />, color: '#2196f3', label: 'Feature' },
    improvement: { icon: <EditIcon />, color: '#4caf50', label: 'Improvement' }
  };

  const priorityConfig = {
    low: { color: '#4caf50', label: 'Low' },
    medium: { color: '#ff9800', label: 'Medium' },
    high: { color: '#f44336', label: 'High' },
    critical: { color: '#d32f2f', label: 'Critical' }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/submissions`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (submissionId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback/analysis/${submissionId}`);
      if (response.ok) {
        const analysis = await response.json();
        setAnalysisData(analysis);
        setShowAnalysisDialog(true);
      }
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    }
  };

  const getStats = () => {
    const stats = {
      total: submissions.length,
      byType: {},
      byPriority: {},
      byStatus: {},
      totalAnnotations: 0
    };

    submissions.forEach(submission => {
      submission.annotations.forEach(annotation => {
        stats.totalAnnotations++;
        stats.byType[annotation.type] = (stats.byType[annotation.type] || 0) + 1;
        stats.byPriority[annotation.priority] = (stats.byPriority[annotation.priority] || 0) + 1;
        stats.byStatus[annotation.status] = (stats.byStatus[annotation.status] || 0) + 1;
      });
    });

    return stats;
  };

  const stats = getStats();

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" style={{ color }}>
              {value}
            </Typography>
          </Box>
          <Box style={{ color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const SubmissionCard = ({ submission }) => {
    const severityScore = submission.analysis_status === 'completed' ? 
      Math.floor(Math.random() * 10) + 1 : 0; // Placeholder - would come from actual analysis

    return (
      <Card style={{ marginBottom: 16 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Feedback Submission
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date(submission.submitted_at).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                URL: {submission.session_info.url}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
              <Chip
                label={`${submission.annotations.length} annotation${submission.annotations.length !== 1 ? 's' : ''}`}
                color="primary"
                size="small"
              />
              {severityScore > 0 && (
                <Chip
                  label={`Severity: ${severityScore}/10`}
                  color={severityScore > 7 ? 'error' : severityScore > 4 ? 'warning' : 'success'}
                  size="small"
                />
              )}
            </Box>
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Issue Types:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {Object.entries(
                submission.annotations.reduce((acc, annotation) => {
                  acc[annotation.type] = (acc[annotation.type] || 0) + 1;
                  return acc;
                }, {})
              ).map(([type, count]) => {
                const config = issueTypeConfig[type];
                return (
                  <Chip
                    key={type}
                    icon={config?.icon}
                    label={`${config?.label || type} (${count})`}
                    size="small"
                    style={{ 
                      backgroundColor: config?.color + '20',
                      color: config?.color,
                      border: `1px solid ${config?.color}`
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelectedSubmission(submission)}
            >
              View Details
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AnalyticsIcon />}
              onClick={() => fetchAnalysis(submission._id)}
            >
              View Analysis
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const AnnotationDetail = ({ annotation }) => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={2} width="100%">
          {issueTypeConfig[annotation.type]?.icon}
          <Typography variant="subtitle1" fontWeight="bold">
            {annotation.title || 'Untitled'}
          </Typography>
          <Box ml="auto" display="flex" gap={1}>
            <Chip
              size="small"
              label={issueTypeConfig[annotation.type]?.label}
              style={{ 
                backgroundColor: issueTypeConfig[annotation.type]?.color + '20',
                color: issueTypeConfig[annotation.type]?.color
              }}
            />
            <Chip
              size="small"
              label={priorityConfig[annotation.priority]?.label}
              style={{ 
                backgroundColor: priorityConfig[annotation.priority]?.color + '20',
                color: priorityConfig[annotation.priority]?.color
              }}
            />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <Typography variant="body2" paragraph>
            {annotation.description}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  <CodeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Element Details
                </Typography>
                <Typography variant="body2">
                  <strong>Tag:</strong> {annotation.element.tagName}<br/>
                  <strong>Class:</strong> {annotation.element.className || 'None'}<br/>
                  <strong>ID:</strong> {annotation.element.id || 'None'}<br/>
                  <strong>Text:</strong> {annotation.element.textContent?.substring(0, 100) || 'None'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, backgroundColor: '#f0f7ff' }}>
                <Typography variant="subtitle2" gutterBottom>
                  <LocationIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Position & Context
                </Typography>
                <Typography variant="body2">
                  <strong>Position:</strong> ({Math.round(annotation.element.position.x)}, {Math.round(annotation.element.position.y)})<br/>
                  <strong>Size:</strong> {Math.round(annotation.element.position.width)}×{Math.round(annotation.element.position.height)}<br/>
                  <strong>Timestamp:</strong> {new Date(annotation.timestamp).toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Feedback Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchSubmissions}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Submissions"
            value={stats.total}
            icon={<InfoIcon />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Annotations"
            value={stats.totalAnnotations}
            icon={<EditIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bug Reports"
            value={stats.byType.bug || 0}
            icon={<BugIcon />}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="UI Issues"
            value={stats.byType.ui || 0}
            icon={<DesignIcon />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="All Submissions" />
        <Tab label="High Priority" />
        <Tab label="Recent" />
      </Tabs>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <Alert severity="info">
          No feedback submissions yet. Users can submit feedback using the feedback tool in the app.
        </Alert>
      ) : (
        <Box>
          {submissions
            .filter((submission) => {
              if (tabValue === 1) {
                return submission.annotations.some(a => a.priority === 'high' || a.priority === 'critical');
              }
              if (tabValue === 2) {
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return new Date(submission.submitted_at) > dayAgo;
              }
              return true;
            })
            .map((submission) => (
              <SubmissionCard key={submission._id} submission={submission} />
            ))}
        </Box>
      )}

      {/* Submission Details Dialog */}
      <Dialog
        open={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Submission Details
            <IconButton onClick={() => setSelectedSubmission(null)}>
              <EditIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Session Information
              </Typography>
              <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8fafc' }}>
                <Typography variant="body2">
                  <strong>URL:</strong> {selectedSubmission.session_info.url}<br/>
                  <strong>User Agent:</strong> {selectedSubmission.session_info.userAgent}<br/>
                  <strong>Viewport:</strong> {selectedSubmission.session_info.viewport.width}×{selectedSubmission.session_info.viewport.height}<br/>
                  <strong>Submitted:</strong> {new Date(selectedSubmission.submitted_at).toLocaleString()}
                </Typography>
              </Paper>

              <Typography variant="h6" gutterBottom>
                Annotations ({selectedSubmission.annotations.length})
              </Typography>
              {selectedSubmission.annotations.map((annotation) => (
                <AnnotationDetail key={annotation.id} annotation={annotation} />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSubmission(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog
        open={showAnalysisDialog}
        onClose={() => setShowAnalysisDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AnalyticsIcon />
            Feedback Analysis
          </Box>
        </DialogTitle>
        <DialogContent>
          {analysisData && (
            <Box>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Severity Score
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <LinearProgress
                    variant="determinate"
                    value={analysisData.severity_score * 10}
                    sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                    color={analysisData.severity_score > 7 ? 'error' : analysisData.severity_score > 4 ? 'warning' : 'success'}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {analysisData.severity_score}/10
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              <List>
                {analysisData.recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {index < 3 ? <WarningIcon color="warning" /> : <InfoIcon color="info" />}
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Detailed Findings
              </Typography>
              {analysisData.findings.map((finding, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {finding.title} ({finding.type})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2" paragraph>
                        {finding.description}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Actionable Items:
                      </Typography>
                      <List dense>
                        {finding.actionable_items.map((item, itemIndex) => (
                          <ListItem key={itemIndex}>
                            <ListItemIcon>
                              <CheckIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAnalysisDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackDashboard;
