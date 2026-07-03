# 🏪 ALMIUX — Sistema de Gestión para Tienda de Abarrotes

![Página Principal](./images/readme/Almiux_Logo_Sin_Fondo.png)

> Proyecto desarrollado por el equipo **404 Team Not Found** como parte del Bootcamp Full Stack Java de Generation México.

---

# 📖 Descripción

ALMIUX es una plataforma web desarrollada para la administración y gestión de una tienda de abarrotes.

El proyecto integra un frontend responsivo para la interacción de los usuarios y un backend desarrollado con Spring Boot que expone una API REST para la gestión de información.

La plataforma permite administrar productos, usuarios y operaciones relacionadas con el negocio mediante una arquitectura cliente-servidor, facilitando la organización del inventario y mejorando la experiencia de los clientes.

---

# 🚀 Características Principales

## Frontend

* Diseño responsivo para dispositivos móviles, tablets y escritorio.
* Catálogo de productos organizado por categorías.
* Búsqueda y filtrado dinámico de productos.
* Registro de usuarios.
* Inicio de sesión.
* Página institucional con información del negocio.
* Panel administrativo para gestión de productos.
* Carrito de compras.
* Navegación intuitiva y amigable.

## Backend

* API REST desarrollada con Spring Boot.
* Arquitectura basada en capas (Controller → Service → Repository).
* Persistencia de datos mediante JPA/Hibernate con MySQL.
* Gestión de usuarios, productos, categorías, pedidos y detalles de pedido.
* Validación de datos con Spring Validation.
* Encriptación de contraseñas con BCrypt.
* Manejo centralizado de excepciones HTTP.
* Endpoints REST completos para operaciones CRUD.

![Backend corriendo en IntelliJ](./images/readme/Spring.png)

---

# 🖼️ Capturas del Proyecto

## Página Principal

![Página Principal](./images/readme/AlmiuxInicio.png)

---

# 📋 Gestión del Proyecto

Durante el desarrollo se aplicaron metodologías ágiles para la organización, seguimiento y control de actividades.

## Tablero Jira

![Tablero Jira](./images/readme/JiraAlmiux.png)

El equipo gestionó historias de usuario, backlog, tareas técnicas y seguimiento de sprints utilizando Jira como herramienta principal de trabajo.

---

# 🏗️ Arquitectura General

```text
Frontend (HTML, CSS, JavaScript)
            │
            ▼
     API REST Spring Boot
            │
            ▼
          MySQL
```

---

# 🛠️ Tecnologías Utilizadas

## Frontend

* HTML5
* CSS3
* JavaScript (ES6+)
* Bootstrap

## Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Java | 17 | Lenguaje principal |
| Spring Boot | 3.5.14 | Framework base |
| Spring Data JPA | — | Acceso a base de datos |
| Spring Security | — | Encriptación de contraseñas (BCrypt) |
| Spring Validation | — | Validación de request bodies |
| MySQL | 8+ | Base de datos relacional |
| Hibernate | — | ORM (mapeado entidad ↔ tabla) |
| Gradle | 8+ | Gestión de dependencias y build |

## Herramientas

* Git · GitHub
* Jira
* Postman
* MySQL Workbench
* VS Code · IntelliJ IDEA

---

# 📂 Estructura del Proyecto

```text
ALMIUX/
│
├── frontend/                          ← Archivos estáticos servidos por Spring Boot
│   ├── index.html
│   ├── productos.html
│   ├── nosotros.html
│   ├── login.html
│   ├── registro.html
│   ├── admin.html
│   ├── css/
│   ├── js/
│   └── images/
│
├── backend/  (src/main/java/...)
│   ├── config/        ← Spring Security y BCryptPasswordEncoder
│   ├── controller/    ← Endpoints de usuarios, productos, categorías, pedidos y detalles
│   ├── exceptions/    ← Manejo centralizado de errores HTTP
│   ├── model/         ← Entidades JPA: User, Product, Category, Order, OrderDetail
│   ├── repository/    ← Interfaces de acceso a base de datos
│   └── service/       ← Lógica de negocio para cada entidad
│
├── src/main/resources/
│   ├── application.properties.example
│   └── static/        ← Frontend servido como recursos estáticos
│
├── build.gradle
└── README.md
```

---

# ⚙️ Instalación y Configuración

## Requisitos previos

