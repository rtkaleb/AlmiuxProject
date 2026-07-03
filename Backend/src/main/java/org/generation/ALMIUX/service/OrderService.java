package org.generation.ALMIUX.service;

import org.generation.ALMIUX.exceptions.OrderNotFoundException; // ** Importa la excepción personalizada de pedido
import org.generation.ALMIUX.model.Order;
import org.generation.ALMIUX.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service; // * Importa @Service para que Spring registre esta clase como bean
import org.springframework.transaction.annotation.Transactional; // ** Importa @Transactional para garantizar atomicidad en escrituras

import java.util.List;

@Service // * Agrega la anotación que faltaba para que Spring pueda inyectar OrderService en los controllers
public class OrderService {

    private final OrderRepository orderRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Método para obtener todas las órdenes
    public List<Order> getOrders() {
        return orderRepository.findAll();
    }

    // ** Método para obtener una orden por ID
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id)); // ** Lanza excepción descriptiva si el pedido no existe
    }

    // Método para crear una nueva orden
    @Transactional // ** Garantiza que la creación sea atómica
    public Order createOrder(Order newOrder) {
        return orderRepository.save(newOrder);
    }

    // ** Método para actualizar un pedido existente por ID
    @Transactional // ** Garantiza que la actualización sea atómica
    public Order updateOrder(Long id, Order order) {
        return orderRepository.findById(id)
                .map(existing -> {
                    existing.setEstatus(order.getEstatus()); // ** Actualiza el estado del pedido
                    existing.setTotal(order.getTotal()); // ** Actualiza el total
                    existing.setDireccionEntrega(order.getDireccionEntrega()); // ** Actualiza la dirección de entrega
                    existing.setTelefonoContacto(order.getTelefonoContacto()); // ** Actualiza el teléfono de contacto
                    existing.setNotas(order.getNotas()); // ** Actualiza las notas del pedido
                    return orderRepository.save(existing); // ** Persiste los cambios en la BD
                })
                .orElseThrow(() -> new OrderNotFoundException(id)); // ** Lanza excepción si el pedido no existe
    }

    // ** Método para eliminar un pedido por ID
    @Transactional // ** Garantiza que la eliminación sea atómica
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) { // ** Verifica que el pedido exista antes de intentar eliminarlo
            throw new OrderNotFoundException(id); // ** Lanza excepción en lugar de fallar silenciosamente
        }
        orderRepository.deleteById(id); // ** Elimina el pedido de la BD
    }
}
