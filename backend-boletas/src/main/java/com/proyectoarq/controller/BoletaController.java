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

    @Autowired
    private com.proyectoarq.security.JwtUtil jwtUtil;

    @Autowired
    private com.proyectoarq.client.UserSyncClient userSyncClient;

    @PostMapping
    public ResponseEntity<Boleta> crearBoleta(@RequestBody Boleta boleta) {
        return ResponseEntity.ok(boletaService.crearBoleta(boleta));
    }

    @GetMapping
    public ResponseEntity<List<Boleta>> listarBoletas(org.springframework.security.core.Authentication auth, @RequestHeader("Authorization") String token) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        List<Boleta> all = boletaService.listarBoletas();

        if ("ROLE_ADMINISTRADOR".equals(role)) {
            return ResponseEntity.ok(all);
        } else if ("ROLE_SUPERVISOR".equals(role)) {
            String supervisorNombre = userSyncClient.getUserName(jwtUtil.extractUserId(token.replace("Bearer ", "")), token);
            return ResponseEntity.ok(all.stream()
                .filter(b -> (b.getSupervisorNombre() != null && b.getSupervisorNombre().equalsIgnoreCase(supervisorNombre))
                          || "PENDIENTE".equals(b.getEstado()))
                .collect(java.util.stream.Collectors.toList()));
        } else if ("ROLE_CHOFER".equals(role)) {
            String conductorNombre = userSyncClient.getUserName(jwtUtil.extractUserId(token.replace("Bearer ", "")), token);
            return ResponseEntity.ok(all.stream()
                .filter(b -> b.getConductorNombre() != null && b.getConductorNombre().equalsIgnoreCase(conductorNombre))
                .collect(java.util.stream.Collectors.toList()));
        }

        return ResponseEntity.ok(java.util.Collections.emptyList());
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

    @GetMapping("/conductor/{nombre}")
    public ResponseEntity<List<Boleta>> listarPorConductor(@PathVariable String nombre) {
        return ResponseEntity.ok(boletaService.listarPorConductor(nombre));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('SUPERVISOR')")
    public ResponseEntity<Boleta> actualizarBoleta(@PathVariable Long id, @RequestBody Boleta details) {
        Boleta boleta = boletaService.obtenerBoleta(id);
        if (boleta == null) return ResponseEntity.notFound().build();
        boleta.setCarga(details.getCarga());
        boleta.setCantidad(details.getCantidad());
        boleta.setCanastas(details.getCanastas());
        boleta.setOrigen(details.getOrigen());
        boleta.setDestino(details.getDestino());
        boleta.setEstado(details.getEstado());
        boleta.setConductorNombre(details.getConductorNombre());
        boleta.setVehiculoPlaca(details.getVehiculoPlaca());
        boleta.setSupervisorNombre(details.getSupervisorNombre());
        return ResponseEntity.ok(boletaService.crearBoleta(boleta));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarBoleta(@PathVariable Long id) {
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