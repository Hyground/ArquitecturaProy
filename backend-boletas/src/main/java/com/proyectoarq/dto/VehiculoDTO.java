package com.proyectoarq.dto;

import lombok.Data;

@Data
public class VehiculoDTO {
    private Long id;
    private String placa;
    private String marca;
    private String modelo;
    private Integer anio;
    private String estado;
    private Long conductorId;
}
