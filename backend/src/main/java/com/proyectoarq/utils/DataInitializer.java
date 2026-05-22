package com.proyectoarq.utils;

import com.proyectoarq.model.Rol;
import com.proyectoarq.model.Usuario;
import com.proyectoarq.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.proyectoarq.model.Vehiculo;
import com.proyectoarq.repository.VehiculoRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private VehiculoRepository vehiculoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createIfNotFound("Admin", "admin@test.com", "admin123", Rol.ADMINISTRADOR);
        createIfNotFound("Supervisor Norte", "supervisor@test.com", "super123", Rol.SUPERVISOR);
        
        Usuario juan = createIfNotFound("Juan Chofer", "juan@test.com", "juan123", Rol.CHOFER);
        Usuario pedro = createIfNotFound("Pedro Chofer", "pedro@test.com", "pedro123", Rol.CHOFER);
        
        createVehiculoIfNotFound("P-123ABC", juan);
        createVehiculoIfNotFound("P-456DEF", pedro);
        createVehiculoIfNotFound("P-789GHI", null);
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

    private void createVehiculoIfNotFound(String placa, Usuario conductor) {
        if (vehiculoRepository.findByPlaca(placa).isEmpty()) {
            Vehiculo v = Vehiculo.builder()
                    .placa(placa)
                    .conductor(conductor)
                    .estado("DISPONIBLE")
                    .build();
            vehiculoRepository.save(v);
            System.out.println("Vehículo creado: " + placa);
        }
    }
}
