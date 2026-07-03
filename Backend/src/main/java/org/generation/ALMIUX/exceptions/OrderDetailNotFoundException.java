package org.generation.ALMIUX.exceptions;

// ** Excepción personalizada para cuando un detalle de pedido no es encontrado
public class OrderDetailNotFoundException extends RuntimeException {

    // ** Constructor que recibe el ID y genera un mensaje descriptivo
    public OrderDetailNotFoundException(Long id) {
        super("Detalle de pedido no encontrado con id: " + id);
    }
}
