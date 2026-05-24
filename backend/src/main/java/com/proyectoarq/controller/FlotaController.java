package com.proyectoarq.controller;

import com.proyectoarq.model.Flota;
import com.proyectoarq.model.Usuario;
import com.proyectoarq.model.Rol;
import com.proyectoarq.repository.FlotaRepository;
import com.proyectoarq.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/flotas")
public class FlotaController {

    @Autowired
    private FlotaRepository flotaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR')")
    public ResponseEntity<List<Flota>> listarFlotas(Authentication auth) {
        Usuario user = usuarioRepository.findByCorreo(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();

        List<Flota> flotas;
        if (user.getRol() == Rol.ADMINISTRADOR) {
            flotas = flotaRepository.findAll();
        } else if (user.getRol() == Rol.SUPERVISOR) {
            flotas = flotaRepository.findBySupervisor(user);
        } else {
            return ResponseEntity.status(403).build();
        }

        // Initialize empty lists for vehicles if null to avoid frontend crashes
        flotas.forEach(f -> {
            if (f.getVehiculos() == null) f.setVehiculos(new ArrayList<>());
        });

        return ResponseEntity.ok(flotas);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Flota> crearFlota(@RequestBody Flota flota) {
        if (flota.getVehiculos() == null) flota.setVehiculos(new ArrayList<>());
        return ResponseEntity.ok(flotaRepository.save(flota));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Flota> actualizarFlota(@PathVariable Long id, @RequestBody Flota details) {
        return flotaRepository.findById(id).map(f -> {
            f.setNombre(details.getNombre());
            f.setSupervisor(details.getSupervisor());
            return ResponseEntity.ok(flotaRepository.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarFlota(@PathVariable Long id) {
        if (flotaRepository.existsById(id)) {
            flotaRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}