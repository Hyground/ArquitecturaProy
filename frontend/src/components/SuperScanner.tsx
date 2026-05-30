import React, { useState } from 'react';
import QRScanner from './QRScanner';
import api from '../services/api';
import { X, User, Truck, Shield, MapPin, Clock, CheckCircle, Package } from 'lucide-react';

interface SuperScannerProps {
  onClose: () => void;
}

const SuperScanner: React.FC<SuperScannerProps> = ({ onClose }) => {
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleScan = async (qrData: string) => {
    setScanning(false);
    setLoading(true);
    try {
      const boletaRes = await api.get(`/boletas/qr/${qrData}`);
      const boleta = boletaRes.data;
      
      let viaje = null;
      try {
        const viajeRes = await api.get(`/viajes/boleta/${boleta.id}`);
        viaje = viajeRes.data;
      } catch (e) {
        console.log('No hay viaje registrado aún.');
      }

      setData({ boleta, viaje });
    } catch (err) {
      alert('Código QR no reconocido.');
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarEntregado = async () => {
    if (!data?.viaje) return;
    try {
      await api.post(`/viajes/${data.viaje.id}/completar`);
      alert('¡Carga marcada como ENTREGADA exitosamente!');
      onClose();
    } catch (err) {
      alert('Error al marcar entrega.');
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal animate-slide-up" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="modal-header">
          <h3>Escáner de Trazabilidad</h3>
          <button onClick={onClose} className="btn-icon"><X size={24} /></button>
        </div>

        {scanning ? (
          <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
            <QRScanner onScanSuccess={handleScan} />
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0 }}>Posicione el código QR frente a la cámara</p>
            </div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
              <X size={32} /> {/* Using X as a placeholder for a spinner if needed, but animate-spin is already defined */}
            </div>
            <p style={{ color: 'var(--text-muted)' }}>Cargando información del viaje...</p>
          </div>
        ) : data ? (
          <div className="scan-results">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className={`badge ${data.boleta.estado.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                {data.boleta.estado}
              </span>
            </div>

            <div className="grid-details">
              <div className="detail-item">
                <label><User size={14} /> Conductor</label>
                <p>{data.boleta.conductorNombre || 'No asignado'}</p>
              </div>
              <div className="detail-item">
                <label><Truck size={14} /> Vehículo</label>
                <p>{data.boleta.vehiculoPlaca || 'No asignado'}</p>
              </div>
              <div className="detail-item">
                <label><Shield size={14} /> Supervisor</label>
                <p>{data.boleta.supervisorNombre || 'No asignado'}</p>
              </div>
              <div className="detail-item">
                <label><Package size={14} /> Carga</label>
                <p>{data.boleta.carga} ({data.boleta.cantidad} Tn)</p>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <label><MapPin size={14} /> Ruta</label>
                <p>{data.boleta.origen} <span style={{ color: 'var(--primary)' }}>→</span> {data.boleta.destino}</p>
              </div>
              
              {data.viaje?.fechaSalida && (
                <div className="detail-item">
                  <label><Clock size={14} /> Hora de Salida</label>
                  <p>{new Date(data.viaje.fechaSalida).toLocaleString()}</p>
                </div>
              )}

              {data.viaje?.duracionHoras > 0 && (
                <div className="detail-item">
                  <label><Clock size={14} /> Duración de Viaje</label>
                  <p>{data.viaje.duracionHoras.toFixed(2)} Horas</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2.5rem' }}>
              {(data.boleta.estado === 'EN_CAMINO' || data.boleta.estado === 'EN_RUTA') && (
                <button className="btn btn-primary" onClick={handleMarcarEntregado} style={{ width: '100%', background: 'var(--success)', height: '56px', fontSize: '1.1rem' }}>
                  <CheckCircle size={22} /> Confirmar Entrega Final
                </button>
              )}
              
              <button className="btn btn-secondary" onClick={() => setScanning(true)} style={{ width: '100%', height: '50px' }}>
                Escanear Otro Código
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
        .detail-item label { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-size: 0.7rem; 
          color: var(--text-muted); 
          text-transform: uppercase; 
          font-weight: 800;
          margin-bottom: 6px;
        }
        .detail-item p { font-size: 1.1rem; font-weight: 600; color: white; margin: 0; }
        .grid-details { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 1.5rem;
          background: rgba(255,255,255,0.03); 
          padding: 2rem; 
          border-radius: 16px; 
          border: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
};

export default SuperScanner;
