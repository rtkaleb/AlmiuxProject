package org.generation.ALMIUX.controller;

import org.generation.ALMIUX.exceptions.UserNotFoundException;
import org.generation.ALMIUX.model.User;
import org.generation.ALMIUX.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1.0")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET todos los usuarios
    @GetMapping("/users")
    public List<User> getUsers() {
        return userService.getUsers();
    }

    // GET usuario por ID
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.findById(id));
        } catch (UserNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // GET usuario por email usando parámetro de consulta
    @GetMapping("/users/email") // * Endpoint simplificado; ya no hay /users/{username} porque username fue eliminado del modelo
    public ResponseEntity<User> getByEmail(@RequestParam String email) {
        User user = userService.findByEmail(email);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(user);
    }

    // POST crear nuevo usuario
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User newUser) {
        User byEmail = userService.findByEmail(newUser.getEmail()); // * Solo valida por email; username fue eliminado del modelo
        if (byEmail != null) {
            return new ResponseEntity<>(HttpStatus.CONFLICT); // * 409 si el email ya está registrado
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(newUser));
    }

    // PUT actualizar usuario
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@RequestBody User newUser, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.updateUser(newUser, id)); // * Retorna el usuario actualizado con 200 OK
        } catch (UserNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // DELETE eliminar usuario
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (UserNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
