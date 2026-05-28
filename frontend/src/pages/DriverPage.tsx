import React, { useState, useEffect } from 'react';
import QRScanner from '../components/QRScanner';
import { useGeolocation } from '../hooks/useGeolocation';
import api from '../services/api';
import { Camera, MapPin, CheckCircle, Package, Navigation, Clock, X } from 'lucide-react';

const DriverPage: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [activeViaje, setActiveViaje] = useState<any>(null);
  const { location } = useGeolocation(!!activeViaje);

  const playBeep = () => {
    try {
      if (navigator.vibrate) navigator.vibrate(200);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 150);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const handleScanSuccess = async (qrData: string) => {
    setScanning(false);
    playBeep();
    try {
      const boletaRes = await api.get(`/boletas/qr/${qrData}`);
      const boleta = boletaRes.data;

      const response = await api.post('/viajes/iniciar', {
        boleta: { id: boleta.id },
        estado: 'EN_RUTA'
      });
      setActiveViaje(response.data);
    } catch (err) {
      console.error(err);
      alert('Error: Boleta no válida o ya asignada.');
    }
  };

  const handleCompletar = async () => {
    if (!activeViaje) return;
    try {
      await api.post(`/viajes/${activeViaje.id}/completar`);
      setActiveViaje(null);
      alert('Viaje finalizado con éxito.');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeViaje && location) {
      api.patch(`/viajes/${activeViaje.id}/ubicacion?ubicacion=${location.lat},${location.lng}`)
        .catch(console.error);
    }
  }, [location, activeViaje]);

  const [manualCode, setManualCode] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScanSuccess(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="animate-slide-up">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Análisis del Chofer</h1>
        <p style={{ color: 'var(--text-muted)' }}>Seguimiento y control de viajes</p>
      </header>
      
      {!activeViaje ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ background: 'var(--primary-glow)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1.5rem', margin: '0 auto 1.5rem' }}>
            <Camera color="var(--primary)" size={32} />
          </div>
          <h3>Iniciar Nuevo Viaje</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Escanea el código QR o ingresa el código manualmente para comenzar.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={() => setScanning(true)} style={{ width: '100%', maxWidth: '300px', padding: '1rem' }}>
              Abrir Cámara para Escaneo
            </button>
            
            <div style={{ width: '100%', maxWidth: '300px', display: 'flex', gap: '8px', marginTop: '1rem' }}>
              <input 
                type="text" 
                placeholder="Código Manual" 
                value={manualCode} 
                onChange={e => setManualCode(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'white' }}
              />
              <button className="btn btn-secondary" onClick={handleManualSubmit} style={{ padding: '0.75rem' }}>
                Ir
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="active-trip-view">
          <div className="card" style={{ borderColor: 'var(--primary)', borderLeftWidth: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <Navigation className="pulse" color="var(--primary)" size={24} />
              <h3 style={{ margin: 0 }}>Viaje en Curso</h3>
            </div>
            
            <div className="trip-details">
              <div className="trip-row">
                <Package size={18} color="var(--text-muted)" />
                <div>
                  <label>Carga Transportada</label>
                  <p>{activeViaje.boleta?.carga || 'Cargando...'}</p>
                </div>
              </div>
              
              <div className="trip-row">
                <Clock size={18} color="var(--text-muted)" />
                <div>
                  <label>Hora de Salida</label>
                  <p>{new Date(activeViaje.fechaSalida).toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="trip-row">
                <MapPin size={18} color="var(--text-muted)" />
                <div>
                  <label>Ubicación Actual (GPS)</label>
                  <p>{location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Obteniendo señal...'}</p>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleCompletar} style={{ marginTop: '2.5rem', background: 'var(--success)' }}>
              <CheckCircle size={20} /> Finalizar y Marcar Entrega
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Scanner Overlay */}
      {scanning && (
        <div className="fullscreen-scanner">
          <div className="scanner-header">
            <h3>Escaneando Boleta</h3>
            <button onClick={() => setScanning(false)} className="close-btn">
              <X size={24} />
            </button>
          </div>
          <div className="scanner-viewport">
            <QRScanner onScanSuccess={handleScanSuccess} />
          </div>
        </div>
      )}

      <style>{`
        .trip-details {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .trip-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .trip-row label {
          display: block;
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .trip-row p {
          font-weight: 600;
          font-size: 1rem;
          color: white;
        }

        .pulse {
          animation: pulse-animation 2s infinite;
        }

        @keyframes pulse-animation {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .fullscreen-scanner {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #000;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }

        .scanner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: rgba(0,0,0,0.5);
          color: white;
        }

        .close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .scanner-viewport {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .scanner-viewport > div {
          width: 100%;
          max-width: 500px;
        }
      `}</style>
    </div>
  );
};

export default DriverPage;