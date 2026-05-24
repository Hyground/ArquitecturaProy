package com.proyectoarq.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "vehiculos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehiculo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String placa;

    @Column
    private String marca;

    @Column
    private String modelo;

    @Column
    private Integer anio;

    @Column(columnDefinition = "TEXT")
    private String foto;

    @OneToOne
    @JoinColumn(name = "conductor_id")
    private Usuario conductor;

    @ManyToOne
    @JoinColumn(name = "flota_id")
    @JsonIgnoreProperties("vehiculos")
    private Flota flota;

    @Column(nullable = false)
    private String estado; // e.g., DISPONIBLE, EN_VIAJE, MANTENIMIENTO
}