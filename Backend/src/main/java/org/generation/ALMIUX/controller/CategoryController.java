package org.generation.ALMIUX.controller;

import org.generation.ALMIUX.exceptions.CategoryNotFoundException; // ** Importa la excepción personalizada de categoría
import org.generation.ALMIUX.model.Category;
import org.generation.ALMIUX.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1.0/category")
@CrossOrigin(origins = "*") // Permite llamadas desde cualquier frontend
public class CategoryController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Obtener todas las categorías
    @GetMapping("/categories")
    public List<Category> getCategories() {
        return categoryService.getCategories();
    }

    // Obtener categoría por ID
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(categoryService.getCategoryById(id)); // * Ahora el servicio lanza excepción; el try-catch la maneja correctamente
        } catch (CategoryNotFoundException e) { // * Captura la excepción en lugar de depender del null
            return ResponseEntity.notFound().build();
        }
    }

    // Crear nueva categoría
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category newCategory) {
        if (categoryService.existsByName(newCategory.getNombre())) { // * Valida que no exista una categoría con el mismo nombre (corrige el TODO pendiente)
            return new ResponseEntity<>(HttpStatus.CONFLICT); // * Retorna 409 CONFLICT si la categoría ya existe
        }
        Category savedCategory = categoryService.createCategory(newCategory);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
    }

    // Actualizar categoría existente
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        try {
            return ResponseEntity.ok(categoryService.updateCategory(id, category)); // * El servicio ahora lanza excepción si no existe; simplifica el controller
        } catch (CategoryNotFoundException e) { // * Captura la excepción del servicio
            return ResponseEntity.notFound().build();
        }
    }

    // Eliminar categoría
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id); // * El servicio ahora verifica existencia antes de eliminar
            return ResponseEntity.noContent().build();
        } catch (CategoryNotFoundException e) { // * Retorna 404 si la categoría no existe
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
