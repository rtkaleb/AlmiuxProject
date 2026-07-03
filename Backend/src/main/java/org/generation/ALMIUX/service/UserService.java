package org.generation.ALMIUX.service;

import org.generation.ALMIUX.exceptions.UserNotFoundException;
import org.generation.ALMIUX.model.User;
import org.generation.ALMIUX.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime; // ** Importa LocalDateTime para asignar la fecha de registro automáticamente
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Obtener todos los usuarios
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    // Crear un nuevo usuario
    @Transactional
    public User createUser(User newUser) {
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword())); // * Encripta la contraseña con BCrypt antes de guardar
        newUser.setFechaRegistro(LocalDateTime.now()); // ** Asigna la fecha y hora actual como fecha de registro automáticamente
        return userRepository.save(newUser);
    }

    // Buscar usuario por email
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Buscar usuario por ID
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    // Eliminar usuario por ID
    @Transactional
    public void deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
        } else {
            throw new UserNotFoundException(id);
        }
    }

    // Actualizar usuario por ID
    @Transactional
    public User updateUser(User user, Long id) {
        return userRepository.findById(id)
                .map(userData -> {
                    userData.setNombres(user.getNombres()); // * Actualiza nombres (campo nuevo del diagrama ER)
                    userData.setApellidos(user.getApellidos()); // * Actualiza apellidos (campo nuevo del diagrama ER)
                    userData.setEmail(user.getEmail());
                    userData.setTelefono(user.getTelefono()); // * Actualiza telefono (campo nuevo del diagrama ER)
                    userData.setFechaNacimiento(user.getFechaNacimiento()); // * Actualiza fecha_nacimiento (campo nuevo del diagrama ER)
                    userData.setGenero(user.getGenero()); // * Actualiza genero (campo nuevo del diagrama ER)
                    userData.setDireccion(user.getDireccion()); // * Actualiza direccion (campo nuevo del diagrama ER)
                    userData.setRol(user.getRol()); // * Actualiza rol (campo nuevo del diagrama ER)
                    if (user.getPassword() != null && !user.getPassword().isBlank()) { // * Solo re-encripta si se envía una nueva contraseña
                        userData.setPassword(passwordEncoder.encode(user.getPassword()));
                    }
                    return userRepository.save(userData);
                })
                .orElseThrow(() -> new UserNotFoundException(id));
    }
}
