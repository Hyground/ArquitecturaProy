import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { UserPlus, Edit2, Trash2, X, ShieldAlert } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  fotoPerfil?: string;
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
    rol: 'CHOFER',
    fotoPerfil: ''
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
      setFormData({ nombre: '', correo: '', contraseña: '', rol: 'CHOFER', fotoPerfil: '' });
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
      rol: user.rol,
      fotoPerfil: user.fotoPerfil || ''
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
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Directorio del Personal</h2>
          <p style={{ color: 'var(--text-muted)' }}>Administración de roles y perfiles</p>
        </div>
        <button onClick={() => { setEditingUser(null); setFormData({ nombre: '', correo: '', contraseña: '', rol: 'CHOFER', fotoPerfil: '' }); setShowModal(true); }} className="btn btn-primary" style={{ width: 'auto' }}>
          <UserPlus size={20} /> Nuevo Usuario
        </button>
      </div>

      {loading ? <p>Cargando personal...</p> : (
        <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--bg-input)' }}>
              <tr>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Perfil</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Rol</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar">
                      {u.fotoPerfil ? (
                        <img src={u.fotoPerfil} alt={u.nombre} />
                      ) : (
                        <div className="avatar-placeholder">{u.nombre.charAt(0)}</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'white' }}>{u.nombre}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.correo}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${u.rol === 'ADMINISTRADOR' ? 'badge-danger' : u.rol === 'SUPERVISOR' ? 'badge-warning' : 'badge-success'}`}>
                      {u.rol === 'ADMINISTRADOR' && <ShieldAlert size={12} style={{marginRight: '4px', display:'inline'}}/>}
                      {u.rol}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(u)} className="icon-btn primary" title="Editar"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(u.id)} className="icon-btn danger" title="Eliminar"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={() => setShowModal(false)}>
          <div className="modal animate-slide-up" style={{ zIndex: 10001, maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingUser ? 'Editar Perfil' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setShowModal(false)} className="icon-btn"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              
              <ImageUpload 
                value={formData.fotoPerfil} 
                onChange={(val) => setFormData({...formData, fotoPerfil: val})} 
              />

              <div className="input-group">
                <label>Nombre Completo</label>
                <input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: Juan Pérez" />
              </div>
              <div className="input-group">
                <label>Correo Electrónico</label>
                <input required type="email" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} placeholder="juan@ejemplo.com" />
              </div>
              <div className="input-group">
                <label>Contraseña {editingUser && '(Dejar en blanco para no cambiar)'}</label>
                <input required={!editingUser} type="password" value={formData.contraseña} onChange={e => setFormData({...formData, contraseña: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Rol del Sistema</label>
                <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
                  <option value="ADMINISTRADOR">Administrador</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="CHOFER">Chofer</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingUser ? 'Actualizar' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .avatar {
          width: 44px; height: 44px;
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-darker);
          flex-shrink: 0;
          border: 1px solid var(--border);
        }
        .avatar img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .avatar-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; color: var(--primary);
          background: var(--primary-glow);
        }
        .badge-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); }
        .badge-warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.2); }
        .badge-success { background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); }
        
        .icon-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; color: var(--text-muted); }
        .icon-btn.primary:hover { color: var(--primary); border-color: var(--primary); background: var(--primary-glow); }
        .icon-btn.danger:hover { color: var(--danger); border-color: var(--danger); background: rgba(239, 68, 68, 0.1); }
      `}</style>
    </div>
  );
};

export default UserManagement;