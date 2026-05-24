package com.proyectoarq.service;

import com.proyectoarq.dto.AuthResponse;
import com.proyectoarq.dto.LoginRequest;
import com.proyectoarq.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.proyectoarq.repository.UsuarioRepository usuarioRepository;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getContraseña())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getCorreo());
        final com.proyectoarq.model.Usuario user = usuarioRepository.findByCorreo(request.getCorreo()).orElse(null);
        final String nombre = (user != null) ? user.getNombre() : userDetails.getUsername();
        final String jwt = jwtUtil.generateToken(userDetails, nombre);

        return new AuthResponse(jwt);
    }
}
