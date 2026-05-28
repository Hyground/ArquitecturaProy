package com.proyectoarq.user.controller;

import com.proyectoarq.user.dto.AuthResponse;
import com.proyectoarq.user.dto.LoginRequest;
import com.proyectoarq.user.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private com.proyectoarq.user.repository.UsuarioRepository usuarioRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        System.out.println("Login attempt for: " + request.getCorreo());
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<com.proyectoarq.user.model.Usuario> register(@RequestBody com.proyectoarq.user.model.Usuario usuario) {
        usuario.setContraseña(passwordEncoder.encode(usuario.getContraseña()));
        return ResponseEntity.ok(usuarioRepository.save(usuario));
    }
}
