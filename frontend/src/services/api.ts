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
    if (!error.response) {
      // Network Error - probably offline
      const { config } = error;
      if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
        await db.offlineRequests.add({
          url: config.url || '',
          method: config.method || 'post',
          data: JSON.parse(config.data),
          timestamp: Date.now(),
        });
        console.warn('Request saved for offline sync');
      }
    }
    return Promise.reject(error);
  }
);

export const syncOfflineRequests = async () => {
  const requests = await db.offlineRequests.toArray();
  for (const req of requests) {
    try {
      await api({
        url: req.url,
        method: req.method,
        data: req.data,
      });
      await db.offlineRequests.delete(req.id!);
      console.log(`Synced: ${req.url}`);
    } catch (e) {
      console.error(`Failed to sync: ${req.url}`, e);
    }
  }
};

export default api;