* Java 17 o superior
* MySQL 8 corriendo localmente
* Gradle (o usar el wrapper incluido `./gradlew`)

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/Equipo-2-CH66/ALMIUX.git
cd ALMIUX
```

---

## 2. Crear la base de datos en MySQL

```sql
CREATE DATABASE almiux_db;
```

---

## 3. Crear el archivo de configuración local

> `application.properties` está en `.gitignore` y **no se sube a GitHub** porque contiene contraseñas.
> Cada integrante debe crearlo localmente siguiendo estos pasos.

```bash
# Mac / Linux
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Windows (CMD)
copy src\main\resources\application.properties.example src\main\resources\application.properties
```

Abre el archivo y edita tus credenciales:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/almiux_db
spring.datasource.username=TU_USUARIO_MYSQL
spring.datasource.password=TU_CONTRASEÑA_MYSQL

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

> Si tu MySQL local no tiene contraseña, deja `password=` en blanco.

---

## 4. Ejecutar el Backend

```bash
./gradlew bootRun
```

La API estará disponible en `http://localhost:8080`.  
Las tablas se crean automáticamente gracias a `spring.jpa.hibernate.ddl-auto=update`.

---

## 5. Ejecutar el Frontend

Abrir directamente `index.html` o utilizar la extensión **Live Server** de VS Code.

---

# 📁 Archivos que NO se suben a GitHub

| Archivo | Razón |
|---|---|
| `application.properties` | Contiene credenciales de BD |
| `build/` | Archivos compilados generados localmente |
| `.idea/`, `.vscode/` | Configuración del editor de cada quien |
| `.DS_Store` | Archivo interno de macOS |

Todos están listados en `.gitignore`.

---

# 🗄️ Base de Datos — Diagrama Entidad-Relación

![Diagrama Entidad-Relación ALMIUX](./images/readme/Entidad-Relacion.png)

| Tabla | Descripción | Relaciones |
|---|---|---|
| `usuarios` | Clientes y administradores | 1:N con `pedidos` |
| `categorias` | Grupos de productos | 1:N con `productos` |
| `productos` | Catálogo de productos | N:1 con `categorias` |
| `pedidos` | Órdenes de compra | N:1 con `usuarios`, 1:N con `detalle_pedido` |
| `detalle_pedido` | Productos dentro de un pedido | N:1 con `pedidos` y `productos` |

---

# 🔌 API REST

Base URL: `http://localhost:8080/api/v1.0`

## Usuarios `/users`

| Método | Endpoint | Descripción | Status |
|---|---|---|---|
| GET | `/users` | Obtener todos los usuarios | 200 |
| GET | `/users/{id}` | Obtener usuario por ID | 200 / 404 |
| GET | `/users/email?email=` | Obtener usuario por email | 200 / 404 |
| POST | `/users` | Crear nuevo usuario | 201 / 409 |
| PUT | `/users/{id}` | Actualizar usuario | 200 / 404 |
| DELETE | `/users/{id}` | Eliminar usuario | 204 / 404 |

**Ejemplo — crear usuario:**
```json
POST /api/v1.0/users
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "email": "juan@email.com",
  "password": "secreto123",
  "telefono": "5512345678",
  "genero": "M",
  "direccion": "Calle Falsa 123",
  "rol": "CLIENTE"
}
```

![Ejemplo de endpoint en Postman](./images/readme/Danna-Migajera.png)

---

## Categorías `/category`

| Método | Endpoint | Descripción | Status |
|---|---|---|---|
| GET | `/category/categories` | Obtener todas las categorías | 200 |
| GET | `/category/{id}` | Obtener categoría por ID | 200 / 404 |
| POST | `/category` | Crear nueva categoría | 201 / 409 |
| PUT | `/category/{id}` | Actualizar categoría | 200 / 404 |
| DELETE | `/category/{id}` | Eliminar categoría | 204 / 404 |

**Ejemplo — crear categoría:**
```json
POST /api/v1.0/category
{
  "nombre": "Electrónica",
  "slug": "electronica",
  "icono": "laptop",
  "descripcion": "Dispositivos electrónicos y gadgets"
}
```

---

## Productos `/products`

| Método | Endpoint | Descripción | Status |
|---|---|---|---|
| GET | `/products` | Obtener todos los productos | 200 |
| GET | `/products/{id}` | Obtener producto por ID | 200 / 404 |
| POST | `/products` | Crear nuevo producto | 201 |
| PUT | `/products/{id}` | Actualizar producto | 200 / 404 |
| DELETE | `/products/{id}` | Eliminar producto | 204 / 404 |

**Ejemplo — crear producto:**
```json
POST /api/v1.0/products
{
  "categoria": { "id": 1 },
  "nombre": "Laptop Gamer",
  "descripcion": "Laptop para gaming de alto rendimiento",
  "icono": "laptop-icon.png",
  "precio": 25999.99,
  "enOferta": true,
  "descuentoPct": 10,
  "precioFinal": 23399.99,
  "activo": true
}
```

---

## Pedidos `/orders`

