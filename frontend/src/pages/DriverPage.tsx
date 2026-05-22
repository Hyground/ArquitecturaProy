import React, { useState } from 'react';
import QRScanner from '../components/QRScanner';
import { useGeolocation } from '../hooks/useGeolocation';
import api from '../services/api';
import { Camera, MapPin, CheckCircle } from 'lucide-react';

const DriverPage: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [activeViaje, setActiveViaje] = useState<any>(null);
  const { location } = useGeolocation(!!activeViaje);

  const handleScanSuccess = async (qrData: string) => {
    setScanning(false);
    try {
      // 1. Find boleta by QR
      const boletaRes = await api.get(`/boletas/qr/${qrData}`);
      const boleta = boletaRes.data;

      // 2. Start viaje with found boleta
      const response = await api.post('/viajes/iniciar', {
        boleta: { id: boleta.id },
        estado: 'EN_RUTA'
      });
      setActiveViaje(response.data);
      alert('Viaje Iniciado para: ' + boleta.carga);
    } catch (err) {
      console.error(err);
      alert('Error: Boleta no encontrada o ya en viaje');
    }
  };

  const handleCompletar = async () => {
    if (!activeViaje) return;
    try {
      await api.post(`/viajes/${activeViaje.id}/completar`);
      setActiveViaje(null);
      alert('Viaje Completado');
    } catch (err) {
      console.error(err);
    }
  };

  // Effect to update location on backend if active
  React.useEffect(() => {
    if (activeViaje && location) {
      api.patch(`/viajes/${activeViaje.id}/ubicacion?ubicacion=${location.lat},${location.lng}`)
        .catch(console.error);
    }
  }, [location, activeViaje]);

  return (
    <div>
      <h2>Panel del Chofer</h2>
      
      {!activeViaje ? (
        <div className="card">
          <h3>Escanear Boleta</h3>
          <p>Escanea el código QR de la boleta para iniciar el viaje.</p>
          {!scanning ? (
            <button className="btn" onClick={() => setScanning(true)}>
              <Camera size={20} style={{ marginRight: '8px' }} /> Abrir Cámara
            </button>
          ) : (
            <QRScanner onScanSuccess={handleScanSuccess} />
          )}
        </div>
      ) : (
        <div className="card" style={{ borderColor: '#2563eb', borderLeftWidth: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <MapPin color="#2563eb" size={24} style={{ marginRight: '8px' }} />
            <h3>Viaje en Curso</h3>
          </div>
          <p>Estado: <strong>{activeViaje.estado}</strong></p>
          {location && (
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Ubicación: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
          <button className="btn btn-secondary" onClick={handleCompletar} style={{ marginTop: '2rem' }}>
            <CheckCircle size={20} style={{ marginRight: '8px' }} /> Marcar como Entregado
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverPage;
