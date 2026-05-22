package com.proyectoarq.service;

import com.proyectoarq.model.Viaje;
import com.proyectoarq.repository.ViajeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ViajeService {

    @Autowired
    private ViajeRepository viajeRepository;

    public Viaje iniciarViaje(Viaje viaje) {
        viaje.setFechaSalida(LocalDateTime.now());
        viaje.setEstado("EN_RUTA");
        return viajeRepository.save(viaje);
    }

    public Viaje actualizarUbicacion(Long id, String ubicacion) {
        Viaje viaje = viajeRepository.findById(id).orElse(null);
        if (viaje != null) {
            viaje.setUbicacionActual(ubicacion);
            return viajeRepository.save(viaje);
        }
        return null;
    }

    public Viaje completarViaje(Long id, String evidencia) {
        Viaje viaje = viajeRepository.findById(id).orElse(null);
        if (viaje != null) {
            viaje.setFechaEntrega(LocalDateTime.now());
            viaje.setEstado("COMPLETADO");
            viaje.setEvidenciaEntrega(evidencia);
            
            // También actualizar el estado de la boleta
            viaje.getBoleta().setEstado("ENTREGADO");
            
            return viajeRepository.save(viaje);
        }
        return null;
    }

    public List<Viaje> listarViajes() {
        return viajeRepository.findAll();
    }
}
