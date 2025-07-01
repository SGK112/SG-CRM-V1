import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  TrendingUp as RevenueIcon,
  Pending as PendingIcon,
  CheckCircle as PaidIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import api from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: 1, 
            backgroundColor: `${color}.main`, 
            color: 'white',
            mr: 2 
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const PaymentForm = ({ contract, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent
      const response = await api.post('/payments/create-payment-intent', {
        contract_id: contract.id,
      });

      const { client_secret } = response.data;

      // Confirm payment
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: contract.client_name,
            email: contract.client_email,
          },
        }
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Contract: {contract.contract_number}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Amount: ${contract.deposit_amount?.toFixed(2)}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!stripe || processing}
        >
          {processing ? 'Processing...' : `Pay $${contract.deposit_amount?.toFixed(2)}`}
        </Button>
      </Box>
    </form>
  );
};

const PaymentDialog = ({ open, onClose, contract, onSuccess }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Process Payment</DialogTitle>
      <DialogContent>
        <Elements stripe={stripePromise}>
          <PaymentForm
            contract={contract}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
            onCancel={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

const Payments = () => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const { data: paymentsData, isLoading, refetch } = useQuery(
    'payments',
    async () => {
      // Get contracts that need payment
      const contractsResponse = await api.get('/contracts', {
        params: { payment_status: 'pending' }
      });
      
      // Get all contracts for revenue calculation
      const allContractsResponse = await api.get('/contracts');
      
      return {
        pendingContracts: contractsResponse.data,
        allContracts: allContractsResponse.data,
      };
    }
  );

  const handleProcessPayment = (contract) => {
    setSelectedContract(contract);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    refetch();
    toast.success('Payment processed successfully');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading payments...</Typography>
      </Box>
    );
  }

  const pendingContracts = paymentsData?.pendingContracts || [];
  const allContracts = paymentsData?.allContracts || [];
  
  const totalRevenue = allContracts.reduce((sum, contract) => sum + (contract.total || 0), 0);
  const paidContracts = allContracts.filter(c => c.payment_status === 'paid').length;
  const pendingAmount = pendingContracts.reduce((sum, contract) => sum + (contract.deposit_amount || 0), 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Payments
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={<RevenueIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paid Contracts"
            value={paidContracts}
            icon={<PaidIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Payments"
            value={pendingContracts.length}
            icon={<PendingIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Amount"
            value={`$${pendingAmount.toFixed(2)}`}
            icon={<PaymentIcon />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Pending Payments Table */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6">
            Pending Payments
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contract #</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Deposit Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.contract_number}</TableCell>
                  <TableCell>{contract.client_name}</TableCell>
                  <TableCell>${contract.total?.toFixed(2)}</TableCell>
                  <TableCell>${contract.deposit_amount?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={contract.payment_status}
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PaymentIcon />}
                      onClick={() => handleProcessPayment(contract)}
                    >
                      Process Payment
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {pendingContracts.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No pending payments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All contracts are up to date with payments
            </Typography>
          </Box>
        )}
      </Paper>

      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        contract={selectedContract}
        onSuccess={handlePaymentSuccess}
      />
    </Box>
  );
};

export default Payments;
