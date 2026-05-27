package com.proyectoarq.user.service;

import com.proyectoarq.user.dto.AuthResponse;
import com.proyectoarq.user.dto.LoginRequest;
import com.proyectoarq.user.model.Usuario;
import com.proyectoarq.user.repository.UsuarioRepository;
import com.proyectoarq.user.security.JwtUtil;
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
    private UsuarioRepository usuarioRepository;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getContraseña())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getCorreo());
        final Usuario user = usuarioRepository.findByCorreo(request.getCorreo()).orElse(null);
        final String nombre = (user != null) ? user.getNombre() : userDetails.getUsername();
        final String jwt = jwtUtil.generateToken(userDetails, nombre);

        return new AuthResponse(jwt);
    }
}
