package com.proyectoarq.controller;

import com.proyectoarq.model.Reporte;
import com.proyectoarq.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    @PostMapping
    public ResponseEntity<Reporte> crearReporte(@RequestParam String tipo, @RequestBody String datos) {
        return ResponseEntity.ok(reporteService.generarReporte(tipo, datos));
    }

    @GetMapping
    public ResponseEntity<List<Reporte>> listarReportes() {
        return ResponseEntity.ok(reporteService.listarReportes());
    }
}
