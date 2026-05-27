package com.proyectoarq.repository;

import com.proyectoarq.model.Viaje;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ViajeRepository extends JpaRepository<Viaje, Long> {
    Optional<Viaje> findByBoletaId(Long boletaId);
}
