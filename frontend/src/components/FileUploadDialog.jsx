import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

const FileUploadDialog = ({ open, onClose, vendorId = null, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploadResults, setUploadResults] = useState([]);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation(
    async (fileData) => {
      const formData = new FormData();
      formData.append('file', fileData.file);
      if (vendorId) {
        formData.append('vendor_id', vendorId);
      }

      const endpoint = fileData.file.type === 'application/pdf' 
        ? '/upload/pdf'
        : fileData.file.type.startsWith('image/')
        ? '/upload/image'
        : '/upload/documents';

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          
          setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === fileData.id ? { ...f, progress } : f
            )
          );
        },
      });

      return { ...response.data, fileId: fileData.id };
    },
    {
      onSuccess: (data) => {
        setFiles(prevFiles =>
          prevFiles.map(f =>
            f.id === data.fileId 
              ? { ...f, uploaded: true, result: data }
              : f
          )
        );
        
        setUploadResults(prev => [...prev, data]);
        
        if (vendorId) {
          queryClient.invalidateQueries(['vendor', vendorId]);
        }
        
        toast.success('File uploaded successfully');
      },
      onError: (error, variables) => {
        setFiles(prevFiles =>
          prevFiles.map(f =>
            f.id === variables.id 
              ? { ...f, error: error.response?.data?.detail || 'Upload failed' }
              : f
          )
        );
        
        toast.error(`Failed to upload ${variables.file.name}`);
      },
    }
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        uploaded: false,
        error: null,
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
    },
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadAllFiles = async () => {
    for (const file of files.filter(f => !f.uploaded && !f.error)) {
      uploadMutation.mutate(file);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setUploadResults([]);
    onClose();
    if (onSuccess && uploadResults.length > 0) {
      onSuccess(uploadResults);
    }
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <PdfIcon />;
    } else if (file.type.startsWith('image/')) {
      return <ImageIcon />;
    } else {
      return <FileIcon />;
    }
  };

  const getFileTypeChip = (file) => {
    if (file.type === 'application/pdf') {
      return <Chip label="PDF" color="error" size="small" />;
    } else if (file.type.startsWith('image/')) {
      return <Chip label="Image" color="success" size="small" />;
    } else {
      return <Chip label="Document" color="primary" size="small" />;
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Upload Files
        {vendorId && (
          <Typography variant="body2" color="text.secondary">
            Files will be associated with the selected vendor
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          {/* Drop Zone */}
          <Paper
            {...getRootProps()}
            sx={{
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to select files
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported: PDF, Images, Word docs, Excel files (Max 10MB)
            </Typography>
          </Paper>
        </Box>

        {/* File List */}
        {files.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            <List>
              {files.map((fileData) => (
                <ListItem key={fileData.id} divider>
                  <ListItemIcon>
                    {fileData.uploaded ? (
                      <SuccessIcon color="success" />
                    ) : fileData.error ? (
                      <ErrorIcon color="error" />
                    ) : (
                      getFileIcon(fileData.file)
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" noWrap>
                          {fileData.file.name}
                        </Typography>
                        {getFileTypeChip(fileData.file)}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(fileData.file.size)}
                        </Typography>
                        {fileData.progress > 0 && fileData.progress < 100 && (
                          <LinearProgress 
                            variant="determinate" 
                            value={fileData.progress}
                            sx={{ mt: 1 }}
                          />
                        )}
                        {fileData.error && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            {fileData.error}
                          </Alert>
                        )}
                        {fileData.uploaded && fileData.result && (
                          <Alert severity="success" sx={{ mt: 1 }}>
                            Uploaded successfully
                            {fileData.result.parsed_data && (
                              <Typography variant="caption" display="block">
                                PDF parsed: {fileData.result.parsed_data.length} items extracted
                              </Typography>
                            )}
                          </Alert>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    {!fileData.uploaded && (
                      <IconButton
                        edge="end"
                        onClick={() => removeFile(fileData.id)}
                        disabled={fileData.progress > 0}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Upload Results Summary */}
        {uploadResults.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success">
              <Typography variant="body2">
                {uploadResults.length} file(s) uploaded successfully
              </Typography>
              {uploadResults.some(r => r.parsed_data) && (
                <Typography variant="caption" display="block">
                  PDF parsing completed. Check vendor pricing data for updates.
                </Typography>
              )}
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {uploadResults.length > 0 ? 'Done' : 'Cancel'}
        </Button>
        {files.length > 0 && files.some(f => !f.uploaded && !f.error) && (
          <Button
            variant="contained"
            onClick={uploadAllFiles}
            disabled={uploadMutation.isLoading}
          >
            {uploadMutation.isLoading ? 'Uploading...' : 'Upload All'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadDialog;
