import React, { useState, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  History as HistoryIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailedIcon,
  Schedule as PendingIcon,
  Undo as RefundIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ThemeContext } from '../../context/ThemeContext';
import { usePaymentHistory } from '../../hooks/usePayment';
import { formatCurrency, getPaymentMethodIcon } from '../../config/stripe.config';

const PaymentHistory = ({ customerId }) => {
  const { jamaicanColors } = useContext(ThemeContext);
  const { 
    payments, 
    loading, 
    error, 
    pagination,
    loadMore,
    exportHistory,
    refreshHistory
  } = usePaymentHistory(customerId);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'succeeded', label: 'Successful' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'succeeded': return <SuccessIcon sx={{ color: 'success.main', fontSize: 20 }} />;
      case 'failed': return <FailedIcon sx={{ color: 'error.main', fontSize: 20 }} />;
      case 'pending': return <PendingIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
      case 'refunded': return <RefundIcon sx={{ color: 'info.main', fontSize: 20 }} />;
      default: return <PendingIcon sx={{ color: 'grey.500', fontSize: 20 }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesSearch = !searchTerm || 
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const paginatedPayments = filteredPayments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      await exportHistory(format);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  const openReceiptUrl = (receiptUrl) => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    }
  };

  if (loading && payments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon sx={{ color: jamaicanColors.green }} />
              <Typography variant="h6">Payment History</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton onClick={refreshHistory} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('csv')}
                disabled={exportLoading}
                size="small"
              >
                {exportLoading ? 'Exporting...' : 'Export'}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Payments Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {filteredPayments.length === 0 && payments.length > 0 
                          ? 'No payments match your filters'
                          : 'No payment history found'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPayments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(payment.created * 1000), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(payment.created * 1000), 'h:mm a')}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {payment.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {payment.id.slice(-8)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(payment.amount, payment.currency)}
                        </Typography>
                        {payment.refunded_amount > 0 && (
                          <Typography variant="caption" color="error.main">
                            -{formatCurrency(payment.refunded_amount, payment.currency)} refunded
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(payment.status)}
                          <Chip 
                            label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            color={getStatusColor(payment.status)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        {payment.failure_reason && (
                          <Typography variant="caption" color="error.main" display="block">
                            {payment.failure_reason}
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <span>{getPaymentMethodIcon(payment.payment_method_type)}</span>
                          <Typography variant="body2">
                            {payment.payment_method_type.replace('_', ' ').toUpperCase()}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewDetails(payment)}
                            >
                              <FilterIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {payment.receipt_url && (
                            <Tooltip title="View Receipt">
                              <IconButton 
                                size="small"
                                onClick={() => openReceiptUrl(payment.receipt_url)}
                              >
                                <ReceiptIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredPayments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          {/* Load More Button */}
          {pagination.hasNext && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={loadMore}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                {loading ? 'Loading...' : 'Load More Payments'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog 
        open={showDetails} 
        onClose={() => setShowDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Payment Details
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Payment ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedPayment.id}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedPayment.created * 1000), 'MMM dd, yyyy h:mm a')}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h6" sx={{ color: jamaicanColors.green }}>
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(selectedPayment.status)}
                    <Typography variant="body1">
                      {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedPayment.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{getPaymentMethodIcon(selectedPayment.payment_method_type)}</span>
                    <Typography variant="body1">
                      {selectedPayment.payment_method_type.replace('_', ' ').toUpperCase()}
                    </Typography>
                  </Box>
                </Grid>

                {selectedPayment.refunded_amount > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>Refunded:</strong> {formatCurrency(selectedPayment.refunded_amount, selectedPayment.currency)}
                      </Typography>
                    </Alert>
                  </Grid>
                )}

                {selectedPayment.failure_reason && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      <Typography variant="body2">
                        <strong>Failure Reason:</strong> {selectedPayment.failure_reason}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedPayment?.receipt_url && (
            <Button
              startIcon={<ReceiptIcon />}
              onClick={() => openReceiptUrl(selectedPayment.receipt_url)}
            >
              View Receipt
            </Button>
          )}
          <Button onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentHistory;
