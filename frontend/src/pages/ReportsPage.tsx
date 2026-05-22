import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalBoletas: 0,
    entregadas: 0,
    pendientes: 0,
    tripsByDriver: {} as Record<string, number>
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, vRes] = await Promise.all([
          api.get('/boletas'),
          api.get('/viajes')
        ]);
        
        const boletas = bRes.data;
        const viajes = vRes.data;
        
        const driverTrips = viajes.reduce((acc: any, v: any) => {
          const name = v.boleta.carga; // Fallback to carga or driver name if we had it
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalBoletas: boletas.length,
          entregadas: boletas.filter((b: any) => b.estado === 'ENTREGADO').length,
          pendientes: boletas.filter((b: any) => b.estado === 'PENDIENTE').length,
          tripsByDriver: driverTrips
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const pieData = {
    labels: ['Entregadas', 'Pendientes'],
    datasets: [{
      data: [stats.entregadas, stats.pendientes],
      backgroundColor: ['#22c55e', '#f59e0b'],
    }]
  };

  const generateReport = async () => {
    try {
      const data = {
        total: stats.totalBoletas,
        success_rate: ((stats.entregadas/stats.totalBoletas)*100).toFixed(1),
        generated_at: new Date().toISOString()
      };
      await api.post('/reportes?tipo=MENSUAL', JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      alert('Reporte formal guardado en historial de base de datos');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Analítica Logística</h2>
        <button onClick={generateReport} className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          Guardar Cierre
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.totalBoletas}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Boletas Totales</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>{stats.entregadas}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Entregas Éxito</div>
        </div>
      </div>

      <div className="card">
        <h3>Estado de Entregas</h3>
        <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
          <Pie data={pieData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="card">
        <h3>Resumen de Actividad</h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>El sistema registra una eficiencia del {stats.totalBoletas ? ((stats.entregadas/stats.totalBoletas)*100).toFixed(1) : 0}% en las entregas programadas.</p>
      </div>
    </div>
  );
};

export default ReportsPage;
