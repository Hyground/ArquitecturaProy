package com.proyectoarq.repository;

import com.proyectoarq.model.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {
    Optional<Vehiculo> findByPlaca(String placa);
    
    @Query("SELECT v.id FROM Vehiculo v WHERE v.flota.supervisorId = :supervisorId")
    List<Long> findIdsBySupervisorId(Long supervisorId);
}
