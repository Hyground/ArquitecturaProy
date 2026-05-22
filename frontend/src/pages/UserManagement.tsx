import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { UserPlus, Edit2, Trash2, X } from 'lucide-react';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

const UserManagement: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    rol: 'CHOFER'
  });

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/usuarios/${editingUser.id}`, formData);
      } else {
        await api.post('/usuarios', formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ nombre: '', correo: '', contraseña: '', rol: 'CHOFER' });
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert('Error al procesar usuario');
    }
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      correo: user.correo,
      contraseña: '',
      rol: user.rol
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        fetchUsuarios();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Gestión de Usuarios</h2>
        <button onClick={() => { setEditingUser(null); setFormData({ nombre: '', correo: '', contraseña: '', rol: 'CHOFER' }); setShowModal(true); }} className="btn" style={{ width: 'auto' }}>
          <UserPlus size={20} /> Nuevo Usuario
        </button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>Rol</th>
                <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.8rem', color: '#64748b' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600' }}>{u.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.correo}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-info`}>{u.rol}</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(u)} style={{ background: 'none', border: 'none', color: '#2563eb', marginRight: '0.5rem', cursor: 'pointer' }}><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: Juan Pérez" />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input required type="email" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} placeholder="juan@ejemplo.com" />
              </div>
              <div className="form-group">
                <label>Contraseña {editingUser && '(Dejar en blanco para no cambiar)'}</label>
                <input required={!editingUser} type="password" value={formData.contraseña} onChange={e => setFormData({...formData, contraseña: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Rol del Sistema</label>
                <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                  <option value="ADMINISTRADOR">Administrador</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="CHOFER">Chofer</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn" style={{ flex: 2 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
