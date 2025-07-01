import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Send as SendIcon,
  FileCopy as DuplicateIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import EstimateDialog from '../components/EstimateDialog';
import FileUploadDialog from '../components/FileUploadDialog';

const EstimateRow = ({ estimate, onView, onEdit, onSend, onDuplicate, onUploadFiles }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'primary';
      case 'viewed': return 'info';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  return (
    <TableRow>
      <TableCell>{estimate.estimate_number}</TableCell>
      <TableCell>{estimate.title}</TableCell>
      <TableCell>{estimate.client_name}</TableCell>
      <TableCell>${estimate.total?.toFixed(2)}</TableCell>
      <TableCell>
        <Chip
          label={estimate.status}
          color={getStatusColor(estimate.status)}
          size="small"
        />
      </TableCell>
      <TableCell>
        {new Date(estimate.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <IconButton onClick={handleMenuClick}>
          <MoreIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { onView(estimate); handleMenuClose(); }}>
            <ViewIcon sx={{ mr: 1 }} />
            View
          </MenuItem>
          <MenuItem onClick={() => { onEdit(estimate); handleMenuClose(); }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          {estimate.status === 'draft' && (
            <MenuItem onClick={() => { onSend(estimate.id); handleMenuClose(); }}>
              <SendIcon sx={{ mr: 1 }} />
              Send
            </MenuItem>
          )}
          <MenuItem onClick={() => { onDuplicate(estimate.id); handleMenuClose(); }}>
            <DuplicateIcon sx={{ mr: 1 }} />
            Duplicate
          </MenuItem>
          <MenuItem onClick={() => { onUploadFiles(estimate); handleMenuClose(); }}>
            <UploadIcon sx={{ mr: 1 }} />
            Upload Files
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
};

const Estimates = () => {
  const queryClient = useQueryClient();
  const [estimateDialogOpen, setEstimateDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState(false);
  const [selectedEstimateForUpload, setSelectedEstimateForUpload] = useState(null);

  const { data: estimates = [], isLoading } = useQuery(
    'estimates',
    async () => {
      const response = await api.get('/estimates');
      return response.data;
    }
  );

  const sendMutation = useMutation(
    (id) => api.post(`/estimates/${id}/send`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('estimates');
        toast.success('Estimate sent successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to send estimate');
      },
    }
  );

  const duplicateMutation = useMutation(
    (id) => api.post(`/estimates/${id}/duplicate`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('estimates');
        toast.success('Estimate duplicated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to duplicate estimate');
      },
    }
  );

  const createMutation = useMutation(
    (estimateData) => api.post('/estimates', estimateData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('estimates');
        toast.success('Estimate created successfully');
        setEstimateDialogOpen(false);
        setSelectedEstimate(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to create estimate');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/estimates/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('estimates');
        toast.success('Estimate updated successfully');
        setEstimateDialogOpen(false);
        setSelectedEstimate(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update estimate');
      },
    }
  );

  const handleView = (estimate) => {
    setSelectedEstimate(estimate);
    setIsViewMode(true);
    setEstimateDialogOpen(true);
  };

  const handleEdit = (estimate) => {
    setSelectedEstimate(estimate);
    setIsViewMode(false);
    setEstimateDialogOpen(true);
  };

  const handleSend = (id) => {
    if (window.confirm('Are you sure you want to send this estimate?')) {
      sendMutation.mutate(id);
    }
  };

  const handleDuplicate = (id) => {
    duplicateMutation.mutate(id);
  };

  const handleAddEstimate = () => {
    setSelectedEstimate(null);
    setIsViewMode(false);
    setEstimateDialogOpen(true);
  };

  const handleSaveEstimate = (estimateData) => {
    if (selectedEstimate) {
      updateMutation.mutate({ id: selectedEstimate.id, data: estimateData });
    } else {
      createMutation.mutate(estimateData);
    }
  };

  const handleCloseDialog = () => {
    setEstimateDialogOpen(false);
    setSelectedEstimate(null);
    setIsViewMode(false);
  };

  const handleUploadFiles = (estimate) => {
    setSelectedEstimateForUpload(estimate);
    setFileUploadDialogOpen(true);
  };

  const handleFileUpload = async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('estimate_id', selectedEstimateForUpload.id);

      await api.post('/estimates/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Files uploaded successfully');
      setFileUploadDialogOpen(false);
      setSelectedEstimateForUpload(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload files');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading estimates...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Estimates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEstimate}
        >
          New Estimate
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estimate #</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estimates.map((estimate) => (
              <EstimateRow
                key={estimate.id}
                estimate={estimate}
                onView={handleView}
                onEdit={handleEdit}
                onSend={handleSend}
                onDuplicate={handleDuplicate}
                onUploadFiles={handleUploadFiles}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {estimates.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No estimates found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first estimate to get started
          </Typography>
          <Button variant="contained" onClick={handleAddEstimate}>
            New Estimate
          </Button>
        </Paper>
      )}

      <EstimateDialog
        open={estimateDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveEstimate}
        estimate={selectedEstimate}
        isViewMode={isViewMode}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
      
      <FileUploadDialog
        open={fileUploadDialogOpen}
        onClose={() => {
          setFileUploadDialogOpen(false);
          setSelectedEstimateForUpload(null);
        }}
        onUpload={handleFileUpload}
        title={`Upload Files for Estimate ${selectedEstimateForUpload?.estimate_number || ''}`}
        maxFiles={10}
      />
    </Box>
  );
};

export default Estimates;
