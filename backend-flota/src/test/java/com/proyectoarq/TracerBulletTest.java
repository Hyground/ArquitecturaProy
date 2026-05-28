package com.proyectoarq;

import com.proyectoarq.model.Vehiculo;
import com.proyectoarq.repository.VehiculoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TracerBulletTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VehiculoRepository vehiculoRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        vehiculoRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testVehiculoLifecycle() throws Exception {
        // 1. Creación de Vehículo
        Vehiculo vehiculo = Vehiculo.builder()
                .placa("ABC-123")
                .marca("Volvo")
                .modelo("FH16")
                .estado("DISPONIBLE")
                .build();
        
        String response = mockMvc.perform(post("/api/vehiculos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehiculo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.placa").value("ABC-123"))
                .andReturn().getResponse().getContentAsString();

        Vehiculo savedVehiculo = objectMapper.readValue(response, Vehiculo.class);
        assertNotNull(savedVehiculo.getId());

        // 2. Listar Vehículos
        mockMvc.perform(get("/api/vehiculos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].placa").value("ABC-123"));

        System.out.println("Vehiculo Tracer Bullet validated successfully!");
    }
}
