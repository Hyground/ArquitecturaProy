package com.proyectoarq;

import com.proyectoarq.model.Boleta;
import com.proyectoarq.repository.BoletaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TracerBulletTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BoletaRepository boletaRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        boletaRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testBoletaLifecycle() throws Exception {
        // 1. Creación de Boleta
        Boleta boleta = Boleta.builder()
                .carga("Carga de Prueba")
                .cantidad(100.0)
                .origen("Almacén A")
                .destino("Punto B")
                .fecha(LocalDateTime.now())
                .estado("PENDIENTE")
                .build();
        
        String response = mockMvc.perform(post("/api/boletas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(boleta)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigoQr").exists())
                .andReturn().getResponse().getContentAsString();

        Boleta savedBoleta = objectMapper.readValue(response, Boleta.class);
        assertNotNull(savedBoleta.getId());

        // 2. Verificar endpoint de QR
        mockMvc.perform(get("/api/boletas/" + savedBoleta.getId() + "/qr"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG_VALUE));

        System.out.println("Boleta Tracer Bullet validated successfully!");
    }
}
