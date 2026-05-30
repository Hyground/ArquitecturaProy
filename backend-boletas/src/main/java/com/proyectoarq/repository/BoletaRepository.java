package com.proyectoarq.repository;

import com.proyectoarq.model.Boleta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BoletaRepository extends JpaRepository<Boleta, Long> {
    Optional<Boleta> findByCodigoQr(String codigoQr);
    List<Boleta> findByConductorNombre(String conductorNombre);
}
