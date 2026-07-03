package org.generation.ALMIUX.controller;

import jakarta.validation.Valid;
import org.generation.ALMIUX.exceptions.ProductNotFoundException; // ** Importa la excepción personalizada para manejar productos no encontrados
import org.generation.ALMIUX.model.Product;
import org.generation.ALMIUX.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1.0/products")
@CrossOrigin(origins = "*") // Acepta solicitudes desde cualquier origen sin que CORS se entrometa (Usar en desarrollo y no en producción)
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Obtener todos los productos
    @GetMapping // * Corrige el endpoint duplicado que antes era /products/products; ahora responde en /api/v1.0/products
    public ResponseEntity<List<Product>> getProducts() { // * Cambia ResponseEntity<?> a tipo genérico correcto List<Product>
        return ResponseEntity.ok(productService.getProducts());
    }

    // Obtener producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) { // * Tipado correcto en lugar de ResponseEntity<?>
        try {
            return ResponseEntity.ok(productService.getProductById(id));
        } catch (ProductNotFoundException e) { // * Captura la excepción personalizada en lugar de dejarla sin manejar
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Crear nuevo producto
    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product newProduct) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productService.createProduct(newProduct));
    }

    // ** Actualizar producto existente por ID
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            return ResponseEntity.ok(productService.updateProduct(id, product)); // ** Retorna el producto actualizado con 200 OK
        } catch (ProductNotFoundException e) { // ** Retorna 404 si el producto no existe
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // ** Eliminar producto por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id); // ** Llama al servicio para eliminar el producto
            return ResponseEntity.noContent().build(); // ** Retorna 204 No Content si la eliminación fue exitosa
        } catch (ProductNotFoundException e) { // ** Retorna 404 si el producto no existe
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
