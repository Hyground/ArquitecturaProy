package com.proyectoarq.dto;

import lombok.Data;
import java.util.List;

@Data
public class FlotaDTO {
    private Long id;
    private String nombre;
    private Long supervisorId;
    private List<VehiculoDTO> vehiculos;
}
