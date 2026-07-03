package org.generation.ALMIUX.service;

import org.generation.ALMIUX.exceptions.CategoryNotFoundException;
import org.generation.ALMIUX.model.Category;
import org.generation.ALMIUX.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Obtener todas las categorías
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    // Buscar categoría por ID
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
    }

    // Buscar categoría por nombre
    public Category getCategoryByName(String nombre) {
        return categoryRepository.findByNombre(nombre); // * Corregido: antes llamaba a findByName que no existía en el repo; ahora usa findByNombre
    }

    // Verificar si ya existe una categoría con el mismo nombre
    public boolean existsByName(String nombre) {
        return categoryRepository.findByNombre(nombre) != null; // * Corregido: antes llamaba a findByName que no existía; ahora usa findByNombre
    }

    // Crear una nueva categoría
    @Transactional
    public Category createCategory(Category newCategory) {
        // Genera slug automáticamente desde el nombre
        String slug = newCategory.getNombre()
                .toLowerCase()
                .trim()
                .replaceAll("[áàä]", "a")
                .replaceAll("[éèë]", "e")
                .replaceAll("[íìï]", "i")
                .replaceAll("[óòö]", "o")
                .replaceAll("[úùü]", "u")
                .replaceAll("[ñ]", "n")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");

        newCategory.setSlug(slug);
        return categoryRepository.save(newCategory);
    }

    // Actualizar categoría existente
    @Transactional
    public Category updateCategory(Long id, Category category) {
        getCategoryById(id); // * Verifica existencia; lanza CategoryNotFoundException si no existe
        category.setId(id);
        return categoryRepository.save(category);
    }

    // Eliminar categoría
    @Transactional
    public void deleteCategory(Long id) {
        getCategoryById(id); // * Verifica existencia antes de eliminar; lanza CategoryNotFoundException si no existe
        categoryRepository.deleteById(id);
    }
}
