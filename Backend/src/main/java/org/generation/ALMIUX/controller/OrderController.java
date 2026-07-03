package org.generation.ALMIUX.controller;

import org.generation.ALMIUX.exceptions.OrderNotFoundException; // ** Importa la excepción personalizada de pedido
import org.generation.ALMIUX.model.Order;
import org.generation.ALMIUX.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; // ** Importa List para tipar correctamente el retorno de getOrders

@RestController
@RequestMapping("/api/v1.0")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Obtener todas las órdenes
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders() { // * Tipado correcto en lugar de ResponseEntity<?>
        return ResponseEntity.ok(orderService.getOrders());
    }

    // ** Obtener una orden por ID
    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.getOrderById(id)); // ** Retorna la orden con 200 OK si existe
        } catch (OrderNotFoundException e) { // ** Retorna 404 si el pedido no existe
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Crear nueva orden
    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody Order newOrder) { // * Tipado correcto; endpoint movido a /orders en lugar de /create-order
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(orderService.createOrder(newOrder));
    }

    // ** Actualizar orden existente por ID
    @PutMapping("/orders/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order order) {
        try {
            return ResponseEntity.ok(orderService.updateOrder(id, order)); // ** Retorna la orden actualizada con 200 OK
        } catch (OrderNotFoundException e) { // ** Retorna 404 si el pedido no existe
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // ** Eliminar orden por ID
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id); // ** Llama al servicio para eliminar la orden
            return ResponseEntity.noContent().build(); // ** Retorna 204 No Content si la eliminación fue exitosa
        } catch (OrderNotFoundException e) { // ** Retorna 404 si el pedido no existe
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
