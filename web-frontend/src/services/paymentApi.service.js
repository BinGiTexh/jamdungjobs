// Payment API Service for JamDung Jobs
import { PAYMENT_ERROR_TYPES } from '../config/stripe.config';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class PaymentApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/payments`;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Generic API request handler
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getAuthHeaders(),
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw this.handleApiError(error);
    }
  }

  // Handle API errors consistently
  handleApiError(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: PAYMENT_ERROR_TYPES.API_ERROR,
        message: 'Network error. Please check your connection and try again.',
        code: 'network_error'
      };
    }

    if (error.message.includes('401')) {
      return {
        type: PAYMENT_ERROR_TYPES.AUTHENTICATION_ERROR,
        message: 'Authentication required. Please log in again.',
        code: 'authentication_required'
      };
    }

    if (error.message.includes('429')) {
      return {
        type: PAYMENT_ERROR_TYPES.RATE_LIMIT_ERROR,
        message: 'Too many requests. Please wait a moment and try again.',
        code: 'rate_limit_exceeded'
      };
    }

    return {
      type: PAYMENT_ERROR_TYPES.API_ERROR,
      message: error.message || 'An unexpected error occurred',
      code: 'unknown_error'
    };
  }

  // Payment Intent Methods
  async createPaymentIntent(paymentData) {
    return this.makeRequest('/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async confirmPayment(paymentIntentId) {
    return this.makeRequest('/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId })
    });
  }

  async getPaymentIntent(paymentIntentId) {
    return this.makeRequest(`/payment-intent/${paymentIntentId}`);
  }

  // Subscription Methods
  async createSubscription(planId, paymentMethodId) {
    return this.makeRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethodId })
    });
  }

  async getSubscription(subscriptionId) {
    return this.makeRequest(`/subscriptions/${subscriptionId}`);
  }

  async updateSubscription(subscriptionId, planId) {
    return this.makeRequest(`/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify({ planId })
    });
  }

  async cancelSubscription(subscriptionId) {
    return this.makeRequest(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST'
    });
  }

  async reactivateSubscription(subscriptionId) {
    return this.makeRequest(`/subscriptions/${subscriptionId}/reactivate`, {
      method: 'POST'
    });
  }

  // Payment History Methods
  async getPaymentHistory(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      status: params.status || '',
      startDate: params.startDate || '',
      endDate: params.endDate || ''
    }).toString();

    return this.makeRequest(`/history?${queryParams}`);
  }

  async exportPaymentHistory(format = 'csv') {
    const response = await fetch(`${this.baseURL}/history/export?format=${format}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // Refund Methods
  async createRefund(paymentId, amount, reason) {
    return this.makeRequest('/refunds', {
      method: 'POST',
      body: JSON.stringify({ paymentId, amount, reason })
    });
  }

  async getRefunds(paymentId) {
    return this.makeRequest(`/refunds?paymentId=${paymentId}`);
  }

  // Pricing Methods
  async getPricing() {
    return this.makeRequest('/pricing');
  }

  // Analytics Methods (Admin only)
  async getPaymentAnalytics(dateRange) {
    const params = new URLSearchParams({
      startDate: dateRange?.start?.toISOString() || '',
      endDate: dateRange?.end?.toISOString() || ''
    }).toString();

    return this.makeRequest(`/analytics?${params}`);
  }

  async getCustomerAnalytics() {
    return this.makeRequest('/analytics/customers');
  }

  async getRevenueAnalytics(period = 'month') {
    return this.makeRequest(`/analytics/revenue?period=${period}`);
  }

  async getHeartRevenueShare() {
    return this.makeRequest('/analytics/heart-revenue');
  }

  // Payment Method Management
  async savePaymentMethod(paymentMethodId) {
    return this.makeRequest('/payment-methods', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId })
    });
  }

  async getPaymentMethods() {
    return this.makeRequest('/payment-methods');
  }

  async deletePaymentMethod(paymentMethodId) {
    return this.makeRequest(`/payment-methods/${paymentMethodId}`, {
      method: 'DELETE'
    });
  }

  // Webhook Methods (for testing)
  async testWebhook(eventType, data) {
    return this.makeRequest('/webhook/test', {
      method: 'POST',
      body: JSON.stringify({ eventType, data })
    });
  }

  // Utility Methods
  async validatePayment(paymentIntentId) {
    return this.makeRequest(`/validate/${paymentIntentId}`);
  }

  async getPaymentStatus(paymentId) {
    return this.makeRequest(`/status/${paymentId}`);
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const paymentApiService = new PaymentApiService();

// Export individual methods for easier importing
export const {
  createPaymentIntent,
  confirmPayment,
  getPaymentIntent,
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  getPaymentHistory,
  exportPaymentHistory,
  createRefund,
  getRefunds,
  getPricing,
  getPaymentAnalytics,
  getCustomerAnalytics,
  getRevenueAnalytics,
  getHeartRevenueShare,
  savePaymentMethod,
  getPaymentMethods,
  deletePaymentMethod,
  testWebhook,
  validatePayment,
  getPaymentStatus,
  healthCheck
} = paymentApiService;

export default paymentApiService;
