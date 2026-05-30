package com.proyectoarq.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "viajes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Viaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "boleta_id", nullable = false)
    private Boleta boleta;

    @Column(name = "vehiculo_id")
    private Long vehiculoId;

    @Column(name = "ubicacion_actual")
    private String ubicacionActual; // lat,lng

    @Column(name = "evidencia_entrega", columnDefinition = "TEXT")
    private String evidenciaEntrega;

    @Column(name = "fecha_salida")
    private LocalDateTime fechaSalida;

    @Column(name = "fecha_llegada")
    private LocalDateTime fechaLlegada;

    @Column(name = "duracion_horas")
    private Double duracionHoras;

    @Column(nullable = false)
    private String estado; // e.g., PROGRAMADO, ACEPTADO, EN_RUTA, ENTREGADO
}
