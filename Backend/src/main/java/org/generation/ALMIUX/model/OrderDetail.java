package org.generation.ALMIUX.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min; // ** Validación de valor mínimo
import jakarta.validation.constraints.NotNull; // ** Validación de campo no nulo
import java.math.BigDecimal;

// ** Entidad que representa la tabla DETALLE_PEDIDO del diagrama ER
// ** Relaciona un pedido con los productos que contiene (tabla intermedia N:M entre PEDIDOS y PRODUCTOS)
@Entity
@Table(name = "detalle_pedido") // ** Nombre de tabla según el diagrama ER
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle") // ** PK según el diagrama ER
    private Long idDetalle;

    // ** Relación Many-to-One con Order: un detalle pertenece a un pedido
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido", nullable = false) // ** FK "id_pedido" que referencia la tabla pedidos
    private Order order;

    // ** Relación Many-to-One con Product: un detalle referencia un producto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false) // ** FK "id_producto" que referencia la tabla productos
    private Product product;

    @NotNull(message = "La cantidad es obligatoria") // ** Valida que cantidad no sea nula
    @Min(value = 1, message = "La cantidad debe ser al menos 1") // ** Valida que la cantidad sea un número positivo
    @Column(name = "cantidad", nullable = false) // ** Columna "cantidad" según el diagrama ER
    private Integer cantidad;

    @NotNull(message = "El precio unitario es obligatorio") // ** Valida que precio_unitario no sea nulo
    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2) // ** Columna "precio_unitario" según el diagrama ER
    private BigDecimal precioUnitario;

    @NotNull(message = "El subtotal es obligatorio") // ** Valida que subtotal no sea nulo
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2) // ** Columna "subtotal" según el diagrama ER
    private BigDecimal subtotal;

    // Constructor vacío requerido por JPA
    public OrderDetail() {
    }

    // ** Constructor completo con todos los campos del diagrama ER
    public OrderDetail(Order order, Product product, Integer cantidad,
                       BigDecimal precioUnitario, BigDecimal subtotal) {
        this.order = order;
        this.product = product;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
    }

    // Getters y Setters
    public Long getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Long idDetalle) { this.idDetalle = idDetalle; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    @Override
    public String toString() {
        return "OrderDetail{" +
                "idDetalle=" + idDetalle +
                ", cantidad=" + cantidad +
                ", precioUnitario=" + precioUnitario +
                ", subtotal=" + subtotal +
                '}';
    }
}
