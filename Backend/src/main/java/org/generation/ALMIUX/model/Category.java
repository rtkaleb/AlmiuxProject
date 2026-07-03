package org.generation.ALMIUX.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank; // ** Validación de campo no vacío

@Entity
@Table(name = "categorias")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Long id;

    @NotBlank(message = "El nombre de la categoría es obligatorio") // ** Valida que nombre no sea vacío
    @Column(unique = true, nullable = false)
    private String nombre;

    // @NotBlank(message = "El slug es obligatorio") // ** Valida que slug no sea vacío
    @Column(nullable = false) // * Se elimina columnDefinition = "TEXT" porque el diagrama ER define slug como VARCHAR, no TEXT
    private String slug;

    @NotBlank(message = "El ícono es obligatorio") // ** Valida que icono no sea vacío
    @Column(name = "icono", nullable = false)
    private String icono;

    @NotBlank(message = "La descripción es obligatoria") // ** Valida que descripcion no sea vacía
    @Column(name = "descripcion", nullable = false)
    private String descripcion;

    // Constructores
    public Category() {}

    public Category(Long id, String nombre, String slug, String icono, String descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.slug = slug;
        this.icono = icono;
        this.descripcion = descripcion;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getIcono() { return icono; }
    public void setIcono(String icono) { this.icono = icono; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    @Override
    public String toString() {
        return "Categoria{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", slug='" + slug + '\'' +
                ", icono='" + icono + '\'' +
                ", descripcion='" + descripcion + '\'' +
                '}';
    }
}
