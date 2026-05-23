package com.proyectoarq.utils;

import com.proyectoarq.model.*;
import com.proyectoarq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FlotaRepository flotaRepository;

    @Autowired
    private VehiculoRepository vehiculoRepository;

    @Autowired
    private BoletaRepository boletaRepository;

    @Autowired
    private ViajeRepository viajeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        Usuario admin = createIfNotFound("Admin", "admin@test.com", "admin123", Rol.ADMINISTRADOR);
        Usuario supervisor = createIfNotFound("Supervisor Norte", "supervisor@test.com", "super123", Rol.SUPERVISOR);
        
        Usuario juan = createIfNotFound("Juan Chofer", "juan@test.com", "juan123", Rol.CHOFER);
        Usuario pedro = createIfNotFound("Pedro Chofer", "pedro@test.com", "pedro123", Rol.CHOFER);
        
        Flota flotaNorte = createFlotaIfNotFound("Flota Norte", supervisor);
        Flota flotaSur = createFlotaIfNotFound("Flota Sur", admin);

        createVehiculoIfNotFound("P-123ABC", juan, flotaNorte, "Volvo", "FH16", 2022);
        createVehiculoIfNotFound("P-456DEF", pedro, flotaNorte, "Hino", "500", 2021);
        createVehiculoIfNotFound("P-789GHI", null, flotaSur, "Mercedes", "Actros", 2023);

        // Sembrar Boletas y Viajes
        if (boletaRepository.count() == 0) {
            Boleta b1 = Boleta.builder()
                    .codigoQr("QR-001")
                    .fecha(LocalDateTime.now().minusDays(2))
                    .carga("Cemento")
                    .cantidad(25.5)
                    .canastas(10)
                    .estado("ENTREGADO")
                    .origen("Planta Central")
                    .destino("Obra Norte")
                    .build();
            boletaRepository.save(b1);

            Boleta b2 = Boleta.builder()
                    .codigoQr("QR-002")
                    .fecha(LocalDateTime.now().minusDays(1))
                    .carga("Hierro")
                    .cantidad(15.0)
                    .canastas(5)
                    .estado("EN_RUTA")
                    .origen("Planta Sur")
                    .destino("Obra Costa")
                    .build();
            boletaRepository.save(b2);

            Boleta b3 = Boleta.builder()
                    .codigoQr("QR-003")
                    .fecha(LocalDateTime.now())
                    .carga("Gravilla")
                    .cantidad(30.0)
                    .canastas(12)
                    .estado("PENDIENTE")
                    .origen("Cantera Este")
                    .destino("Planta Mezcla")
                    .build();
            boletaRepository.save(b3);

            // Crear Viajes asociados
            viajeRepository.save(Viaje.builder()
                    .boleta(b1)
                    .vehiculo(vehiculoRepository.findByPlaca("P-123ABC").orElse(null))
                    .estado("COMPLETADO")
                    .fechaSalida(LocalDateTime.now().minusDays(2).plusHours(2))
                    .fechaEntrega(LocalDateTime.now().minusDays(2).plusHours(6))
                    .ubicacionActual("-12.046374,-77.042793")
                    .build());

            viajeRepository.save(Viaje.builder()
                    .boleta(b2)
                    .vehiculo(vehiculoRepository.findByPlaca("P-456DEF").orElse(null))
                    .estado("EN_RUTA")
                    .fechaSalida(LocalDateTime.now().minusDays(1).plusHours(1))
                    .ubicacionActual("-12.086374,-77.012793")
                    .build());
        }
    }

    private Usuario createIfNotFound(String nombre, String correo, String password, Rol rol) {
        return usuarioRepository.findByCorreo(correo).orElseGet(() -> {
            Usuario user = Usuario.builder()
                    .nombre(nombre)
                    .correo(correo)
                    .contraseña(passwordEncoder.encode(password))
                    .rol(rol)
                    .build();
            System.out.println("Usuario " + rol + " creado: " + correo);
            return usuarioRepository.save(user);
        });
    }

    private Flota createFlotaIfNotFound(String nombre, Usuario supervisor) {
        return flotaRepository.findAll().stream()
                .filter(f -> f.getNombre().equals(nombre))
                .findFirst()
                .orElseGet(() -> {
                    Flota f = Flota.builder()
                            .nombre(nombre)
                            .supervisor(supervisor)
                            .vehiculos(new ArrayList<>())
                            .build();
                    System.out.println("Flota creada: " + nombre);
                    return flotaRepository.save(f);
                });
    }

    private void createVehiculoIfNotFound(String placa, Usuario conductor, Flota flota, String marca, String modelo, Integer anio) {
        if (vehiculoRepository.findByPlaca(placa).isEmpty()) {
            Vehiculo v = Vehiculo.builder()
                    .placa(placa)
                    .conductor(conductor)
                    .flota(flota)
                    .marca(marca)
                    .modelo(modelo)
                    .anio(anio)
                    .estado("DISPONIBLE")
                    .build();
            vehiculoRepository.save(v);
            System.out.println("Vehículo creado: " + placa);
        }
    }
}