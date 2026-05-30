import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigation, Clock, Package, MapPin, CheckCircle, Play, QrCode, RefreshCw } from 'lucide-react';
import QRScanner from '../components/QRScanner';

const DriverPage: React.FC = () => {
  const { user } = useAuth();
  const [boletas, setBoletas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeViaje, setActiveViaje] = useState<any>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrError, setQrError] = useState('');
  const { location } = useGeolocation(!!activeViaje);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/boletas');
      const allBoletas = res.data || [];
      setBoletas(allBoletas);

      const active = allBoletas.find((b: any) => b.estado === 'EN_CAMINO' || b.estado === 'ACEPTADA');
      if (active) {
        try {
          const viajeRes = await api.get(`/viajes/boleta/${active.id}`);
          setActiveViaje(viajeRes.data);
        } catch (e) {
          setActiveViaje(null);
        }
      } else {
        setActiveViaje(null);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleScanSuccess = async (qrCode: string) => {
    try {
      setQrError('');
      const boletaRes = await api.get('/boletas');
      const targetBoleta = (boletaRes.data || []).find((b: any) => b.codigoQr === qrCode);
      
      if (!targetBoleta) {
        setQrError('Código QR no válido.');
        return;
      }

      let viajeId;
      try {
        const vRes = await api.get(`/viajes/boleta/${targetBoleta.id}`);
        viajeId = vRes.data.id;
      } catch {
        const createRes = await api.post('/viajes', { boleta: { id: targetBoleta.id }, estado: 'PROGRAMADO' });
        viajeId = createRes.data.id;
      }

      await api.post(`/viajes/${viajeId}/aceptar`);
      setShowQRScanner(false);
      fetchData();
    } catch (err) {
      setQrError('Error al procesar QR.');
    }
  };

  const handleAceptarDigital = async (boletaId: number) => {
    try {
      let viajeId;
      try {
        const vRes = await api.get(`/viajes/boleta/${boletaId}`);
        viajeId = vRes.data.id;
      } catch {
        const createRes = await api.post('/viajes', { boleta: { id: boletaId }, estado: 'PROGRAMADO' });
        viajeId = createRes.data.id;
      }
      await api.post(`/viajes/${viajeId}/aceptar`);
      fetchData();
    } catch (err) {
      alert('Error al aceptar.');
    }
  };

  const handleIniciar = async () => {
    if (!activeViaje) return;
    try {
      await api.post(`/viajes/${activeViaje.id}/iniciar`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeViaje && activeViaje.estado === 'EN_RUTA' && location) {
      api.patch(`/viajes/${activeViaje.id}/ubicacion?ubicacion=${location.lat},${location.lng}`)
        .catch(console.error);
    }
  }, [location, activeViaje]);

  const boletasPendientes = boletas.filter(b => b.estado === 'PENDIENTE' || b.estado === 'ASIGNADA');
  const isDriver = user?.rol === 'CHOFER';

  return (
    <div className="animate-slide-up">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1>Operaciones de Viaje</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestión de rutas y despacho.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isDriver && (
            <button onClick={() => setShowQRScanner(true)} className="btn btn-primary">
              <QrCode size={20} /> Aceptar por QR
            </button>
          )}
          <button onClick={fetchData} disabled={loading} className="btn btn-secondary">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <div className="driver-main-grid">
        <div className="active-trip-column">
          {activeViaje ? (
            <div className="card active-card-full">
              <div className="active-header">
                <div className={`icon-box ${activeViaje.estado === 'EN_RUTA' ? 'pulse' : ''}`}>
                  <Navigation size={32} />
                </div>
                <div>
                  <h2 style={{ margin: 0 }}>{(activeViaje.estado === 'EN_RUTA' || activeViaje.estado === 'EN_CAMINO') ? 'En Camino' : 'Aceptado'}</h2>
                  <span className="id-badge">ID-{String(activeViaje.boleta?.id).padStart(4, '0')}</span>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-box">
                  <label><Package size={14} /> Carga</label>
                  <p>{activeViaje.boleta?.carga}</p>
                </div>
                <div className="detail-box">
                  <label><MapPin size={14} /> Destino</label>
                  <p>{activeViaje.boleta?.destino}</p>
                </div>
                <div className="detail-box">
                  <label><Clock size={14} /> Origen</label>
                  <p>{activeViaje.boleta?.origen}</p>
                </div>
                <div className="detail-box">
                  <label><Clock size={14} /> Salida</label>
                  <p>{activeViaje.fechaSalida ? new Date(activeViaje.fechaSalida).toLocaleTimeString() : '--:--'}</p>
                </div>
              </div>

              {activeViaje.estado === 'ACEPTADO' ? (
                <button className="btn btn-primary start-btn" onClick={handleIniciar}>
                  <Play size={24} /> Iniciar Recorrido
                </button>
              ) : (
                <div className="info-alert-success">
                  <CheckCircle size={24} />
                  <span>Ruta activa. Trazabilidad GPS habilitada.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="card empty-full">
              <Navigation size={64} opacity={0.2} />
              <h3>Sin Viajes Activos</h3>
              <p>Acepte una asignación para comenzar.</p>
            </div>
          )}
        </div>

        <div className="pending-column">
          <div className="title-row">
            <Clock size={20} color="var(--primary)" />
            <h3>Asignaciones Pendientes</h3>
          </div>
          <div className="pending-scroll">
            {boletasPendientes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No hay pendientes.</p>
            ) : (
              boletasPendientes.filter(b => !activeViaje || b.id !== activeViaje.boleta?.id).map(b => (
                <div key={b.id} className="card pending-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="id-txt">ID-{String(b.id).padStart(4, '0')}</span>
                    <span className="tn-txt">{b.cantidad} Tn</span>
                  </div>
                  <h4>{b.carga}</h4>
                  <p className="route-txt"><MapPin size={12} /> {b.origen} → {b.destino}</p>
                  {isDriver && (
                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleAceptarDigital(b.id)}>
                      Aceptar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showQRScanner && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Escanear QR de Boleta</h3>
              <button onClick={() => setShowQRScanner(false)} className="btn-icon"><RefreshCw size={20} /></button>
            </div>
            <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
              <QRScanner onScanSuccess={handleScanSuccess} />
              {qrError && <div style={{ background: 'var(--danger)', color: 'white', padding: '10px', textAlign: 'center' }}>{qrError}</div>}
            </div>
            <button onClick={() => setShowQRScanner(false)} className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>Cerrar</button>
          </div>
        </div>
      )}

      <style>{`
        .driver-main-grid { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; align-items: start; }
        @media (max-width: 1024px) { .driver-main-grid { grid-template-columns: 1fr; } }

        .active-card-full { padding: 2.5rem; border-left: 6px solid var(--primary); }
        .active-header { display: flex; align-items: center; gap: 20px; margin-bottom: 2.5rem; }
        .icon-box { background: var(--primary-glow); color: var(--primary); padding: 15px; border-radius: 15px; }
        .id-badge { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; }

        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem; }
        .detail-box label { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; margin-bottom: 6px; }
        .detail-box p { font-size: 1.2rem; font-weight: 700; color: white; margin: 0; }

        .start-btn { width: 100%; height: 60px; font-size: 1.1rem; }
        .info-alert-success { background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 15px; font-weight: 600; border: 1px solid rgba(16, 185, 129, 0.2); }

        .empty-full { text-align: center; padding: 6rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .empty-full h3 { font-size: 1.5rem; margin: 0; }

        .title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; }
        .pending-item { padding: 1.25rem; border-bottom: 3px solid var(--border); margin-bottom: 1rem; }
        .id-txt { font-size: 0.7rem; color: var(--text-muted); font-weight: 800; }
        .tn-txt { font-size: 0.7rem; color: var(--primary); font-weight: 800; }
        .route-txt { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px; margin-top: 5px; }

        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default DriverPage;
