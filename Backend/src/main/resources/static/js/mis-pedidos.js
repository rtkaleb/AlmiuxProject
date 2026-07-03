/* ══════════════════════════════════════════════════════════════════
   ABARROTES ALMIUX — mis-pedidos.js
   Muestra el historial de pedidos del usuario autenticado.
   Requiere: api.js · auth.js
══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  /* Contenedor donde se inyectarán las tarjetas de pedidos */
  const lista    = document.getElementById('listaPedidos');
  /* Spinner de carga; se oculta cuando los datos estén listos */
  const cargando = document.getElementById('cargando');

  /* ── 1. Verificar sesión activa ───────────────────────────── */
  let sesion = null;
  try {
    /* Lee el objeto de sesión guardado al hacer login */
    sesion = JSON.parse(sessionStorage.getItem('almiux_sesion'));
  } catch (_) {}

  /* Si no hay sesión, redirige al login */
  if (!sesion) {
    window.location.href = 'login.html';
    return;
  }

  /* ── 2. Mapa de etiquetas legibles por cada estatus del backend ── */
  const ETIQUETAS = {
    PENDIENTE:  'Pendiente',
    EN_PROCESO: 'En proceso',
    ENVIADO:    'Enviado',
    COMPLETADO: 'Completado',
    CANCELADO:  'Cancelado',
  };

  /* ── 3. Genera el HTML de una tarjeta para un pedido ─────── */
  function tarjetaPedido(p) {
    /* Estatus con fallback a PENDIENTE si el campo viene vacío */
    const estatus  = p.estatus || 'PENDIENTE';
    /* Etiqueta legible; si no coincide usa el valor original */
    const etiqueta = ETIQUETAS[estatus] || estatus;
    /* Formatea la fecha en español mexicano */
    const fecha    = p.fechaPedido
      ? new Date(p.fechaPedido).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';
    /* Total formateado con dos decimales */
    const total    = parseFloat(p.total || 0).toFixed(2);
    /* Dirección de entrega (opcional); se omite si está vacía */
    const dir      = p.direccionEntrega
      ? `<p class="pedido-dir"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.direccionEntrega)}</p>`
      : '';

    /* Retorna el HTML completo de la tarjeta */
    return `
      <div class="pedido-card">
        <div class="pedido-header">
          <div>
            <!-- ID único del pedido en el backend -->
            <span class="pedido-id">Pedido #${p.idPedido}</span>
            <span class="pedido-fecha pedido-fecha-ml">${fecha}</span>
          </div>
          <div class="pedido-header-right">
            <!-- Badge de color según el estatus del pedido -->
            <span class="pedido-estatus estatus-${estatus}">${etiqueta}</span>
            <span class="pedido-total">$${total}</span>
          </div>
        </div>
        ${dir}
        <!-- Notas adicionales del pedido (opcional) -->
        ${p.notas ? `<p class="pedido-dir"><i class="fa-solid fa-note-sticky"></i> ${escapeHtml(p.notas)}</p>` : ''}
      </div>
    `;
  }

  /* ── 4. Cargar pedidos desde el backend ───────────────────── */
  try {
    /* Obtiene todos los pedidos; el filtrado por usuario se hace en cliente
       porque el backend no expone un endpoint /users/{id}/orders aún */
    const todosPedidos = await PedidosAPI.getAll();

    /* Filtra solo los pedidos que pertenecen al usuario en sesión */
    const misPedidos = todosPedidos.filter(p =>
      p.user?.id === sesion.id ||
      p.user?.email?.toLowerCase() === sesion.email?.toLowerCase()
    );

    /* Oculta el spinner ahora que los datos están disponibles */
    cargando.style.display = 'none';

    /* Muestra mensaje de estado vacío si el usuario no tiene pedidos */
    if (misPedidos.length === 0) {
      lista.innerHTML = `
        <div class="pedido-empty">
          <i class="fa-solid fa-bag-shopping"></i>
          <p>Aún no tienes pedidos.</p>
          <a href="../productos.html" class="btn-primary pedido-empty-link">
            Ver productos
          </a>
        </div>`;
      return;
    }

    /* Ordena descendente por idPedido para mostrar el más reciente primero */
    const ordenados = misPedidos.slice().sort((a, b) => b.idPedido - a.idPedido);
    /* Renderiza todas las tarjetas de una vez */
    lista.innerHTML = ordenados.map(tarjetaPedido).join('');

  } catch (_) {
    /* ── 5. Fallback: leer pedidos guardados localmente ───────── */
    cargando.style.display = 'none';

    /* Lee los pedidos que pudo guardar carrito.js en localStorage */
    const local = JSON.parse(localStorage.getItem('almiux_pedidos') || '[]');
    /* Filtra por email o nombre del usuario en sesión */
    const misPedidosLocal = local.filter(p =>
      p.email === sesion.email || p.cliente?.includes(sesion.nombres || '')
    );

    if (misPedidosLocal.length === 0) {
      /* Mismo estado vacío que el flujo principal */
      lista.innerHTML = `
        <div class="pedido-empty">
          <i class="fa-solid fa-bag-shopping"></i>
          <p>Aún no tienes pedidos.</p>
          <a href="../productos.html" class="btn-primary pedido-empty-link">
            Ver productos
          </a>
        </div>`;
    } else {
      /* Invierte el array para mostrar el más reciente primero */
      lista.innerHTML = misPedidosLocal.slice().reverse().map((p, i) => `
        <div class="pedido-card">
          <div class="pedido-header">
            <!-- ID local generado por el carrito; puede no coincidir con el backend -->
            <span class="pedido-id">Pedido #${p.id || i + 1}</span>
            <span class="pedido-estatus estatus-${(p.estado || 'PENDIENTE').toUpperCase()}">${p.estado || 'Pendiente'}</span>
          </div>
          <p class="pedido-total">$${Number(p.total || 0).toFixed(2)}</p>
        </div>`).join('');
    }
  }
});
