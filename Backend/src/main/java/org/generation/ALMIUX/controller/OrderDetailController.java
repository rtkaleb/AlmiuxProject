package org.generation.ALMIUX.controller;

import org.generation.ALMIUX.exceptions.OrderDetailNotFoundException; // ** Importa la excepción personalizada de detalle de pedido
import org.generation.ALMIUX.model.OrderDetail;
import org.generation.ALMIUX.service.OrderDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ** Controller para la entidad OrderDetail (tabla DETALLE_PEDIDO del diagrama ER)
@RestController
@RequestMapping("/api/v1.0")
public class OrderDetailController {

    private final OrderDetailService orderDetailService;

    @Autowired
    public OrderDetailController(OrderDetailService orderDetailService) {
        this.orderDetailService = orderDetailService;
    }

    // ** GET todos los detalles de un pedido específico por su ID
    @GetMapping("/orders/{idPedido}/detalles")
    public ResponseEntity<List<OrderDetail>> getDetailsByOrder(@PathVariable Long idPedido) {
        return ResponseEntity.ok(orderDetailService.getDetailsByOrderId(idPedido)); // ** Retorna la lista de detalles del pedido
    }

    // ** GET un detalle específico por su propio ID
    @GetMapping("/detalles/{id}")
    public ResponseEntity<OrderDetail> getDetailById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderDetailService.getDetailById(id)); // ** Retorna el detalle con 200 OK si existe
        } catch (OrderDetailNotFoundException e) { // ** Retorna 404 si el detalle no existe
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // ** POST crear un nuevo detalle asociado a un pedido
    @PostMapping("/orders/{idPedido}/detalles")
    public ResponseEntity<OrderDetail> createDetail(@PathVariable Long idPedido, @RequestBody OrderDetail newDetail) {
        return ResponseEntity
                .status(HttpStatus.CREATED) // ** Retorna 201 CREATED con el detalle guardado
                .body(orderDetailService.createDetail(newDetail));
    }

    // ** PUT actualizar un detalle de pedido por su ID
    @PutMapping("/detalles/{id}")
    public ResponseEntity<OrderDetail> updateDetail(@PathVariable Long id, @RequestBody OrderDetail detail) {
        try {
            return ResponseEntity.ok(orderDetailService.updateDetail(id, detail)); // ** Retorna el detalle actualizado con 200 OK
        } catch (OrderDetailNotFoundException e) { // ** Retorna 404 si el detalle no existe
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // ** DELETE eliminar un detalle de pedido por su ID
    @DeleteMapping("/detalles/{id}")
    public ResponseEntity<Void> deleteDetail(@PathVariable Long id) {
        try {
            orderDetailService.deleteDetail(id); // ** Llama al servicio para eliminar el detalle
            return ResponseEntity.noContent().build(); // ** Retorna 204 No Content si fue exitoso
        } catch (OrderDetailNotFoundException e) { // ** Retorna 404 si el detalle no existe
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
