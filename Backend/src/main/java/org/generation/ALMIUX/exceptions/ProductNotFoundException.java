package org.generation.ALMIUX.exceptions;

// ** Excepción personalizada para cuando un producto no es encontrado (Sigue el mismo patrón que UserNotFoundException)
public class ProductNotFoundException extends RuntimeException {

    // ** Constructor que recibe el ID y genera un mensaje descriptivo
    public ProductNotFoundException(Long id) {
        super("Producto no encontrado con id: " + id);
    }
}
