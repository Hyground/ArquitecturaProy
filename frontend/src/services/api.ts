import axios from 'axios';
import { db } from './db';

const SERVICES = {
  USER_CORE: 'https://192.168.1.17:8081/api',
  BOLETAS: 'https://192.168.1.17:8082/api',
  FLOTA: 'https://192.168.1.17:8083/api',
};

// Función para determinar a qué microservicio enviar la petición
const getBaseURL = (url: string | undefined): string => {
  if (!url) return SERVICES.BOLETAS;
  if (url.startsWith('/auth') || url.startsWith('/usuarios')) return SERVICES.USER_CORE;
  if (url.startsWith('/boletas') || url.startsWith('/viajes')) return SERVICES.BOLETAS;
  if (url.startsWith('/flotas') || url.startsWith('/vehiculos') || url.startsWith('/reportes')) return SERVICES.FLOTA;
  return SERVICES.BOLETAS; // Default
};

const api = axios.create();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Encaminamiento dinámico basado en la ruta
  const baseURL = getBaseURL(config.url);
  config.url = `${baseURL}${config.url}`;
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response || error.code === 'ERR_NETWORK') {
      const { config } = error;
      if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
        // Guardamos el path relativo sin el baseURL inyectado
        const urlPath = config.url || '';
        
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
      break; 
    }
  }
};

window.addEventListener('online', syncOfflineRequests);

export default api;
