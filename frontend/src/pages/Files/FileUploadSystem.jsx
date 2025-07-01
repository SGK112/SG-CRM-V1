import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  PictureAsPdf,
  Image,
  Description,
  Delete,
  Download,
  Visibility,
  PhotoCamera,
  AttachFile,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const FileUploadSystem = () => {
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: 'vendor-price-list-granite-plus.pdf',
      type: 'pdf',
      category: 'vendor-pricing',
      vendor: 'Granite Plus',
      size: '2.4 MB',
      uploadDate: '2025-07-01',
      url: '#',
    },
    {
      id: 2,
      name: 'kitchen-renovation-progress-1.jpg',
      type: 'image',
      category: 'project-photos',
      project: 'Smith Kitchen',
      size: '1.8 MB',
      uploadDate: '2025-07-01',
      url: '#',
    },
  ]);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newFileDetails, setNewFileDetails] = useState({
    category: '',
    vendor: '',
    project: '',
    description: '',
  });

  const categories = [
    { value: 'vendor-pricing', label: 'Vendor Price Lists' },
    { value: 'project-photos', label: 'Project Photos' },
    { value: 'estimates', label: 'Estimate Documents' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'templates', label: 'Templates' },
    { value: 'certifications', label: 'Certifications' },
    { value: 'other', label: 'Other Documents' },
  ];

  const onDrop = useCallback((acceptedFiles) => {
    setShowUploadDialog(true);
    // Handle file upload logic here
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setShowUploadDialog(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdf color="error" />;
      case 'image':
        return <Image color="primary" />;
      default:
        return <Description color="action" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        File Management System
      </Typography>

      {/* Upload Area */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or click to select files
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="PDF" size="small" />
              <Chip label="Images" size="small" />
              <Chip label="Excel" size="small" />
              <Chip label="Word" size="small" />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Maximum file size: 10MB
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Upload Buttons */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PictureAsPdf />}
            size="large"
            sx={{ py: 2 }}
          >
            Upload Price List
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PhotoCamera />}
            size="large"
            sx={{ py: 2 }}
          >
            Add Job Photos
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Description />}
            size="large"
            sx={{ py: 2 }}
          >
            Upload Contract
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AttachFile />}
            size="large"
            sx={{ py: 2 }}
          >
            Other Documents
          </Button>
        </Grid>
      </Grid>

      {/* File Categories */}
      <Grid container spacing={3}>
        {categories.map((category) => {
          const categoryFiles = uploadedFiles.filter(file => file.category === category.value);
          
          return (
            <Grid item xs={12} md={6} key={category.value}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {category.label}
                    </Typography>
                    <Chip 
                      label={categoryFiles.length} 
                      size="small" 
                      color={categoryFiles.length > 0 ? 'primary' : 'default'}
                    />
                  </Box>
                  
                  {categoryFiles.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No files uploaded yet
                    </Typography>
                  ) : (
                    <List dense>
                      {categoryFiles.map((file) => (
                        <React.Fragment key={file.id}>
                          <ListItem>
                            <ListItemIcon>
                              {getFileIcon(file.type)}
                            </ListItemIcon>
                            <ListItemText
                              primary={file.name}
                              secondary={
                                <Box>
                                  <Typography variant="caption" display="block">
                                    {file.size} • {file.uploadDate}
                                  </Typography>
                                  {file.vendor && (
                                    <Chip label={file.vendor} size="small" sx={{ mt: 0.5 }} />
                                  )}
                                  {file.project && (
                                    <Chip label={file.project} size="small" sx={{ mt: 0.5 }} />
                                  )}
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton size="small" sx={{ mr: 1 }}>
                                <Visibility />
                              </IconButton>
                              <IconButton size="small" sx={{ mr: 1 }}>
                                <Download />
                              </IconButton>
                              <IconButton size="small" color="error">
                                <Delete />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload File Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newFileDetails.category}
                  onChange={(e) => setNewFileDetails({ ...newFileDetails, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {newFileDetails.category === 'vendor-pricing' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vendor Name"
                  value={newFileDetails.vendor}
                  onChange={(e) => setNewFileDetails({ ...newFileDetails, vendor: e.target.value })}
                />
              </Grid>
            )}
            
            {newFileDetails.category === 'project-photos' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={newFileDetails.project}
                  onChange={(e) => setNewFileDetails({ ...newFileDetails, project: e.target.value })}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={newFileDetails.description}
                onChange={(e) => setNewFileDetails({ ...newFileDetails, description: e.target.value })}
              />
            </Grid>
            
            {uploading && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Uploading... {uploadProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={!newFileDetails.category || uploading}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUploadSystem;
