import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Filter, Search, Calendar, MapPin, RefreshCw } from 'lucide-react';

const HistoryPage: React.FC = () => {
  const [boletas, setBoletas] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/boletas');
      setBoletas(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = boletas.filter(b => {
    const matchesStatus = filterStatus === 'TODOS' || b.estado === filterStatus;
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = b.carga.toLowerCase().includes(searchLow) || 
                          b.destino.toLowerCase().includes(searchLow) ||
                          (b.conductorNombre && b.conductorNombre.toLowerCase().includes(searchLow));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="animate-slide-up">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1>Historial de Operaciones</h1>
          <p style={{ color: 'var(--text-muted)' }}>Registro completo de todas las boletas y entregas.</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="card filters-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div className="filters-grid">
          <div className="search-input">
            <Search size={18} className="search-icon" />
            <input 
              placeholder="Buscar por carga, destino o conductor..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <Filter size={18} className="filter-icon" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="ASIGNADA">Asignadas</option>
              <option value="ACEPTADA">Aceptadas</option>
              <option value="EN_CAMINO">En Camino</option>
              <option value="ENTREGADA">Entregadas</option>
            </select>
          </div>
        </div>
      </div>

      <div className="history-table-container card">
        <table className="history-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>FECHA</th>
              <th>CARGA</th>
              <th>CONDUCTOR</th>
              <th>ORIGEN / DESTINO</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No se encontraron registros coincidentes.</td></tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id} className="animate-fade">
                  <td><span className="id-badge">ID-{String(b.id).padStart(4, '0')}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      {new Date(b.fecha).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{b.carga}</td>
                  <td>{b.conductorNombre || 'No asignado'}</td>
                  <td>
                    <div className="route-info">
                      <span>{b.origen}</span>
                      <MapPin size={12} color="var(--primary)" />
                      <span>{b.destino}</span>
                    </div>
                  </td>
                  <td><span className={`status-pill ${b.estado.toLowerCase()}`}>{b.estado}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .filters-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
        @media (max-width: 768px) { .filters-grid { grid-template-columns: 1fr; } }

        .search-input, .filter-select { position: relative; }
        .search-icon, .filter-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-input input, .filter-select select { width: 100%; padding-left: 3rem; height: 50px; background: var(--bg-main); border: 1px solid var(--border); border-radius: 12px; color: white; }

        .history-table-container { padding: 0; overflow-x: auto; }
        .history-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .history-table th { background: rgba(255,255,255,0.02); padding: 1.25rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .history-table td { padding: 1.25rem 1.5rem; border-top: 1px solid var(--border); font-size: 0.9rem; }
        
        .id-badge { background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 0.75rem; color: var(--text-muted); }
        
        .route-info { display: flex; align-items: center; gap: 8px; color: var(--text-main); font-size: 0.85rem; }

        .status-pill { font-size: 0.7rem; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; display: inline-block; }
        .status-pill.pendiente { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
        .status-pill.asignada { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }
        .status-pill.aceptada { background: rgba(129, 140, 248, 0.1); color: #818cf8; }
        .status-pill.en_camino, .status-pill.en_ruta { background: var(--primary-glow); color: var(--primary); }
        .status-pill.entregada, .status-pill.entregado { background: rgba(16, 185, 129, 0.1); color: var(--success); }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default HistoryPage;
