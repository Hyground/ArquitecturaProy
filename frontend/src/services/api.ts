import axios from 'axios';
import { db } from './db';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response || error.code === 'ERR_NETWORK') {
      // Network Error - probably offline
      const { config } = error;
      // Only store data-mutating requests
      if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
        const urlPath = config.url?.replace('http://localhost:8080/api', '') || '';
        
        await db.offlineRequests.add({
          url: urlPath,
          method: config.method || 'post',
          data: config.data ? JSON.parse(config.data) : null,
          timestamp: Date.now(),
        });
        console.warn('Operación guardada localmente por falta de conexión.');
      }
    }
    return Promise.reject(error);
  }
);

export const syncOfflineRequests = async () => {
  if (!navigator.onLine) return;

  const requests = await db.offlineRequests.toArray();
  if (requests.length === 0) return;

  console.log(`Intentando sincronizar ${requests.length} operaciones...`);

  for (const req of requests) {
    try {
      await api({
        url: req.url,
        method: req.method,
        data: req.data,
      });
      await db.offlineRequests.delete(req.id!);
      console.log(`Sincronizado: ${req.url}`);
    } catch (e) {
      console.error(`Error al sincronizar: ${req.url}`, e);
      // Stop sync if we hit a server error to preserve order
      break; 
    }
  }
};

// Automatic sync when coming back online
window.addEventListener('online', syncOfflineRequests);

export default api;
