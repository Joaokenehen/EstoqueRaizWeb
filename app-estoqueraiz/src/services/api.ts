import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8081', // <--- A mágica acontece aqui!
  timeout: 10000,
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