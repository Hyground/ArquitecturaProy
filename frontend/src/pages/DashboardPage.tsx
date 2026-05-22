import React, { useEffect, useState } from 'react';
import api, { syncOfflineRequests } from '../services/api';
import { RefreshCw, Plus, X, QrCode, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
      setBoletas(response.data);
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
      alert('Error al guardar boleta');
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
  }, []);

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Panel Control</h2>
        <button onClick={fetchBoletas} disabled={loading} className="btn-secondary" style={{ width: '40px', height: '40px', borderRadius: '50%', padding: '0' }}>
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
        <h3 style={{ color: 'white' }}>Operaciones</h3>
        <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1.25rem' }}>Gestión integral de boletas y trazabilidad logística.</p>
        <button onClick={() => { setEditingBoleta(null); setFormData({ carga: '', cantidad: 0, canastas: 0, origen: '', destino: '', estado: 'PENDIENTE' }); setShowModal(true); }} className="btn">
          <Plus size={20} /> Nueva Boleta
        </button>
      </div>

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Registros Recientes</h3>

      {boletas.map((b) => (
        <div key={b.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>#{b.id}</div>
              <strong style={{ fontSize: '1.1rem' }}>{b.carga}</strong>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge ${b.estado === 'PENDIENTE' ? 'badge-pending' : 'badge-success'}`}>
                {b.estado}
              </span>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => handleEdit(b)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(b.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ margin: '1rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>Origen</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{b.origen}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>Destino</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{b.destino}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem' }}>
              <span style={{ fontWeight: '700' }}>{b.cantidad}</span> Tn / <span style={{ fontWeight: '700' }}>{b.canastas || 0}</span> Canastas
            </div>
            <button 
              onClick={() => setQrModalId(b.id)} 
              className="btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: 'auto' }}
            >
              <QrCode size={14} /> QR
            </button>
          </div>
        </div>
      ))}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>{editingBoleta ? 'Editar Boleta' : 'Nueva Boleta'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none' }}><X /></button>
            </div>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="input-group">
                <label>Descripción Carga</label>
                <input required value={formData.carga} onChange={e => setFormData({...formData, carga: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Cantidad (Tn)</label>
                  <input required type="number" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: Number(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label>Canastas</label>
                  <input type="number" value={formData.canastas} onChange={e => setFormData({...formData, canastas: Number(e.target.value)})} />
                </div>
              </div>
              <div className="input-group">
                <label>Origen</label>
                <input required value={formData.origen} onChange={e => setFormData({...formData, origen: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Destino</label>
                <input required value={formData.destino} onChange={e => setFormData({...formData, destino: e.target.value})} />
              </div>
              {editingBoleta && (
                <div className="input-group">
                  <label>Estado</label>
                  <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_RUTA">En Ruta</option>
                    <option value="ENTREGADO">Entregado</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn" style={{ flex: 2 }}>{editingBoleta ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {qrModalId && (
        <div className="modal-overlay" onClick={() => setQrModalId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="qr-container">
              <h3>QR de Boleta #{qrModalId}</h3>
              <img src={`http://localhost:8080/api/boletas/${qrModalId}/qr`} alt="QR" className="qr-image" />
              <button onClick={() => setQrModalId(null)} className="btn">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
