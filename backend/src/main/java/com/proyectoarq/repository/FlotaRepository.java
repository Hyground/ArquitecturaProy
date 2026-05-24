package com.proyectoarq.repository;

import com.proyectoarq.model.Flota;
import com.proyectoarq.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FlotaRepository extends JpaRepository<Flota, Long> {
    List<Flota> findBySupervisor(Usuario supervisor);
}