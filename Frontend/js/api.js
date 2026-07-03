/* ══════════════════════════════════════════════════════════════════
   ABARROTES ALMIUX — api.js
   Módulo central para todas las llamadas al backend (Spring Boot).
   BASE_URL apunta a http://localhost:8080/api/v1.0 --> Se cambió a 18.188.12.224 en AWS para la IP de máquina virtual
   Debe cargarse ANTES de cualquier otro script que use la API.
══════════════════════════════════════════════════════════════════ */

/* URL base del backend; cambiar solo si el puerto o host varía */
const API_BASE = 'http://18.188.12.224:8080/api/v1.0';

/* ── Función base de fetch ─────────────────────────────────────── */
/* Envuelve fetch con manejo de errores HTTP y deserialización JSON */
async function apiFetch(path, options = {}) {
  /* Construye la URL completa concatenando base + ruta relativa */
  const url = `${API_BASE}${path}`;

  /* Mezcla los headers por defecto con los que el llamador envíe */
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  const res = await fetch(url, config);

  /* Si el servidor responde con un código de error, lanza excepción con el status */
  if (!res.ok) {
    /* Intenta leer el cuerpo del error; si falla usa el texto del status */
    const texto = await res.text().catch(() => res.statusText);
    throw Object.assign(new Error(texto || res.statusText), { status: res.status });
  }

  /* 204 No Content no tiene cuerpo; devolver null evita error al parsear */
  if (res.status === 204) return null;

  /* Devuelve el cuerpo deserializado como objeto JS */
  return res.json();
}

/* ══════════════════════════════════════════════════════════════════
   USUARIOS  /users
   Operaciones CRUD sobre la entidad User del backend
══════════════════════════════════════════════════════════════════ */
const UsuariosAPI = {
  /* Obtiene la lista completa de usuarios */
  getAll:     ()          => apiFetch('/users'),
  /* Obtiene un usuario por su ID numérico */
  getById:    (id)        => apiFetch(`/users/${id}`),
  /* Busca un usuario por correo electrónico usando query param */
  getByEmail: (email)     => apiFetch(`/users/email?email=${encodeURIComponent(email)}`),
  /* Crea un nuevo usuario; el servidor responde 409 si el email ya existe */
  create:     (datos)     => apiFetch('/users',       { method: 'POST',   body: JSON.stringify(datos) }),
  /* Reemplaza los datos de un usuario existente */
  update:     (id, datos) => apiFetch(`/users/${id}`, { method: 'PUT',    body: JSON.stringify(datos) }),
  /* Elimina un usuario; el servidor responde 204 si fue exitoso */
  delete:     (id)        => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

/* ══════════════════════════════════════════════════════════════════
   PRODUCTOS  /products
   Operaciones CRUD sobre la entidad Product del backend
══════════════════════════════════════════════════════════════════ */
const ProductosAPI = {
  /* Obtiene todos los productos (activos e inactivos) */
  getAll:  ()          => apiFetch('/products'),
  /* Obtiene un producto por su ID */
  getById: (id)        => apiFetch(`/products/${id}`),
  /* Crea un nuevo producto; requiere categoria.id en el body */
  create:  (datos)     => apiFetch('/products',        { method: 'POST',   body: JSON.stringify(datos) }),
  /* Actualiza un producto existente */
  update:  (id, datos) => apiFetch(`/products/${id}`,  { method: 'PUT',    body: JSON.stringify(datos) }),
  /* Elimina un producto por ID */
  delete:  (id)        => apiFetch(`/products/${id}`,  { method: 'DELETE' }),
};

/* ══════════════════════════════════════════════════════════════════
   CATEGORÍAS  /category/categories
   Operaciones CRUD sobre la entidad Category del backend.
   Nota: el controller usa /category como base y /categories para getAll
══════════════════════════════════════════════════════════════════ */
const CategoriasAPI = {
  /* Obtiene todas las categorías */
  getAll:  ()          => apiFetch('/category/categories'),
  /* Obtiene una categoría por su ID */
  getById: (id)        => apiFetch(`/category/${id}`),
  /* Crea una categoría; el servidor responde 409 si el nombre ya existe */
  create:  (datos)     => apiFetch('/category',        { method: 'POST',   body: JSON.stringify(datos) }),
  /* Actualiza los datos de una categoría */
  update:  (id, datos) => apiFetch(`/category/${id}`,  { method: 'PUT',    body: JSON.stringify(datos) }),
  /* Elimina una categoría por ID */
  delete:  (id)        => apiFetch(`/category/${id}`,  { method: 'DELETE' }),
};

/* ══════════════════════════════════════════════════════════════════
   PEDIDOS  /orders
   Operaciones CRUD sobre la entidad Order del backend
══════════════════════════════════════════════════════════════════ */
const PedidosAPI = {
  /* Obtiene todos los pedidos de todos los usuarios */
  getAll:  ()          => apiFetch('/orders'),
  /* Obtiene un pedido por su ID */
  getById: (id)        => apiFetch(`/orders/${id}`),
  /* Crea un nuevo pedido; requiere user.id y estatus en el body */
  create:  (datos)     => apiFetch('/orders',        { method: 'POST',   body: JSON.stringify(datos) }),
  /* Actualiza un pedido (p. ej. cambio de estatus) */
  update:  (id, datos) => apiFetch(`/orders/${id}`,  { method: 'PUT',    body: JSON.stringify(datos) }),
  /* Elimina un pedido por ID */
  delete:  (id)        => apiFetch(`/orders/${id}`,  { method: 'DELETE' }),
};

/* ══════════════════════════════════════════════════════════════════
   DETALLES DE PEDIDO  /orders/{id}/detalles
   Cada detalle representa un producto dentro de un pedido
══════════════════════════════════════════════════════════════════ */
const DetallesAPI = {
  /* Obtiene todos los detalles (ítems) de un pedido específico */
  getByOrder: (idPedido)        => apiFetch(`/orders/${idPedido}/detalles`),
  /* Agrega un ítem a un pedido existente */
  create:     (idPedido, datos) => apiFetch(`/orders/${idPedido}/detalles`, { method: 'POST',   body: JSON.stringify(datos) }),
  /* Actualiza un detalle individual por su propio ID */
  update:     (id, datos)       => apiFetch(`/detalles/${id}`,              { method: 'PUT',    body: JSON.stringify(datos) }),
  /* Elimina un detalle por su ID */
  delete:     (id)              => apiFetch(`/detalles/${id}`,              { method: 'DELETE' }),
};
