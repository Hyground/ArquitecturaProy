import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Truck, User, Plus, X, Edit2, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';

interface Usuario {
  id: number;
  nombre: string;
  rol: string;
}

interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  foto?: string;
  conductor: Usuario | null;
  estado: string;
}

interface Flota {
  id: number;
  nombre: string;
  supervisor: Usuario | null;
  vehiculos: Vehiculo[];
}

const FleetManagement: React.FC = () => {
  const { user } = useAuth();
  const [flotas, setFlotas] = useState<Flota[]>([]);
  const [choferes, setChoferes] = useState<Usuario[]>([]);
  const [supervisores, setSupervisores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Navigation State
  const [selectedFlotaId, setSelectedFlotaId] = useState<number | null>(null);
  
  // Modal States
  const [showFlotaModal, setShowFlotaModal] = useState(false);
  const [showVehiculoModal, setShowVehiculoModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form States
  const [flotaFormData, setFlotaFormData] = useState({ nombre: '', supervisorId: '' });
  const [vehiculoFormData, setVehiculoFormData] = useState({
    placa: '', marca: '', modelo: '', anio: new Date().getFullYear(),
    foto: '', conductorId: '', estado: 'DISPONIBLE'
  });

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fRes, uRes] = await Promise.all([
        api.get('/flotas'),
        api.get('/usuarios')
      ]);
      const fetchedFlotas = fRes.data || [];
      setFlotas(fetchedFlotas);
      
      const allUsers: Usuario[] = uRes.data || [];
      setChoferes(allUsers.filter(u => u.rol === 'CHOFER'));
      setSupervisores(allUsers.filter(u => u.rol === 'SUPERVISOR' || u.rol === 'ADMINISTRADOR'));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedFlota = flotas.find(f => f.id === selectedFlotaId);

  // --- Flota Handlers ---
  const handleFlotaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: flotaFormData.nombre,
      supervisor: flotaFormData.supervisorId ? { id: Number(flotaFormData.supervisorId) } : null
    };

    try {
      if (editingItem) {
        await api.put(`/flotas/${editingItem.id}`, payload);
      } else {
        await api.post('/flotas', payload);
      }
      setShowFlotaModal(false);
      fetchData();
    } catch (err) { alert('Error al guardar flota'); }
  };

  const handleEditFlota = (f: Flota) => {
    setEditingItem(f);
    setFlotaFormData({ nombre: f.nombre, supervisorId: f.supervisor ? String(f.supervisor.id) : '' });
    setShowFlotaModal(true);
  };

  const handleDeleteFlota = async (id: number) => {
    if (window.confirm('¿Eliminar flota y todos sus vehículos asociados?')) {
      await api.delete(`/flotas/${id}`);
      fetchData();
    }
  };

  // --- Vehiculo Handlers ---
  const handleVehiculoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlotaId) return;

    const payload = {
      ...vehiculoFormData,
      conductor: vehiculoFormData.conductorId ? { id: Number(vehiculoFormData.conductorId) } : null,
      flota: { id: selectedFlotaId }
    };

    try {
      if (editingItem) {
        await api.put(`/vehiculos/${editingItem.id}`, payload);
      } else {
        await api.post('/vehiculos', payload);
      }
      setShowVehiculoModal(false);
      fetchData();
    } catch (err) { alert('Error al guardar vehículo'); }
  };

  const handleEditVehiculo = (v: Vehiculo) => {
    setEditingItem(v);
    setVehiculoFormData({
      placa: v.placa, marca: v.marca || '', modelo: v.modelo || '', anio: v.anio || 2024,
      foto: v.foto || '', conductorId: v.conductor ? String(v.conductor.id) : '',
      estado: v.estado
    });
    setShowVehiculoModal(true);
  };

  const handleDeleteVehiculo = async (id: number) => {
    if (window.confirm('¿Eliminar vehículo?')) {
      await api.delete(`/vehiculos/${id}`);
      fetchData();
    }
  };

  // --- Render Helpers ---
  const getStats = (vehiculos: Vehiculo[] = []) => {
    return {
      total: vehiculos.length,
      disponibles: vehiculos.filter(v => v.estado === 'DISPONIBLE').length,
      enRuta: vehiculos.filter(v => v.estado === 'EN_VIAJE').length,
      taller: vehiculos.filter(v => v.estado === 'EN_MANTENIMIENTO').length
    };
  };

  if (selectedFlotaId && selectedFlota) {
    // --- VISTA DETALLADA DE FLOTA ---
    return (
      <div className="animate-slide-up">
        <header style={{ marginBottom: '2rem' }}>
          <button onClick={() => setSelectedFlotaId(null)} className="btn-back" style={{ marginBottom: '1rem' }}>
            <ArrowLeft size={18} /> Regresar a Flotas
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ marginBottom: '0.25rem' }}>{selectedFlota.nombre}</h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Gestionando {selectedFlota.vehiculos?.length || 0} unidades en esta flota.
              </p>
            </div>
            {isAdmin && (
              <button onClick={() => { 
                setEditingItem(null); 
                setVehiculoFormData({ placa: '', marca: '', modelo: '', anio: 2024, foto: '', conductorId: '', estado: 'DISPONIBLE' });
                setShowVehiculoModal(true); 
              }} className="btn btn-primary">
                <Plus size={20} /> Añadir Camión
              </button>
            )}
          </div>
        </header>

        <div className="fleet-grid">
          {(selectedFlota.vehiculos || []).map(v => (
            <div key={v.id} className="card vehicle-card animate-fade">
              <div className="vehicle-img-container">
                {v.foto ? <img src={v.foto} alt={v.placa} /> : <div className="placeholder"><Truck size={40} /></div>}
                <span className={`status-pill ${v.estado}`}>{v.estado}</span>
              </div>
              <div className="vehicle-body" style={{ background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: 'white' }}>{v.placa}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditVehiculo(v)} className="icon-btn primary"><Edit2 size={16} /></button>
                    {isAdmin && <button onClick={() => handleDeleteVehiculo(v.id)} className="icon-btn danger"><Trash2 size={16} /></button>}
                  </div>
                </div>
                <p className="vehicle-subtitle">{v.marca} {v.modelo} ({v.anio})</p>
                <div className="vehicle-footer">
                  <User size={14} color="var(--primary)" /> <span style={{ color: 'var(--text-main)' }}>{v.conductor?.nombre || 'Sin Chofer'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Vehiculo */}
        {showVehiculoModal && (
          <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={() => setShowVehiculoModal(false)}>
            <div className="modal animate-slide-up" style={{ zIndex: 10001 }} onClick={e => e.stopPropagation()}>
              <h3>{editingItem ? 'Editar Camión' : 'Nuevo Camión'}</h3>
              <form onSubmit={handleVehiculoSubmit}>
                <ImageUpload value={vehiculoFormData.foto} onChange={val => setVehiculoFormData({...vehiculoFormData, foto: val})} />
                <div className="input-group"><label>Placa</label><input required value={vehiculoFormData.placa} onChange={e => setVehiculoFormData({...vehiculoFormData, placa: e.target.value})} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group"><label>Marca</label><input required value={vehiculoFormData.marca} onChange={e => setVehiculoFormData({...vehiculoFormData, marca: e.target.value})} /></div>
                  <div className="input-group"><label>Modelo</label><input required value={vehiculoFormData.modelo} onChange={e => setVehiculoFormData({...vehiculoFormData, modelo: e.target.value})} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group"><label>Año</label><input type="number" value={vehiculoFormData.anio} onChange={e => setVehiculoFormData({...vehiculoFormData, anio: Number(e.target.value)})} /></div>
                  <div className="input-group"><label>Estado</label>
                    <select value={vehiculoFormData.estado} onChange={e => setVehiculoFormData({...vehiculoFormData, estado: e.target.value})}>
                      <option value="DISPONIBLE">Disponible</option>
                      <option value="EN_VIAJE">En Viaje</option>
                      <option value="EN_MANTENIMIENTO">Mantenimiento</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Chofer</label>
                  <select value={vehiculoFormData.conductorId} onChange={e => setVehiculoFormData({...vehiculoFormData, conductorId: e.target.value})}>
                    <option value="">-- Sin asignar --</option>
                    {choferes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowVehiculoModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .btn-back { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-main); display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer; transition: 0.3s; padding: 0.5rem 1rem; border-radius: var(--radius-md); }
          .btn-back:hover { background: rgba(255,255,255,0.1); transform: translateX(-4px); }
          .fleet-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
          .vehicle-card { padding: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); }
          .vehicle-img-container { height: 160px; position: relative; background: var(--bg-darker); }
          .vehicle-img-container img { width: 100%; height: 100%; object-fit: cover; }
          .vehicle-img-container .placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0.2; color: white; }
          .status-pill { position: absolute; top: 12px; right: 12px; font-size: 0.65rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
          .status-pill.DISPONIBLE { background: var(--success); color: #064e3b; }
          .status-pill.EN_VIAJE { background: var(--warning); color: #78350f; }
          .status-pill.EN_MANTENIMIENTO { background: var(--danger); color: #fff; }
          .vehicle-body { padding: 1.5rem; }
          .vehicle-subtitle { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; }
          .vehicle-footer { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; background: rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border); }
          .icon-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; color: var(--text-muted); }
          .icon-btn.primary:hover { color: var(--primary); border-color: var(--primary); background: var(--primary-glow); }
          .icon-btn.danger:hover { color: var(--danger); border-color: var(--danger); background: rgba(239, 68, 68, 0.1); }
        `}</style>
      </div>
    );
  }

  // --- VISTA GLOBAL DE FLOTAS ---
  return (
    <div className="animate-slide-up">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Gestión de Flotas</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {isAdmin ? `Viendo todas las flotas corporativas` : `Sus flotas bajo supervisión`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '0.75rem' }}>
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          {isAdmin && (
            <button onClick={() => { 
              setEditingItem(null); 
              setFlotaFormData({ nombre: '', supervisorId: '' }); 
              setShowFlotaModal(true); 
            }} className="btn btn-primary">
              <Plus size={20} /> Nueva Flota
            </button>
          )}
        </div>
      </header>

      {loading && flotas.length === 0 ? <p>Cargando flotas...</p> : (
        <div className="flota-grid">
          {flotas.map(f => {
            const stats = getStats(f.vehiculos);
            return (
              <div key={f.id} className="card flota-card animate-fade" onClick={() => setSelectedFlotaId(f.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'white', letterSpacing: '-0.02em' }}>{f.nombre}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                      <div className={`indicator ${!f.supervisor ? 'empty' : ''}`} />
                      <span style={{ fontSize: '0.8rem', color: f.supervisor ? 'var(--text-muted)' : 'var(--danger)', fontWeight: 600 }}>
                        {f.supervisor ? f.supervisor.nombre : 'Sin Supervisor Asignado'}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleEditFlota(f)} className="icon-btn primary" title="Editar"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteFlota(f.id)} className="icon-btn danger" title="Eliminar"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>

                <div className="flota-stats-container">
                  <div className="stat-group">
                    <div className="stat-item">
                      <span className="stat-val">{stats.total}</span>
                      <span className="stat-label">Total</span>
                    </div>
                  </div>
                  <div className="stat-group main">
                    <div className="stat-item">
                      <span className="stat-val success">{stats.disponibles}</span>
                      <span className="stat-label">Libres</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-val warning">{stats.enRuta}</span>
                      <span className="stat-label">Ruta</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-val danger">{stats.taller}</span>
                      <span className="stat-label">Taller</span>
                    </div>
                  </div>
                </div>

                <div className="flota-footer">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={14} /> Gestionar Unidades
                  </span>
                  <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Flota */}
      {showFlotaModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={() => setShowFlotaModal(false)}>
          <div className="modal animate-slide-up" style={{ zIndex: 10001, maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingItem ? 'Editar Flota' : 'Nueva Flota'}</h3>
              <button onClick={() => setShowFlotaModal(false)} className="icon-btn"><X size={20}/></button>
            </div>
            <form onSubmit={handleFlotaSubmit}>
              <div className="input-group">
                <label>Nombre de la Flota</label>
                <input required value={flotaFormData.nombre} onChange={e => setFlotaFormData({...flotaFormData, nombre: e.target.value})} placeholder="Ej: Flota Occidente" />
              </div>
              <div className="input-group">
                <label>Supervisor Responsable</label>
                <select value={flotaFormData.supervisorId} onChange={e => setFlotaFormData({...flotaFormData, supervisorId: e.target.value})}>
                  <option value="">-- Seleccionar Supervisor --</option>
                  {supervisores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowFlotaModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingItem ? 'Guardar Cambios' : 'Crear Flota'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .flota-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
        .flota-card { cursor: pointer; border-bottom: 2px solid transparent; transition: 0.3s; background: var(--bg-card); position: relative; overflow: hidden; }
        .flota-card:hover { transform: translateY(-4px); border-bottom-color: var(--primary); background: rgba(255,255,255,0.02); }
        .indicator { width: 10px; height: 10px; border-radius: 50%; background: var(--success); box-shadow: 0 0 10px var(--success); }
        .indicator.empty { background: var(--danger); box-shadow: 0 0 10px var(--danger); animation: blink 1.5s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        
        .flota-stats-container { 
          display: flex; 
          gap: 12px; 
          margin-bottom: 1.5rem;
        }
        .stat-group { 
          background: rgba(255,255,255,0.03); 
          padding: 1rem; 
          border-radius: 12px; 
          display: flex; 
          gap: 1.5rem;
          border: 1px solid var(--border);
        }
        .stat-group.main { flex: 1; justify-content: space-around; }
        .stat-item { display: flex; flex-direction: column; align-items: center; }
        .stat-val { font-size: 1.25rem; font-weight: 800; color: white; line-height: 1; }
        .stat-val.success { color: var(--success); }
        .stat-val.warning { color: var(--warning); }
        .stat-val.danger { color: var(--danger); }
        .stat-label { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-top: 6px; letter-spacing: 0.05em; }

        .flota-footer { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          font-size: 0.85rem; 
          color: var(--primary); 
          font-weight: 700;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default FleetManagement;