package com.proyectoarq.repository;

import com.proyectoarq.model.Flota;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FlotaRepository extends JpaRepository<Flota, Long> {
    List<Flota> findBySupervisorId(Long supervisorId);
}