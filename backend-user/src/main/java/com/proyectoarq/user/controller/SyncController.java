package com.proyectoarq.user.controller;

import com.proyectoarq.user.model.Usuario;
import com.proyectoarq.user.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sync")
public class SyncController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/user-data/{id}")
    public ResponseEntity<Void> syncUserData(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return usuarioRepository.findById(id).map(usuario -> {
            // Aquí podríamos parsear y mezclar el JSON, por ahora lo guardamos como string
            usuario.setMetadataSincronizada(data.toString());
            usuarioRepository.save(usuario);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
