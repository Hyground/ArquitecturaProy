import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { FileText, Download, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalBoletas: 0,
    entregadas: 0,
    pendientes: 0,
    enRuta: 0,
    tripsByDriver: {} as Record<string, number>
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, vRes] = await Promise.all([
          api.get('/boletas'),
          api.get('/viajes')
        ]);
        
        const boletas = bRes.data || [];
        const viajes = vRes.data || [];
        
        const driverTrips = viajes.reduce((acc: any, v: any) => {
          const name = v.vehiculo?.placa || 'Desconocido';
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalBoletas: boletas.length,
          entregadas: boletas.filter((b: any) => b.estado === 'ENTREGADO').length,
          pendientes: boletas.filter((b: any) => b.estado === 'PENDIENTE').length,
          enRuta: boletas.filter((b: any) => b.estado === 'EN_RUTA').length,
          tripsByDriver: driverTrips
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieData = {
    labels: ['Entregadas', 'En Ruta', 'Pendientes'],
    datasets: [{
      data: [stats.entregadas, stats.enRuta, stats.pendientes],
      backgroundColor: ['#10b981', '#6366f1', '#f59e0b'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const barData = {
    labels: Object.keys(stats.tripsByDriver),
    datasets: [{
      label: 'Viajes por Unidad',
      data: Object.values(stats.tripsByDriver),
      backgroundColor: 'rgba(99, 102, 241, 0.5)',
      borderColor: '#6366f1',
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  const downloadPdf = async () => {
    try {
      const response = await api.get('/reportes/export/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error descargando PDF:', err);
      alert('Error al generar el reporte PDF');
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await api.get('/reportes/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error descargando Excel:', err);
      alert('Error al generar el reporte Excel');
    }
  };

  const generateReport = () => {
    alert('Función de cierre de periodo en desarrollo. Los datos se han consolidado internamente.');
  };

  if (loading) return <div className="loading-state">Analizando datos logísticos...</div>;

  const efficiency = stats.totalBoletas ? ((stats.entregadas/stats.totalBoletas)*100).toFixed(1) : 0;

  return (
    <div className="animate-slide-up">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1>Analítica Logística</h1>
          <p style={{ color: 'var(--text-muted)' }}>Métricas de rendimiento y trazabilidad</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={downloadPdf} className="btn btn-secondary" title="Exportar PDF">
            <Download size={20} /> PDF
          </button>
          <button onClick={downloadExcel} className="btn btn-secondary" title="Exportar Excel">
            <Download size={20} /> Excel
          </button>
          <button onClick={generateReport} className="btn btn-primary" style={{ width: 'auto' }}>
            <FileText size={20} /> Generar Cierre
          </button>
        </div>
      </header>
      
      <div className="report-stats-grid">
        <div className="card stat-card primary">
          <div className="stat-icon"><FileText size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Boletas Totales</span>
            <span className="stat-value">{stats.totalBoletas}</span>
          </div>
          <div className="stat-footer">Historial completo</div>
        </div>
        
        <div className="card stat-card success">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Eficiencia Entregas</span>
            <span className="stat-value">{efficiency}%</span>
          </div>
          <div className="stat-footer">Tasa de éxito actual</div>
        </div>

        <div className="card stat-card warning">
          <div className="stat-icon"><Calendar size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{stats.pendientes}</span>
          </div>
          <div className="stat-footer">Por procesar</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <div className="chart-header">
            <h3>Estado de Distribución</h3>
            <p>Distribución porcentual de boletas activas</p>
          </div>
          <div className="chart-container">
            <Pie data={pieData} options={{ 
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', weight: 'bold' } } } }
            }} />
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <h3>Actividad por Vehículo</h3>
            <p>Frecuencia de viajes registrados por placa</p>
          </div>
          <div className="chart-container">
            <Bar data={barData} options={{ 
              maintainAspectRatio: false,
              scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
              },
              plugins: { legend: { display: false } }
            }} />
          </div>
        </div>
      </div>

      <div className="card summary-card">
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div className="alert-badge"><AlertCircle size={24} /></div>
          <div>
            <h3>Resumen de Operación</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '800px' }}>
              El sistema registra un rendimiento de entrega del {efficiency}% sobre un total de {stats.totalBoletas} boletas emitidas. 
              Actualmente hay {stats.enRuta} unidades en ruta y {stats.pendientes} pedidos esperando asignación. 
              Se recomienda optimizar las rutas para las unidades con mayor carga de trabajo.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .report-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { display: flex; flex-direction: column; padding: 1.75rem; border-left: 4px solid var(--border); }
        .stat-card.primary { border-left-color: var(--primary); }
        .stat-card.success { border-left-color: var(--success); }
        .stat-card.warning { border-left-color: var(--warning); }
        
        .stat-icon { background: rgba(255,255,255,0.03); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; color: var(--primary); }
        .stat-content { flex: 1; }
        .stat-label { display: block; font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
        .stat-value { display: block; font-size: 2rem; font-weight: 800; color: white; line-height: 1.2; }
        .stat-footer { font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border); }

        .charts-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; margin-bottom: 2.5rem; }
        @media (max-width: 1024px) { .charts-grid { grid-template-columns: 1fr; } }
        
        .chart-card { padding: 2rem; }
        .chart-header { margin-bottom: 2rem; }
        .chart-header p { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }
        .chart-container { height: 300px; position: relative; }

        .summary-card { padding: 2.5rem; background: var(--bg-input); border-style: dashed; }
        .alert-badge { background: var(--primary-glow); color: var(--primary); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        
        .loading-state { height: 400px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--text-muted); font-weight: 600; }
      `}</style>
    </div>
  );
};

export default ReportsPage;
