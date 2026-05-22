package com.proyectoarq.controller;

import com.proyectoarq.model.Boleta;
import com.proyectoarq.service.BoletaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/sync")
public class SyncController {

    @Autowired
    private BoletaService boletaService;

    @PostMapping
    @Transactional
    public ResponseEntity<List<Boleta>> sincronizar(@RequestBody List<Boleta> boletas) {
        List<Boleta> sincronizadas = new ArrayList<>();
        for (Boleta b : boletas) {
            // Evitar duplicados si ya tienen un QR (aunque el offline suele crear nuevas)
            if (b.getCodigoQr() == null) {
                sincronizadas.add(boletaService.crearBoleta(b));
            }
        }
        return ResponseEntity.ok(sincronizadas);
    }
}
