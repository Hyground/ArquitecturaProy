import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Truck, User, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Vehiculo {
  id: number;
  placa: string;
  conductor: { id: number; nombre: string } | null;
  estado: string;
}

interface Usuario {
  id: number;
  nombre: string;
  rol: string;
}

const FleetManagement: React.FC = () => {
  const { user } = useAuth();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [choferes, setChoferes] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  
  const [formData, setFormData] = useState({
    placa: '',
    conductorId: '',
    estado: 'DISPONIBLE'
  });

  const fetchData = async () => {
    try {
      const [vRes, uRes] = await Promise.all([
        api.get('/vehiculos'),
        api.get('/usuarios')
      ]);
      setVehiculos(vRes.data);
      setChoferes(uRes.data.filter((u: Usuario) => u.rol === 'CHOFER'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        placa: formData.placa,
        estado: formData.estado,
        conductor: formData.conductorId ? { id: Number(formData.conductorId) } : null
      };

      if (editingVehiculo) {
        await api.put(`/vehiculos/${editingVehiculo.id}`, payload);
      } else {
        await api.post('/vehiculos', payload);
      }
      
      setShowModal(false);
      setEditingVehiculo(null);
      setFormData({ placa: '', conductorId: '', estado: 'DISPONIBLE' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al guardar vehículo');
    }
  };

  const handleEdit = (v: Vehiculo) => {
    setEditingVehiculo(v);
    setFormData({
      placa: v.placa,
      conductorId: v.conductor ? String(v.conductor.id) : '',
      estado: v.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar este vehículo de la flota?')) {
      try {
        await api.delete(`/vehiculos/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const isAdmin = user?.rol === 'ADMINISTRADOR';

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Gestión de Flota</h2>
        {isAdmin && (
          <button onClick={() => { setEditingVehiculo(null); setFormData({ placa: '', conductorId: '', estado: 'DISPONIBLE' }); setShowModal(true); }} className="btn" style={{ width: 'auto' }}>
            <Plus size={20} /> Nuevo Vehículo
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {vehiculos.map(v => (
          <div key={v.id} className="card" style={{ marginBottom: '0', position: 'relative' }}>
            {isAdmin && (
              <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => handleEdit(v)} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', cursor: 'pointer' }}><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(v.id)} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '0.75rem' }}>
                <Truck color="#475569" size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{v.placa}</div>
                <span className={`badge ${v.estado === 'DISPONIBLE' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.6rem' }}>
                  {v.estado}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <User size={14} />
              <span style={{ fontWeight: '500' }}>{v.conductor ? v.conductor.nombre : 'Sin asignar'}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>{editingVehiculo ? 'Editar Vehículo' : 'Registrar Vehículo'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Placa del Vehículo</label>
                <input required value={formData.placa} onChange={e => setFormData({...formData, placa: e.target.value})} placeholder="Ej: P-123ABC" />
              </div>
              <div className="input-group">
                <label>Asignar Conductor</label>
                <select value={formData.conductorId} onChange={e => setFormData({...formData, conductorId: e.target.value})}>
                  <option value="">-- Sin asignar --</option>
                  {choferes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Estado</label>
                <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                  <option value="EN_VIAJE">En Viaje</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn" style={{ flex: 2 }}>{editingVehiculo ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;
