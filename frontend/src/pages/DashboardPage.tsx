import React, { useEffect, useState } from 'react';
import api, { syncOfflineRequests } from '../services/api';
import { RefreshCw, Plus, X, QrCode, Edit2, Trash2, MapPin, Scale, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QRModal from '../components/QRModal';

interface Boleta {
  id: number;
  carga: string;
  cantidad: number;
  canastas: number;
  estado: string;
  origen: string;
  destino: string;
  codigoQr: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [qrModalId, setQrModalId] = useState<number | null>(null);
  const [editingBoleta, setEditingBoleta] = useState<Boleta | null>(null);
  
  const [formData, setFormData] = useState({
    carga: '',
    cantidad: 0,
    canastas: 0,
    origen: '',
    destino: '',
    estado: 'PENDIENTE'
  });

  const fetchBoletas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/boletas');
      setBoletas(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBoleta) {
        await api.put(`/boletas/${editingBoleta.id}`, formData);
      } else {
        await api.post('/boletas', {
          ...formData,
          fecha: new Date().toISOString(),
        });
      }
      setShowModal(false);
      setEditingBoleta(null);
      setFormData({ carga: '', cantidad: 0, canastas: 0, origen: '', destino: '', estado: 'PENDIENTE' });
      fetchBoletas();
    } catch (err) {
      console.error(err);
      alert('Error al guardar boleta.');
      setShowModal(false);
      fetchBoletas();
    }
  };

  const handleEdit = (b: Boleta) => {
    setEditingBoleta(b);
    setFormData({
      carga: b.carga,
      cantidad: b.cantidad,
      canastas: b.canastas || 0,
      origen: b.origen,
      destino: b.destino,
      estado: b.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar esta boleta permanentemente?')) {
      try {
        await api.delete(`/boletas/${id}`);
        fetchBoletas();
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchBoletas();
    syncOfflineRequests();
    
    const interval = setInterval(syncOfflineRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  return (
    <div className="animate-slide-up">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Panel de Control</h1>
          <p style={{ color: 'var(--text-muted)' }}>Bienvenido, {user?.nombre}</p>
        </div>
        <button onClick={fetchBoletas} disabled={loading} className="btn btn-secondary" style={{ padding: '0.75rem' }}>
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="card hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.75rem' }}>Operaciones</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', maxWidth: '400px' }}>Gestión de boletas y trazabilidad logística en tiempo real.</p>
          </div>
          <button onClick={() => { setEditingBoleta(null); setFormData({ carga: '', cantidad: 0, canastas: 0, origen: '', destino: '', estado: 'PENDIENTE' }); setShowModal(true); }} className="btn btn-hero">
            <Plus size={24} /> Nueva Boleta
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '3rem 0 1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Registros Recientes</h3>
        <div className="status-legend">
          <span className="legend-item"><span className="dot pending"></span> Pendiente</span>
          <span className="legend-item"><span className="dot progress"></span> En Ruta</span>
          <span className="legend-item"><span className="dot success"></span> Entregado</span>
        </div>
      </div>

      <div className="boleta-grid">
        {boletas.map((b) => (
          <div key={b.id} className={`card boleta-card animate-fade ${b.estado.toLowerCase()}`}>
            <div className="boleta-header">
              <div className="boleta-id">ID-{String(b.id).padStart(4, '0')}</div>
              <span className={`status-tag ${b.estado}`}>
                {b.estado}
              </span>
            </div>
            
            <h4 className="boleta-title">{b.carga}</h4>

            <div className="boleta-path">
              <div className="path-node">
                <MapPin size={14} />
                <span>{b.origen}</span>
              </div>
              <div className="path-line"></div>
              <div className="path-node">
                <MapPin size={14} />
                <span>{b.destino}</span>
              </div>
            </div>

            <div className="boleta-metrics">
              <div className="metric">
                <Scale size={16} />
                <span className="metric-val">{b.cantidad} <small>Tn</small></span>
              </div>
              <div className="metric">
                <Package size={16} />
                <span className="metric-val">{b.canastas} <small>Canastas</small></span>
              </div>
            </div>

            <div className="boleta-actions">
              <button onClick={() => setQrModalId(b.id)} className="btn btn-action secondary">
                <QrCode size={18} /> Código QR
              </button>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(b)} className="btn-icon">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="btn-icon danger">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay animate-fade" style={{ zIndex: 10000 }} onClick={() => setShowModal(false)}>
          <div className="modal animate-slide-up" style={{ zIndex: 10001, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0 }}>{editingBoleta ? 'Actualizar Boleta' : 'Nueva Boleta'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="input-group">
                <label>Descripción de la Carga</label>
                <input required value={formData.carga} onChange={e => setFormData({...formData, carga: e.target.value})} placeholder="Ej: Tomate Industrial de Exportación" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="input-group">
                  <label>Cantidad (Toneladas)</label>
                  <input required type="number" step="0.01" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: Number(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label>Número de Canastas</label>
                  <input type="number" value={formData.canastas} onChange={e => setFormData({...formData, canastas: Number(e.target.value)})} />
                </div>
              </div>
              <div className="input-group">
                <label>Punto de Origen</label>
                <input required value={formData.origen} onChange={e => setFormData({...formData, origen: e.target.value})} placeholder="Finca o Almacén de Salida" />
              </div>
              <div className="input-group">
                <label>Punto de Destino</label>
                <input required value={formData.destino} onChange={e => setFormData({...formData, destino: e.target.value})} placeholder="Planta de Procesamiento" />
              </div>
              {editingBoleta && (
                <div className="input-group">
                  <label>Estado de Seguimiento</label>
                  <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_RUTA">En Ruta</option>
                    <option value="ENTREGADO">Entregado</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingBoleta ? 'Confirmar Cambios' : 'Registrar Boleta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrModalId && (
        <QRModal 
          boletaId={qrModalId} 
          codigoQr={boletas.find(b => b.id === qrModalId)?.codigoQr || ''}
          onClose={() => setQrModalId(null)} 
        />
      )}

      <style>{`
        .hero-card { 
          background: linear-gradient(135deg, var(--primary) 0%, #4338ca 100%); 
          border: none; 
          padding: 2.5rem;
          box-shadow: 0 10px 25px var(--primary-glow);
        }
        .btn-hero { background: white; color: var(--primary); padding: 1rem 2rem; font-size: 1.1rem; border-radius: 1rem; border: none; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; font-weight: 700; }
        .btn-hero:hover { background: #f8fafc; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }

        .boleta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2rem; }
        .boleta-card { position: relative; border-top: 4px solid var(--border); transition: 0.3s; }
        .boleta-card:hover { transform: translateY(-5px); border-color: var(--primary); }
        .boleta-card.pendiente { border-top-color: var(--warning); }
        .boleta-card.en_ruta { border-top-color: var(--primary); }
        .boleta-card.entregado { border-top-color: var(--success); }

        .boleta-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .boleta-id { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; }
        .status-tag { font-size: 0.65rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
        .status-tag.PENDIENTE { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
        .status-tag.EN_RUTA { background: var(--primary-glow); color: var(--primary); }
        .status-tag.ENTREGADO { background: rgba(16, 185, 129, 0.1); color: var(--success); }

        .boleta-title { font-size: 1.25rem; margin-bottom: 1.5rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 700; }
        
        .boleta-path { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 8px; position: relative; }
        .path-node { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: var(--text-main); font-weight: 500; }
        .path-node svg { color: var(--primary); flex-shrink: 0; }
        .path-line { width: 1px; height: 12px; background: var(--border); margin-left: 7px; }

        .boleta-metrics { display: flex; gap: 1rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 12px; }
        .metric { display: flex; align-items: center; gap: 8px; flex: 1; }
        .metric svg { color: var(--text-muted); }
        .metric-val { font-size: 1rem; font-weight: 700; color: white; }
        .metric-val small { font-size: 0.7rem; color: var(--text-muted); font-weight: 400; }

        .boleta-actions { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); margin-top: 1rem; padding-top: 1.25rem; }
        .btn-action { font-size: 0.85rem; padding: 0.6rem 1rem; }
        .btn-icon { background: rgba(255,255,255,0.05); border: none; color: var(--text-main); padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-icon:hover { background: rgba(255,255,255,0.1); color: var(--primary); }
        .btn-icon.danger:hover { color: var(--danger); background: rgba(239, 68, 68, 0.1); }

        .status-legend { display: flex; gap: 1rem; font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.pending { background: var(--warning); }
        .dot.progress { background: var(--primary); }
        .dot.success { background: var(--success); }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default DashboardPage;