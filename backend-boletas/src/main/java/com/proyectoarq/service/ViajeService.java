package com.proyectoarq.service;

import com.proyectoarq.model.Viaje;
import com.proyectoarq.repository.ViajeRepository;
import com.proyectoarq.repository.BoletaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ViajeService {

    @Autowired
    private ViajeRepository viajeRepository;

    @Autowired
    private BoletaRepository boletaRepository;

    public Viaje crearViaje(Viaje viaje) {
        if (viaje.getEstado() == null) viaje.setEstado("PROGRAMADO");
        if (viaje.getBoleta() != null && viaje.getBoleta().getId() != null) {
            viaje.setBoleta(boletaRepository.findById(viaje.getBoleta().getId()).orElse(viaje.getBoleta()));
        }
        return viajeRepository.save(viaje);
    }

    public Viaje aceptarViaje(Long id) {
        Viaje viaje = viajeRepository.findById(id).orElse(null);
        if (viaje != null) {
            viaje.setEstado("ACEPTADO");
            if (viaje.getBoleta() != null) {
                viaje.getBoleta().setEstado("ACEPTADA");
                boletaRepository.save(viaje.getBoleta());
            }
            return viajeRepository.save(viaje);
        }
        return null;
    }

    public Viaje iniciarViaje(Long id) {
        Viaje viaje = viajeRepository.findById(id).orElse(null);
        if (viaje != null) {
            viaje.setFechaSalida(LocalDateTime.now());
            viaje.setEstado("EN_RUTA");
            if (viaje.getBoleta() != null) {
                viaje.getBoleta().setEstado("EN_CAMINO");
                boletaRepository.save(viaje.getBoleta());
            }
            return viajeRepository.save(viaje);
        }
        return null;
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
            viaje.setFechaLlegada(LocalDateTime.now());
            viaje.setEstado("ENTREGADO");
            viaje.setEvidenciaEntrega(evidencia);
            
            if (viaje.getFechaSalida() != null) {
                long minutes = Duration.between(viaje.getFechaSalida(), viaje.getFechaLlegada()).toMinutes();
                viaje.setDuracionHoras(minutes / 60.0);
            }
            
            if (viaje.getBoleta() != null) {
                viaje.getBoleta().setEstado("ENTREGADA");
                boletaRepository.save(viaje.getBoleta());
            }
            
            return viajeRepository.save(viaje);
        }
        return null;
    }

    public List<Viaje> listarViajes() {
        return viajeRepository.findAll();
    }

    public Optional<Viaje> obtenerPorBoletaId(Long boletaId) {
        return viajeRepository.findByBoletaId(boletaId);
    }
}
