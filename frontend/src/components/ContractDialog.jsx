import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const ContractDialog = ({ open, onClose, contract, onSave, estimate = null }) => {
  const { control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      title: '',
      client_name: '',
      client_email: '',
      client_phone: '',
      client_address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
      },
      line_items: [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          amount: 0,
        },
      ],
      tax_rate: 0,
      deposit_percentage: 25,
      terms: '',
      scope_of_work: '',
      start_date: null,
      completion_date: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'line_items',
  });

  const watchedLineItems = watch('line_items');
  const watchedTaxRate = watch('tax_rate');
  const watchedDepositPercentage = watch('deposit_percentage');

  useEffect(() => {
    if (contract) {
      const formData = {
        ...contract,
        start_date: contract.start_date ? dayjs(contract.start_date) : null,
        completion_date: contract.completion_date ? dayjs(contract.completion_date) : null,
      };
      reset(formData);
    } else if (estimate) {
      // Pre-fill from estimate
      const formData = {
        title: estimate.title,
        client_name: estimate.client_name,
        client_email: estimate.client_email,
        client_phone: estimate.client_phone,
        client_address: estimate.client_address,
        line_items: estimate.line_items,
        tax_rate: estimate.tax_rate,
        deposit_percentage: 25,
        terms: estimate.terms || 'Payment terms: 25% deposit required to begin work, balance due upon completion.',
        scope_of_work: '',
        start_date: dayjs(),
        completion_date: dayjs().add(30, 'day'),
      };
      reset(formData);
    } else {
      reset({
        title: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        client_address: {
          street: '',
          city: '',
          state: '',
          zip_code: '',
        },
        line_items: [
          {
            description: '',
            quantity: 1,
            unit_price: 0,
            amount: 0,
          },
        ],
        tax_rate: 0,
        deposit_percentage: 25,
        terms: 'Payment terms: 25% deposit required to begin work, balance due upon completion.',
        scope_of_work: '',
        start_date: dayjs(),
        completion_date: dayjs().add(30, 'day'),
      });
    }
  }, [contract, estimate, reset]);

  // Calculate line item amounts
  useEffect(() => {
    watchedLineItems.forEach((item, index) => {
      const amount = (item.quantity || 0) * (item.unit_price || 0);
      setValue(`line_items.${index}.amount`, amount);
    });
  }, [watchedLineItems, setValue]);

  const subtotal = watchedLineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = subtotal * ((watchedTaxRate || 0) / 100);
  const total = subtotal + taxAmount;
  const depositAmount = total * ((watchedDepositPercentage || 0) / 100);
  const balanceDue = total - depositAmount;

  const addLineItem = () => {
    append({
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0,
    });
  };

  const removeLineItem = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      start_date: data.start_date ? data.start_date.toISOString() : null,
      completion_date: data.completion_date ? data.completion_date.toISOString() : null,
      estimate_id: estimate?.id || contract?.estimate_id || null,
    };
    onSave(formattedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {contract ? 'Edit Contract' : 'Create New Contract'}
        {estimate && (
          <Typography variant="body2" color="text.secondary">
            Creating from Estimate: {estimate.estimate_number}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Contract Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Title is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Contract Title"
                      error={!!error}
                      helperText={error?.message}
                      required
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Start Date"
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Controller
                  name="completion_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Completion Date"
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  )}
                />
              </Grid>

              {/* Client Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Client Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="client_name"
                  control={control}
                  rules={{ required: 'Client name is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Client Name"
                      error={!!error}
                      helperText={error?.message}
                      required
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="client_email"
                  control={control}
                  rules={{ 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Client Email"
                      type="email"
                      error={!!error}
                      helperText={error?.message}
                      required
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="client_phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Client Phone"
                    />
                  )}
                />
              </Grid>

              {/* Client Address */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Client Address
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="client_address.street"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Street Address"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="client_address.city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="City"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="client_address.state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="State"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="client_address.zip_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="ZIP Code"
                    />
                  )}
                />
              </Grid>

              {/* Line Items */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
                  <Typography variant="h6">
                    Line Items
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addLineItem}
                    variant="outlined"
                    size="small"
                  >
                    Add Item
                  </Button>
                </Box>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell width="100px">Quantity</TableCell>
                        <TableCell width="120px">Unit Price</TableCell>
                        <TableCell width="120px">Amount</TableCell>
                        <TableCell width="60px">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Controller
                              name={`line_items.${index}.description`}
                              control={control}
                              rules={{ required: 'Description is required' }}
                              render={({ field: fieldProps, fieldState: { error } }) => (
                                <TextField
                                  {...fieldProps}
                                  fullWidth
                                  placeholder="Item description"
                                  variant="standard"
                                  error={!!error}
                                  size="small"
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`line_items.${index}.quantity`}
                              control={control}
                              render={({ field: fieldProps }) => (
                                <TextField
                                  {...fieldProps}
                                  type="number"
                                  variant="standard"
                                  size="small"
                                  inputProps={{ min: 0, step: 0.01 }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`line_items.${index}.unit_price`}
                              control={control}
                              render={({ field: fieldProps }) => (
                                <TextField
                                  {...fieldProps}
                                  type="number"
                                  variant="standard"
                                  size="small"
                                  inputProps={{ min: 0, step: 0.01 }}
                                  InputProps={{
                                    startAdornment: '$',
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              ${(watchedLineItems[index]?.amount || 0).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => removeLineItem(index)}
                              disabled={fields.length === 1}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Pricing and Deposit */}
              <Grid item xs={12}>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Controller
                        name="tax_rate"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            label="Tax Rate (%)"
                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                            size="small"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Controller
                        name="deposit_percentage"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            label="Deposit (%)"
                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                            size="small"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2">
                          Subtotal: ${subtotal.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Tax ({watchedTaxRate || 0}%): ${taxAmount.toFixed(2)}
                        </Typography>
                        <Typography variant="h6">
                          Total: ${total.toFixed(2)}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" color="primary">
                          Deposit ({watchedDepositPercentage || 0}%): ${depositAmount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Balance Due: ${balanceDue.toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Project Details
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="scope_of_work"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Scope of Work"
                      multiline
                      rows={4}
                      placeholder="Detailed description of work to be performed"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Terms & Conditions"
                      multiline
                      rows={4}
                      placeholder="Contract terms and conditions"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">
          {contract ? 'Update Contract' : 'Create Contract'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractDialog;
