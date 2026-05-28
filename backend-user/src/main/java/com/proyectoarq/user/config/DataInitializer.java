package com.proyectoarq.user.config;

import com.proyectoarq.user.model.Rol;
import com.proyectoarq.user.model.Usuario;
import com.proyectoarq.user.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() == 0) {
            Usuario admin = Usuario.builder()
                    .nombre("Admin Sistema")
                    .correo("admin@test.com")
                    .contraseña(passwordEncoder.encode("password123"))
                    .rol(Rol.ADMINISTRADOR)
                    .build();
            
            usuarioRepository.save(admin);
            System.out.println("### Usuario administrador inicial creado: admin@test.com / password123 ###");
        }
    }
}
