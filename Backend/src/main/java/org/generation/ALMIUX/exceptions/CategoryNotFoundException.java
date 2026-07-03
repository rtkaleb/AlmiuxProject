package org.generation.ALMIUX.exceptions;

// ** Excepción personalizada para cuando una categoría no es encontrada; estandariza el manejo de errores
public class CategoryNotFoundException extends RuntimeException {

    // ** Constructor que recibe el ID y genera un mensaje descriptivo
    public CategoryNotFoundException(Long id) {
        super("Categoría no encontrada con id: " + id);
    }
}
