import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Accept': 'application/json'
  }
});

// Response Interceptor for global error notifications
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let errorMsg =
      error.response?.data?.error?.message ||
      error.response?.data?.message;

    if (!errorMsg) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        errorMsg = 'Could not reach the server. Make sure the backend is running on port 5000.';
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMsg = 'Request timed out. Please try again with a smaller or clearer photo.';
      } else {
        errorMsg = error.message || 'Network communication error. Please check backend connection.';
      }
    }

    // Show toast on user actions (e.g. POST analyze/ask) to avoid spamming on initial page load GET
    const isGet = error.config?.method?.toLowerCase() === 'get';
    if (!axios.isCancel(error) && !isGet) {
      toast.error(errorMsg, {
        id: 'global-api-error',
        style: {
          background: '#162329',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Waste API services
 */
export const wasteApi = {
  analyze: (formData) => {
    return apiClient.post('/waste/analyze', formData, {
      timeout: 60000,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  confirm: (payload) => {
    return apiClient.post('/waste/confirm', payload);
  },

  getCategories: () => {
    return apiClient.get('/categories');
  }
};

/**
 * Centers API services
 */
export const centersApi = {
  getCenters: (params) => {
    return apiClient.get('/centers', { params });
  }
};

/**
 * Impact Analytics API services
 */
export const impactApi = {
  getSummary: (history) => {
    return apiClient.post('/impact/summary', { history });
  }
};

/**
 * AI Voice Assistant API services
 */
export const assistantApi = {
  ask: (payload) => {
    return apiClient.post('/assistant/ask', payload);
  }
};

/**
 * Health check
 */
export const healthApi = {
  check: () => apiClient.get('/health')
};
