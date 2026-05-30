package com.proyectoarq.controller;

import com.proyectoarq.model.Viaje;
import com.proyectoarq.service.ViajeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/viajes")
public class ViajeController {

    @Autowired
    private ViajeService viajeService;

    @PostMapping
    public ResponseEntity<Viaje> crearViaje(@RequestBody Viaje viaje) {
        return ResponseEntity.ok(viajeService.crearViaje(viaje));
    }

    @PostMapping("/{id}/aceptar")
    public ResponseEntity<Viaje> aceptarViaje(@PathVariable Long id) {
        return ResponseEntity.ok(viajeService.aceptarViaje(id));
    }

    @PostMapping("/{id}/iniciar")
    public ResponseEntity<Viaje> iniciarViaje(@PathVariable Long id) {
        return ResponseEntity.ok(viajeService.iniciarViaje(id));
    }

    @PatchMapping("/{id}/ubicacion")
    public ResponseEntity<Viaje> actualizarUbicacion(@PathVariable Long id, @RequestParam String ubicacion) {
        return ResponseEntity.ok(viajeService.actualizarUbicacion(id, ubicacion));
    }

    @PostMapping("/{id}/completar")
    public ResponseEntity<Viaje> completarViaje(@PathVariable Long id, @RequestBody(required = false) String evidencia) {
        return ResponseEntity.ok(viajeService.completarViaje(id, evidencia));
    }

    @GetMapping("/boleta/{boletaId}")
    public ResponseEntity<Viaje> obtenerPorBoleta(@PathVariable Long boletaId) {
        return viajeService.obtenerPorBoletaId(boletaId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Viaje>> listarViajes() {
        return ResponseEntity.ok(viajeService.listarViajes());
    }
}
