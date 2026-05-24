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

    @PostMapping("/iniciar")
    public ResponseEntity<Viaje> iniciarViaje(@RequestBody Viaje viaje) {
        return ResponseEntity.ok(viajeService.iniciarViaje(viaje));
    }

    @PatchMapping("/{id}/ubicacion")
    public ResponseEntity<Viaje> actualizarUbicacion(@PathVariable Long id, @RequestParam String ubicacion) {
        Viaje viaje = viajeService.actualizarUbicacion(id, ubicacion);
        return viaje != null ? ResponseEntity.ok(viaje) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/completar")
    public ResponseEntity<Viaje> completarViaje(@PathVariable Long id, @RequestBody(required = false) String evidencia) {
        Viaje viaje = viajeService.completarViaje(id, evidencia);
        return viaje != null ? ResponseEntity.ok(viaje) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<Viaje>> listarViajes() {
        return ResponseEntity.ok(viajeService.listarViajes());
    }
}
