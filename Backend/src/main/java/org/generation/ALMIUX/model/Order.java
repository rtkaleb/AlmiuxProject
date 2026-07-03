package org.generation.ALMIUX.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // ** Evita ciclos infinitos al serializar Order con sus detalles
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long idPedido;

    @Enumerated(EnumType.STRING) // * Persiste el nombre del enum como texto en la BD (ej: "PENDIENTE")
    @Column(name = "estatus", nullable = false)
    @NotNull(message = "El estatus del pedido es obligatorio")
    private OrderStatus estatus;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "El total del pedido es obligatorio")
    private BigDecimal total;

    @Column(name = "direccion_entrega", columnDefinition = "TEXT")
    private String direccionEntrega;

    @Column(name = "telefono_contacto")
    private String telefonoContacto;

    @Column(name = "notas", columnDefinition = "TEXT")
    private String notas;

    @Column(name = "fecha_pedido", nullable = false)
    private LocalDateTime fechaPedido;

    @ManyToOne(fetch = FetchType.EAGER)  //Cambiar LAZY a EAGER para asegurar que los datos del usuario siempre esten listos y cargados al momento de transformarse en el JSON
    @JoinColumn(name = "id_usuario", nullable = false) // * Renombrada la FK de "user_id" a "id_usuario" para coincidir con el diagrama ER
    private User user;

    // ** Relación One-to-Many con OrderDetail: un pedido tiene uno o varios detalles
    @JsonIgnore // ** Evita ciclos infinitos al serializar Order → OrderDetail → Order
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetail> detalles = new ArrayList<>(); // ** Lista de detalles del pedido (productos y cantidades)

    public Order() {
    }

    public Order(OrderStatus estatus, BigDecimal total, String direccionEntrega,
                 String telefonoContacto, String notas, LocalDateTime fechaPedido, User user) {
        this.estatus = estatus;
        this.total = total;
        this.direccionEntrega = direccionEntrega;
        this.telefonoContacto = telefonoContacto;
        this.notas = notas;
        this.fechaPedido = fechaPedido;
        this.user = user;
    }

    // Getters y Setters
    public Long getIdPedido() { return idPedido; }
    public void setIdPedido(Long idPedido) { this.idPedido = idPedido; }

    public OrderStatus getEstatus() { return estatus; }
    public void setEstatus(OrderStatus estatus) { this.estatus = estatus; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getDireccionEntrega() { return direccionEntrega; }
    public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }

    public String getTelefonoContacto() { return telefonoContacto; }
    public void setTelefonoContacto(String telefonoContacto) { this.telefonoContacto = telefonoContacto; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public LocalDateTime getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(LocalDateTime fechaPedido) { this.fechaPedido = fechaPedido; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<OrderDetail> getDetalles() { return detalles; } // ** Getter de los detalles del pedido
    public void setDetalles(List<OrderDetail> detalles) { this.detalles = detalles; } // ** Setter de los detalles del pedido
}
