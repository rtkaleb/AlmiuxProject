package org.generation.ALMIUX.repository;

import org.generation.ALMIUX.model.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// ** Repositorio para la entidad OrderDetail (tabla DETALLE_PEDIDO del diagrama ER)
@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    // ** Busca todos los detalles que pertenecen a un pedido específico por su ID
    List<OrderDetail> findByOrderIdPedido(Long idPedido); // SELECT * FROM detalle_pedido WHERE id_pedido = ?1
}
