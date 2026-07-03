package org.generation.ALMIUX.repository;

import org.generation.ALMIUX.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // * Se eliminaron save() y findAll() que estaban redeclarados innecesariamente;
    // * JpaRepository ya los hereda y provee con su implementación por defecto
}
