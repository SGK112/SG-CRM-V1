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
  Payment as PaymentIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import ContractDialog from '../components/ContractDialog';
import FileUploadDialog from '../components/FileUploadDialog';

const ContractRow = ({ contract, onView, onEdit, onSend, onPayment, onUploadFiles }) => {
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
      case 'signed': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'default';
      case 'partial': return 'warning';
      case 'paid': return 'success';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <TableRow>
      <TableCell>{contract.contract_number}</TableCell>
      <TableCell>{contract.title}</TableCell>
      <TableCell>{contract.client_name}</TableCell>
      <TableCell>${contract.total?.toFixed(2)}</TableCell>
      <TableCell>
        <Chip
          label={contract.status}
          color={getStatusColor(contract.status)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Chip
          label={contract.payment_status}
          color={getPaymentStatusColor(contract.payment_status)}
          size="small"
        />
      </TableCell>
      <TableCell>
        {new Date(contract.created_at).toLocaleDateString()}
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
          <MenuItem onClick={() => { onView(contract); handleMenuClose(); }}>
            <ViewIcon sx={{ mr: 1 }} />
            View
          </MenuItem>
          <MenuItem onClick={() => { onEdit(contract); handleMenuClose(); }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          {contract.status === 'draft' && (
            <MenuItem onClick={() => { onSend(contract.id); handleMenuClose(); }}>
              <SendIcon sx={{ mr: 1 }} />
              Send
            </MenuItem>
          )}
          {contract.status === 'signed' && contract.payment_status !== 'paid' && (
            <MenuItem onClick={() => { onPayment(contract); handleMenuClose(); }}>
              <PaymentIcon sx={{ mr: 1 }} />
              Payment
            </MenuItem>
          )}
          <MenuItem onClick={() => { onUploadFiles(contract); handleMenuClose(); }}>
            <UploadIcon sx={{ mr: 1 }} />
            Upload Files
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
};

const Contracts = () => {
  const queryClient = useQueryClient();
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState(false);
  const [selectedContractForUpload, setSelectedContractForUpload] = useState(null);

  const { data: contracts = [], isLoading } = useQuery(
    'contracts',
    async () => {
      const response = await api.get('/contracts');
      return response.data;
    }
  );

  // Fetch estimates for conversion to contracts
  const { data: estimates = [] } = useQuery(
    'estimates',
    async () => {
      const response = await api.get('/estimates');
      return response.data;
    }
  );

  const sendMutation = useMutation(
    (id) => api.post(`/contracts/${id}/send`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contracts');
        toast.success('Contract sent successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to send contract');
      },
    }
  );

  const createMutation = useMutation(
    (contractData) => api.post('/contracts', contractData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contracts');
        toast.success('Contract created successfully');
        setContractDialogOpen(false);
        setSelectedContract(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to create contract');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/contracts/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('contracts');
        toast.success('Contract updated successfully');
        setContractDialogOpen(false);
        setSelectedContract(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update contract');
      },
    }
  );

  const handleView = (contract) => {
    setSelectedContract(contract);
    setIsViewMode(true);
    setContractDialogOpen(true);
  };

  const handleEdit = (contract) => {
    setSelectedContract(contract);
    setIsViewMode(false);
    setContractDialogOpen(true);
  };

  const handleSend = (id) => {
    if (window.confirm('Are you sure you want to send this contract?')) {
      sendMutation.mutate(id);
    }
  };

  const handlePayment = (contract) => {
    // TODO: Implement payment processing
    console.log('Process payment for contract:', contract);
  };

  const handleAddContract = () => {
    setSelectedContract(null);
    setIsViewMode(false);
    setContractDialogOpen(true);
  };

  const handleSaveContract = (contractData) => {
    if (selectedContract) {
      updateMutation.mutate({ id: selectedContract.id, data: contractData });
    } else {
      createMutation.mutate(contractData);
    }
  };

  const handleCloseDialog = () => {
    setContractDialogOpen(false);
    setSelectedContract(null);
    setIsViewMode(false);
  };

  const handleUploadFiles = (contract) => {
    setSelectedContractForUpload(contract);
    setFileUploadDialogOpen(true);
  };

  const handleFileUpload = async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('contract_id', selectedContractForUpload.id);

      await api.post('/contracts/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Files uploaded successfully');
      setFileUploadDialogOpen(false);
      setSelectedContractForUpload(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload files');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading contracts...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Contracts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddContract}
        >
          New Contract
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contract #</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
              <ContractRow
                key={contract.id}
                contract={contract}
                onView={handleView}
                onEdit={handleEdit}
                onSend={handleSend}
                onPayment={handlePayment}
                onUploadFiles={handleUploadFiles}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {contracts.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No contracts found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first contract to get started
          </Typography>
          <Button variant="contained" onClick={handleAddContract}>
            New Contract
          </Button>
        </Paper>
      )}

      <ContractDialog
        open={contractDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveContract}
        contract={selectedContract}
        estimates={estimates}
        isViewMode={isViewMode}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
      
      <FileUploadDialog
        open={fileUploadDialogOpen}
        onClose={() => {
          setFileUploadDialogOpen(false);
          setSelectedContractForUpload(null);
        }}
        onUpload={handleFileUpload}
        title={`Upload Files for Contract ${selectedContractForUpload?.contract_number || ''}`}
        maxFiles={10}
      />
    </Box>
  );
};

export default Contracts;
