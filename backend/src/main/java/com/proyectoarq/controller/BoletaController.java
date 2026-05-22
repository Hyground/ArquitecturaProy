package com.proyectoarq.controller;

import com.proyectoarq.model.Boleta;
import com.proyectoarq.service.BoletaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boletas")
public class BoletaController {

    @Autowired
    private BoletaService boletaService;

    @PostMapping
    public ResponseEntity<Boleta> crearBoleta(@RequestBody Boleta boleta) {
        return ResponseEntity.ok(boletaService.crearBoleta(boleta));
    }

    @GetMapping
    public ResponseEntity<List<Boleta>> listarBoletas() {
        return ResponseEntity.ok(boletaService.listarBoletas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Boleta> obtenerBoleta(@PathVariable Long id) {
        Boleta boleta = boletaService.obtenerBoleta(id);
        return boleta != null ? ResponseEntity.ok(boleta) : ResponseEntity.notFound().build();
    }

    @GetMapping("/qr/{qr}")
    public ResponseEntity<Boleta> obtenerBoletaPorQr(@PathVariable String qr) {
        Boleta boleta = boletaService.obtenerBoletaPorQr(qr);
        return boleta != null ? ResponseEntity.ok(boleta) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Boleta> actualizarBoleta(@PathVariable Long id, @RequestBody Boleta details) {
        Boleta boleta = boletaService.obtenerBoleta(id);
        if (boleta == null) return ResponseEntity.notFound().build();
        boleta.setCarga(details.getCarga());
        boleta.setCantidad(details.getCantidad());
        boleta.setCanastas(details.getCanastas());
        boleta.setOrigen(details.getOrigen());
        boleta.setDestino(details.getDestino());
        boleta.setEstado(details.getEstado());
        // Se puede añadir un repo.save directamente aquí o vía service
        return ResponseEntity.ok(boletaService.crearBoleta(boleta)); // crearBoleta hace el save
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarBoleta(@PathVariable Long id) {
        // Nota: en un sistema real habría que manejar la cascada con Viajes
        boletaService.eliminarBoleta(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> obtenerQR(@PathVariable Long id) throws Exception {
        Boleta boleta = boletaService.obtenerBoleta(id);
        if (boleta == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(boletaService.generarQRCode(boleta.getCodigoQr()));
    }
}
