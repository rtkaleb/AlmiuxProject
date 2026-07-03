package org.generation.ALMIUX.service;

import org.generation.ALMIUX.exceptions.OrderDetailNotFoundException; // ** Importa la excepción personalizada de detalle de pedido
import org.generation.ALMIUX.model.OrderDetail;
import org.generation.ALMIUX.repository.OrderDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// ** Servicio para la entidad OrderDetail (tabla DETALLE_PEDIDO del diagrama ER)
@Service
public class OrderDetailService {

    private final OrderDetailRepository orderDetailRepository;

    @Autowired
    public OrderDetailService(OrderDetailRepository orderDetailRepository) {
        this.orderDetailRepository = orderDetailRepository;
    }

    // ** Obtener todos los detalles de un pedido por el ID del pedido
    public List<OrderDetail> getDetailsByOrderId(Long idPedido) {
        return orderDetailRepository.findByOrderIdPedido(idPedido); // ** Consulta todos los detalles asociados al pedido
    }

    // ** Obtener un detalle específico por su ID
    public OrderDetail getDetailById(Long id) {
        return orderDetailRepository.findById(id)
                .orElseThrow(() -> new OrderDetailNotFoundException(id)); // ** Lanza excepción si el detalle no existe
    }

    // ** Crear un nuevo detalle de pedido
    @Transactional // ** Garantiza que la creación sea atómica
    public OrderDetail createDetail(OrderDetail newDetail) {
        return orderDetailRepository.save(newDetail);
    }

    // ** Actualizar un detalle de pedido existente por su ID
    @Transactional // ** Garantiza que la actualización sea atómica
    public OrderDetail updateDetail(Long id, OrderDetail detail) {
        return orderDetailRepository.findById(id)
                .map(existing -> {
                    existing.setCantidad(detail.getCantidad()); // ** Actualiza la cantidad del producto en el pedido
                    existing.setPrecioUnitario(detail.getPrecioUnitario()); // ** Actualiza el precio unitario
                    existing.setSubtotal(detail.getSubtotal()); // ** Actualiza el subtotal (cantidad × precio_unitario)
                    return orderDetailRepository.save(existing); // ** Persiste los cambios
                })
                .orElseThrow(() -> new OrderDetailNotFoundException(id)); // ** Lanza excepción si el detalle no existe
    }

    // ** Eliminar un detalle de pedido por su ID
    @Transactional // ** Garantiza que la eliminación sea atómica
    public void deleteDetail(Long id) {
        if (!orderDetailRepository.existsById(id)) { // ** Verifica existencia antes de eliminar
            throw new OrderDetailNotFoundException(id); // ** Lanza excepción en lugar de fallar silenciosamente
        }
        orderDetailRepository.deleteById(id); // ** Elimina el detalle de la BD
    }
}
