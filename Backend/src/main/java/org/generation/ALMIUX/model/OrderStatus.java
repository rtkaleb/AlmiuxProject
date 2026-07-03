package org.generation.ALMIUX.model;

// ** Enum propio para los estados de un pedido; reemplaza el incorrecto TaskExecutionOutcome.Status de Spring
public enum OrderStatus {
    // ** Pedido recibido pero aún no procesado
    PENDIENTE,

    // ** Pedido en preparación
    EN_PROCESO,

    // ** Pedido enviado al cliente
    ENVIADO,

    // ** Pedido recibido por el cliente
    ENTREGADO,

    // ** Pedido cancelado antes de su entrega
    CANCELADO
}
