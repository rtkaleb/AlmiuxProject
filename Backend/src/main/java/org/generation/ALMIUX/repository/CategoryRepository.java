package org.generation.ALMIUX.repository;

import org.generation.ALMIUX.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // * Renombrado de findByName a findByNombre para coincidir con el nombre del campo en Category ("nombre", no "name")
    // * findByName lanzaba error en runtime porque Spring Data buscaba un campo "name" que no existía
    Category findByNombre(String nombre); // SELECT * FROM categorias WHERE nombre = ?1

    // Validar si existe una categoría con un slug específico
    boolean existsBySlug(String slug);
}
