package com.proyectoarq.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "boletas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Boleta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_qr", unique = true)
    private String codigoQr;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false)
    private String carga;

    @Column(nullable = false)
    private Double cantidad;

    @Column(name = "canastas")
    private Integer canastas;

    @Column(nullable = false)
    private String estado; // e.g., PENDIENTE, EN_RUTA, ENTREGADO

    @Column(nullable = false)
    private String origen;

    @Column(nullable = false)
    private String destino;
}
