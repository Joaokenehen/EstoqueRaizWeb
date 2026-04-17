import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8081';

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@EstoqueRaiz:token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('@EstoqueRaiz:token');
    }
    return Promise.reject(error);
  }
);

export default api;
