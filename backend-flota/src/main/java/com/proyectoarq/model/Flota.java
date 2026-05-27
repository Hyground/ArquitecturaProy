package com.proyectoarq.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "flotas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "supervisor_id")
    private Long supervisorId;

    @OneToMany(mappedBy = "flota", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("flota")
    private List<Vehiculo> vehiculos;
}