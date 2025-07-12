import React, { useState, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../context/ThemeContext';
import { usePaymentMethods } from '../../hooks/usePayment';
import { getPaymentMethodIcon } from '../../config/stripe.config';
import StripeProvider from './StripeProvider';
import PaymentMethodForm from './PaymentMethodForm';

const PaymentMethods = ({ customerId }) => {
  const { jamaicanColors } = useContext(ThemeContext);
  const { 
    paymentMethods, 
    loading, 
    error, 
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod
  } = usePaymentMethods(customerId);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAddPaymentMethod = async (paymentMethodData) => {
    setActionLoading(true);
    try {
      await addPaymentMethod(paymentMethodData);
      setShowAddDialog(false);
    } catch (err) {
      console.error('Failed to add payment method:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePaymentMethod = async () => {
    if (!selectedMethod) return;
    
    setActionLoading(true);
    try {
      await deletePaymentMethod(selectedMethod.id);
      setShowDeleteDialog(false);
      setSelectedMethod(null);
    } catch (err) {
      console.error('Failed to delete payment method:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefault = async (paymentMethodId) => {
    setActionLoading(true);
    try {
      await setDefaultPaymentMethod(paymentMethodId);
    } catch (err) {
      console.error('Failed to set default payment method:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCardNumber = (last4) => {
    return `•••• •••• •••• ${last4}`;
  };

  const getCardBrand = (brand) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (loading && paymentMethods.length === 0) {
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
              <CreditCardIcon sx={{ color: jamaicanColors.green }} />
              <Typography variant="h6">Payment Methods</Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddDialog(true)}
              sx={{ bgcolor: jamaicanColors.green }}
            >
              Add Payment Method
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}

          {/* Payment Methods List */}
          {paymentMethods.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CreditCardIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Payment Methods
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add a payment method to make purchases and manage subscriptions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddDialog(true)}
                sx={{ bgcolor: jamaicanColors.green }}
              >
                Add Your First Payment Method
              </Button>
            </Box>
          ) : (
            <List>
              {paymentMethods.map((method, index) => (
                <React.Fragment key={method.id}>
                  <ListItem
                    sx={{
                      border: method.is_default ? `2px solid ${jamaicanColors.green}` : '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: method.is_default ? `${jamaicanColors.green}05` : 'transparent'
                    }}
                  >
                    <ListItemIcon>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '24px' }}>
                          {getPaymentMethodIcon(method.type)}
                        </span>
                        {method.is_default && (
                          <StarIcon sx={{ color: jamaicanColors.gold, fontSize: 20 }} />
                        )}
                      </Box>
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {method.type === 'card' ? 
                              `${getCardBrand(method.card.brand)} ${formatCardNumber(method.card.last4)}` :
                              method.type.replace('_', ' ').toUpperCase()
                            }
                          </Typography>
                          {method.is_default && (
                            <Chip 
                              label="Default" 
                              size="small" 
                              sx={{ 
                                bgcolor: jamaicanColors.green, 
                                color: 'white',
                                height: 20,
                                fontSize: '0.75rem'
                              }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {method.type === 'card' && (
                            <Typography variant="body2" color="text.secondary">
                              Expires {method.card.exp_month.toString().padStart(2, '0')}/{method.card.exp_year}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Added {new Date(method.created * 1000).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />

                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {!method.is_default && (
                          <IconButton
                            size="small"
                            onClick={() => handleSetDefault(method.id)}
                            disabled={actionLoading}
                            title="Set as default"
                          >
                            <StarBorderIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedMethod(method);
                            setShowDeleteDialog(true);
                          }}
                          disabled={actionLoading}
                          color="error"
                          title="Delete payment method"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < paymentMethods.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              ))}
            </List>
          )}

          {/* Security Notice */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mt: 3, 
            p: 2,
            bgcolor: '#f5f5f5',
            borderRadius: 1
          }}>
            <SecurityIcon sx={{ color: jamaicanColors.green }} />
            <Typography variant="body2" color="text.secondary">
              Your payment information is securely encrypted and stored by Stripe. 
              We never store your full card details on our servers.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Add Payment Method Dialog */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon sx={{ color: jamaicanColors.green }} />
            Add Payment Method
          </Box>
        </DialogTitle>
        <DialogContent>
          <StripeProvider>
            <PaymentMethodForm
              onSubmit={handleAddPaymentMethod}
              loading={actionLoading}
              onCancel={() => setShowAddDialog(false)}
            />
          </StripeProvider>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Payment Method</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this payment method? This action cannot be undone.
          </Typography>
          {selectedMethod?.is_default && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This is your default payment method. You'll need to set another payment method 
              as default before deleting this one.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePaymentMethod}
            disabled={actionLoading || selectedMethod?.is_default}
          >
            {actionLoading ? 'Deleting...' : 'Delete Payment Method'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentMethods;
