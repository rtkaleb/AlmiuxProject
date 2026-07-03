package org.generation.ALMIUX.exceptions;

// ** Excepción personalizada para cuando un pedido no es encontrado; estandariza el manejo de errores
public class OrderNotFoundException extends RuntimeException {

    // ** Constructor que recibe el ID y genera un mensaje descriptivo
    public OrderNotFoundException(Long id) {
        super("Pedido no encontrado con id: " + id);
    }
}
