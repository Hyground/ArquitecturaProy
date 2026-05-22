package com.proyectoarq.model;

import jakarta.persistence.*;
import lombok.*;

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

    @OneToOne
    @JoinColumn(name = "conductor_id")
    private Usuario conductor;

    @Column(nullable = false)
    private String estado; // e.g., DISPONIBLE, EN_VIAJE, MANTENIMIENTO
}
