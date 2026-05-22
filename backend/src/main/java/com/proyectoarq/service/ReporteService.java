package com.proyectoarq.service;

import com.proyectoarq.model.Reporte;
import com.proyectoarq.repository.ReporteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;

    public Reporte generarReporte(String tipo, String datos) {
        Reporte reporte = Reporte.builder()
                .fecha(LocalDateTime.now())
                .tipo(tipo)
                .datosGenerados(datos)
                .build();
        return reporteRepository.save(reporte);
    }

    public List<Reporte> listarReportes() {
        return reporteRepository.findAll();
    }
}
