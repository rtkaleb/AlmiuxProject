package org.generation.ALMIUX.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // ** Importa la anotación para ocultar campos en el JSON de respuesta
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email; // ** Validación de formato de email
import jakarta.validation.constraints.NotBlank; // ** Validación de campo no vacío

import java.time.LocalDate; // ** Importa LocalDate para fecha_nacimiento (solo fecha, sin hora)
import java.time.LocalDateTime; // ** Importa LocalDateTime para fecha_registro (fecha y hora)
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios") // * Tabla renombrada de "users" a "usuarios" para coincidir con el diagrama ER
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Autoincremental
    @Column(name = "id_usuario") // * Columna renombrada de "id_user" a "id_usuario" para coincidir con el diagrama ER
    private Long id;

    @NotBlank(message = "El nombre es obligatorio") // ** Valida que nombres no sea vacío
    @Column(name = "nombres", nullable = false) // ** Columna "nombres" del diagrama ER
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios") // ** Valida que apellidos no sea vacío
    @Column(name = "apellidos", nullable = false) // ** Columna "apellidos" del diagrama ER
    private String apellidos;

    @NotBlank(message = "El email es obligatorio") // ** Valida que email no sea vacío
    @Email(message = "Formato de email inválido") // ** Valida que el email tenga formato correcto
    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "telefono") // ** Columna "telefono" del diagrama ER
    private String telefono;

    @Column(name = "fecha_nacimiento") // ** Columna "fecha_nacimiento" del diagrama ER (solo fecha, sin hora)
    private LocalDate fechaNacimiento;

    @Column(name = "genero") // ** Columna "genero" del diagrama ER
    private String genero;

    @Column(name = "direccion") // ** Columna "direccion" del diagrama ER
    private String direccion;

    // @JsonIgnore // * Excluye password_hash del JSON de respuesta para no exponerlo en la API
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) // Acepta en request, oculta en response
    @Column(name = "password_hash", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING) // ** Persiste el nombre del enum como texto ("CLIENTE" o "ADMIN")
    @Column(name = "rol", nullable = false) // ** Columna "rol" del diagrama ER
    private UserRole rol; // ** Tipo UserRole (enum propio) para el rol del usuario

    @Column(name = "fecha_registro") // ** Columna "fecha_registro" del diagrama ER
    private LocalDateTime fechaRegistro; // ** Fecha y hora en que el usuario se registró

    // Relación con Order ( 1 : N )
    @JsonIgnore // ** Evita ciclos infinitos al serializar usuario con sus pedidos
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    // JPA necesita un constructor vacío
    public User() {
    }

    // ** Constructor completo con todos los campos del diagrama ER
    public User(String nombres, String apellidos, String email, String telefono,
                LocalDate fechaNacimiento, String genero, String direccion,
                String password, UserRole rol, LocalDateTime fechaRegistro) {
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.email = email;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.genero = genero;
        this.direccion = direccion;
        this.password = password;
        this.rol = rol;
        this.fechaRegistro = fechaRegistro;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombres() { return nombres; } // ** Getter de nombres
    public void setNombres(String nombres) { this.nombres = nombres; } // ** Setter de nombres

    public String getApellidos() { return apellidos; } // ** Getter de apellidos
    public void setApellidos(String apellidos) { this.apellidos = apellidos; } // ** Setter de apellidos

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefono() { return telefono; } // ** Getter de telefono
    public void setTelefono(String telefono) { this.telefono = telefono; } // ** Setter de telefono

    public LocalDate getFechaNacimiento() { return fechaNacimiento; } // ** Getter de fecha_nacimiento
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; } // ** Setter de fecha_nacimiento

    public String getGenero() { return genero; } // ** Getter de genero
    public void setGenero(String genero) { this.genero = genero; } // ** Setter de genero

    public String getDireccion() { return direccion; } // ** Getter de direccion
    public void setDireccion(String direccion) { this.direccion = direccion; } // ** Setter de direccion

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public UserRole getRol() { return rol; } // ** Getter de rol
    public void setRol(UserRole rol) { this.rol = rol; } // ** Setter de rol

    public LocalDateTime getFechaRegistro() { return fechaRegistro; } // ** Getter de fecha_registro
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; } // ** Setter de fecha_registro

    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", nombres='" + nombres + '\'' +
                ", apellidos='" + apellidos + '\'' +
                ", email='" + email + '\'' +
                ", telefono='" + telefono + '\'' +
                ", genero='" + genero + '\'' +
                ", rol=" + rol +
                ", fechaRegistro=" + fechaRegistro +
                '}';
    }
}
