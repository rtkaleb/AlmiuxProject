package org.generation.ALMIUX.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank; // ** Validación de campo no vacío
import jakarta.validation.constraints.NotNull; // ** Validación de campo no nulo
import java.math.BigDecimal; // ** Reemplaza Double por BigDecimal para mayor precisión en valores monetarios
import java.time.LocalDateTime;

@Entity
@Table(name = "productos") // * Tabla renombrada de "products" a "productos" para coincidir con el diagrama ER
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto") // * Columna renombrada de "id_product" a "id_producto" para coincidir con el diagrama ER
    private Long id;

    // ** Relación Many-to-One con Category: un producto pertenece a una categoría
    @NotNull(message = "La categoría es obligatoria")
    @ManyToOne(fetch = FetchType.EAGER) // Se cambia porque no se puede obtener back
    @JoinColumn(name = "id_categoria", nullable = false) // ** Crea la columna FK "id_categoria" en la tabla productos
    private Category categoria;

    @NotBlank(message = "El nombre del producto es obligatorio") // ** Valida que nombre no sea vacío
    @Column(name = "nombre", unique = true, nullable = false) // * Renombrado de "productname" a "nombre" para coincidir con el diagrama ER
    private String nombre;

    @NotBlank(message = "La descripción es obligatoria") // ** Valida que descripcion no sea vacía
    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT") // * Renombrado de "description" a "descripcion" para coincidir con el diagrama ER
    private String descripcion;

    @Column(name = "icono") // * Reemplaza "image_url" por "icono" para coincidir con el diagrama ER
    private String icono;

    @NotNull(message = "El precio es obligatorio") // ** Valida que precio no sea nulo
    @Column(name = "precio", nullable = false, precision = 10, scale = 2) // * Renombrado de "price" a "precio"; cambia a BigDecimal para precisión monetaria
    private BigDecimal precio;

    @Column(name = "en_oferta") // * Renombrado de "on_sale" a "en_oferta" para coincidir con el diagrama ER
    private Boolean enOferta;

    @Column(name = "descuento_pct") // * Renombrado de "discount_pct" a "descuento_pct" para coincidir con el diagrama ER
    private Integer descuentoPct;

    @Column(name = "precio_final", precision = 10, scale = 2) // * Renombrado de "final_price" a "precio_final" para coincidir con el diagrama ER
    private BigDecimal precioFinal;

    @Column(name = "activo") // * Renombrado de "active" a "activo" para coincidir con el diagrama ER
    private Boolean activo;

    @Column(name = "fecha_creacion") // * Renombrado de "creation_date" a "fecha_creacion" para coincidir con el diagrama ER
    private LocalDateTime fechaCreacion;

    // Constructor vacío requerido por JPA
    public Product() {
    }

    // ** Constructor completo con todos los campos del diagrama ER
    public Product(Category categoria, String nombre, String descripcion, String icono,
                   BigDecimal precio, Boolean enOferta, Integer descuentoPct,
                   BigDecimal precioFinal, Boolean activo, LocalDateTime fechaCreacion) {
        this.categoria = categoria;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.icono = icono;
        this.precio = precio;
        this.enOferta = enOferta;
        this.descuentoPct = descuentoPct;
        this.precioFinal = precioFinal;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Category getCategoria() { return categoria; } // ** Getter de la relación con Category
    public void setCategoria(Category categoria) { this.categoria = categoria; } // ** Setter de la relación con Category

    public String getNombre() { return nombre; } // * Renombrado de getProductname a getNombre
    public void setNombre(String nombre) { this.nombre = nombre; } // * Renombrado de setProductname a setNombre

    public String getDescripcion() { return descripcion; } // * Renombrado de getDescription a getDescripcion
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; } // * Renombrado de setDescription a setDescripcion

    public String getIcono() { return icono; } // * Reemplaza getImageUrl con getIcono para coincidir con el diagrama ER
    public void setIcono(String icono) { this.icono = icono; } // * Reemplaza setImageUrl con setIcono para coincidir con el diagrama ER

    public BigDecimal getPrecio() { return precio; } // * Renombrado de getProductprice a getPrecio; tipo cambiado a BigDecimal
    public void setPrecio(BigDecimal precio) { this.precio = precio; } // * Renombrado de setProductprice a setPrecio; tipo cambiado a BigDecimal

    public Boolean getEnOferta() { return enOferta; }
    public void setEnOferta(Boolean enOferta) { this.enOferta = enOferta; }

    public Integer getDescuentoPct() { return descuentoPct; }
    public void setDescuentoPct(Integer descuentoPct) { this.descuentoPct = descuentoPct; }

    public BigDecimal getPrecioFinal() { return precioFinal; } // * Tipo cambiado a BigDecimal para consistencia monetaria
    public void setPrecioFinal(BigDecimal precioFinal) { this.precioFinal = precioFinal; } // * Tipo cambiado a BigDecimal

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", descripcion='" + descripcion + '\'' +
                ", precio=" + precio +
                ", enOferta=" + enOferta +
                ", descuentoPct=" + descuentoPct +
                ", precioFinal=" + precioFinal +
                ", activo=" + activo +
                ", fechaCreacion=" + fechaCreacion +
                '}';
    }
}