| Método | Endpoint | Descripción | Status |
|---|---|---|---|
| GET | `/orders` | Obtener todos los pedidos | 200 |
| GET | `/orders/{id}` | Obtener pedido por ID | 200 / 404 |
| POST | `/orders` | Crear nuevo pedido | 201 |
| PUT | `/orders/{id}` | Actualizar pedido | 200 / 404 |
| DELETE | `/orders/{id}` | Eliminar pedido | 204 / 404 |

**Valores válidos para `estatus`:** `PENDIENTE` · `EN_PROCESO` · `ENVIADO` · `ENTREGADO` · `CANCELADO`

**Ejemplo — crear pedido:**
```json
POST /api/v1.0/orders
{
  "user": { "id": 1 },
  "estatus": "PENDIENTE",
  "total": 23399.99,
  "direccionEntrega": "Calle Falsa 123",
  "telefonoContacto": "5512345678",
  "notas": "Dejar en recepción",
  "fechaPedido": "2026-06-08T10:00:00"
}
```

---

## Detalles de Pedido

| Método | Endpoint | Descripción | Status |
|---|---|---|---|
| GET | `/orders/{idPedido}/detalles` | Obtener detalles de un pedido | 200 |
| GET | `/detalles/{id}` | Obtener detalle por ID | 200 / 404 |
| POST | `/orders/{idPedido}/detalles` | Agregar detalle a un pedido | 201 |
| PUT | `/detalles/{id}` | Actualizar detalle | 200 / 404 |
| DELETE | `/detalles/{id}` | Eliminar detalle | 204 / 404 |

**Ejemplo — agregar detalle:**
```json
POST /api/v1.0/orders/1/detalles
{
  "order": { "idPedido": 1 },
  "product": { "id": 3 },
  "cantidad": 2,
  "precioUnitario": 23399.99,
  "subtotal": 46799.98
}
```

---

# ⚠️ Manejo de Errores

Todos los errores devuelven respuestas JSON con el código HTTP correspondiente.

| Código | Cuándo ocurre |
|---|---|
| `400 Bad Request` | El body no pasa las validaciones (`@NotBlank`, `@Email`, etc.) |
| `404 Not Found` | El recurso solicitado no existe |
| `409 Conflict` | Se intenta crear un recurso con un dato único ya registrado |

**Ejemplo de error 400:**
```json
{
  "nombre": "El nombre del producto es obligatorio",
  "email": "Formato de email inválido"
}
```

---

# 🔐 Roles de Usuario

| Rol | Descripción |
|---|---|
| `CLIENTE` | Usuario regular que realiza compras |
| `ADMIN` | Administrador con acceso total al sistema |

---

# 📋 Funcionalidades

## Gestión de Usuarios

* Registro de usuarios.
* Consulta de usuarios.
* Actualización de información.
* Eliminación de registros.
* Validación de datos.

## Gestión de Productos

* Alta de productos.
* Consulta de productos.
* Actualización de productos.
* Eliminación de productos.
* Clasificación por categorías.

## Experiencia de Usuario

* Diseño responsivo.
* Navegación intuitiva.
* Formularios validados.
* Interfaz amigable.

---

# 📝 Notas de Desarrollo

* **Contraseñas:** Se almacenan encriptadas con BCrypt. Nunca se devuelven en las respuestas (anotadas con `@JsonIgnore`).
* **CORS:** Actualmente configurado para aceptar cualquier origen (`*`). Restringir antes de pasar a producción.
* **`ddl-auto=update`:** Hibernate actualiza el esquema automáticamente. Cambiar a `validate` o `none` en producción.
* **Seguridad HTTP:** Actualmente todos los endpoints son públicos. Configurar autenticación JWT antes de producción.

---

# 👥 Equipo de Desarrollo

## 404 Team Not Found

| Integrante | Rol |
|---|---|
| **Kaleb Torres** | Developer · Scrum Master |
| **Danna Remigio** | Frontend Developer |
| **Arturo Ramírez** | Frontend Developer |
| **Yarilis Hernández** | Frontend Developer |
| **Zared Ortiz** | Backend Developer |
| **Noé Hernández** | QA Tester |
| **Diego Quiñónez** | Backend Developer |

![Miembros del equipo](./images/readme/Desarrolladores.png)

---

# 🎓 Proyecto Académico

Proyecto desarrollado como parte del Bootcamp Full Stack Java de Generation México.

Durante el desarrollo se aplicaron conocimientos de:

* Desarrollo Frontend
* Desarrollo Backend
* APIs REST
* Bases de Datos Relacionales
* Metodologías Ágiles
* Control de Versiones con Git

---

# 📄 Licencia

Proyecto desarrollado con fines académicos y educativos.

---

*© 2026 · Abarrotes Almiux · Hecho en México con ❤️*  
*Proyecto académico — Generation México Bootcamp · 404 Team Not Found*
