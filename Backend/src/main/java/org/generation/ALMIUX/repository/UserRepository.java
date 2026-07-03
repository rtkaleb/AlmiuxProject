package org.generation.ALMIUX.repository;

import org.generation.ALMIUX.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // * Se eliminó findByUsername porque el campo "username" ya no existe en User (el diagrama ER no lo contempla)
    // ** Busca un usuario por su email (campo único que funciona como identificador de login)
    User findByEmail(String email); // SELECT * FROM usuarios WHERE email = ?1
}
