package com.proyectoarq;

import com.proyectoarq.dto.AuthResponse;
import com.proyectoarq.dto.LoginRequest;
import com.proyectoarq.model.Boleta;
import com.proyectoarq.model.Rol;
import com.proyectoarq.model.Usuario;
import com.proyectoarq.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class TracerBulletTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setup() {
        usuarioRepository.deleteAll();
        Usuario driver = Usuario.builder()
                .nombre("Chofer Test")
                .correo("chofer@test.com")
                .contraseña(passwordEncoder.encode("password123"))
                .rol(Rol.CHOFER)
                .build();
        usuarioRepository.save(driver);
    }

    @Test
    void testFirstTracerBullet() {
        // Paso 1: Auth
        LoginRequest loginRequest = new LoginRequest("chofer@test.com", "password123");
        ResponseEntity<AuthResponse> authResponse = restTemplate.postForEntity("/api/auth/login", loginRequest, AuthResponse.class);
        assertEquals(HttpStatus.OK, authResponse.getStatusCode());
        String jwt = authResponse.getBody().getJwt();
        assertNotNull(jwt);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(jwt);

        // Paso 2: Creación de Boleta
        Boleta boleta = Boleta.builder()
                .carga("Carga de Prueba")
                .cantidad(100.0)
                .origen("Almacén A")
                .destino("Punto B")
                .fecha(LocalDateTime.now())
                .estado("PENDIENTE")
                .build();
        
        HttpEntity<Boleta> entity = new HttpEntity<>(boleta, headers);
        ResponseEntity<Boleta> boletaResponse = restTemplate.postForEntity("/api/boletas", entity, Boleta.class);
        assertEquals(HttpStatus.OK, boletaResponse.getStatusCode());
        assertNotNull(boletaResponse.getBody().getCodigoQr());

        // Paso 3: QR (Verificar endpoint)
        ResponseEntity<byte[]> qrResponse = restTemplate.exchange(
                "/api/boletas/" + boletaResponse.getBody().getId() + "/qr",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                byte[].class
        );
        assertEquals(HttpStatus.OK, qrResponse.getStatusCode());
        assertTrue(qrResponse.getBody().length > 0);

        System.out.println("First Tracer Bullet validated successfully!");
    }
}
