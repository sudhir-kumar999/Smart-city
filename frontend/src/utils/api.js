import axios from 'axios';

// Create axios instance with default config
// In Vite, use import.meta.env instead of process.env
const api = axios.create({
  baseURL: "https://smart-city-project-jpkb.onrender.com',
  withCredentials: true, // Important: Include cookies in requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add access token if available
api.interceptors.request.use(
  (config) => {
    // Access token is stored in HTTP-only cookie, so we don't need to add it manually
    // But if you store it in localStorage, you can add it here:
    // const token = localStorage.getItem('accessToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // List of public routes that don't require authentication
    const publicRoutes = [
      '/auth/login',
      '/auth/signup',
      '/auth/verify-email',
      '/auth/verify-otp',
      '/auth/refresh-token'
    ];

    // Check if the request is to a public route
    const isPublicRoute = publicRoutes.some(route => 
      originalRequest.url?.includes(route)
    );

    // If error is 401 and we haven't tried to refresh yet
    // AND it's not a public route (to prevent infinite loops)
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !isPublicRoute
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the access token
        await api.post('/auth/refresh-token');
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear retry flag and redirect to login
        originalRequest._retry = false;
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // For public routes or if refresh already attempted, just reject
    return Promise.reject(error);
  }
);

export default api;

