/*  carrito.js
   */

/* ── Estado global del carrito ─────────────────────────────────── */
const CARRITO_KEY = 'almiux_carrito';

/** Lee el carrito guardado en localStorage. Siempre devuelve array. */
function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
  } catch (_) {
    return [];
  }
}

/** Guarda el carrito en localStorage y actualiza la UI. */
function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  renderizarCarrito();
  actualizarContadorGlobalCarrito();
}

/* ══════════════════════════════════════════════════════════════════
   agregarAlCarrito(btn, nombre, precio)
   ─────────────────────────────────────
   Agrega un producto al carrito o incrementa su cantidad.
   · btn    → elemento <button> que disparó el click (para animación)
   · nombre → nombre del producto (string)
   · precio → precio unitario (number, opcional — default 0)
══════════════════════════════════════════════════════════════════ */
function agregarAlCarrito(btn, nombre, precio) {
  precio = parseFloat(precio) || 0;

  const carrito  = leerCarrito();
  const existing = carrito.find(i => i.nombre === nombre);

  if (existing) {
    existing.qty += 1;
    mostrarToast(`+1 ${nombre} en tu carrito`);
  } else {
    carrito.push({ nombre, precio, qty: 1 });
    mostrarToast(`✓ ${nombre} añadido`);
  }

  guardarCarrito(carrito);

  /* Animación del botón de la tarjeta */
  if (btn) {
    const textoOriginal = btn.textContent;
    btn.classList.add('agregado');
    btn.textContent = '✓ Añadido';
    setTimeout(() => {
      btn.classList.remove('agregado');
      btn.textContent = textoOriginal;
    }, 1200);
  }

  /* Animación del ícono del carrito en el navbar */
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.style.transform = 'scale(1.25)';
    cartBtn.style.transition = 'transform .15s ease';
    setTimeout(() => { cartBtn.style.transform = ''; }, 200);
  }
}

/* ══════════════════════════════════════════════════════════════════
   renderizarCarrito()
   ───────────────────
   Dibuja todos los ítems del drawer y actualiza el badge del navbar.
══════════════════════════════════════════════════════════════════ */
function renderizarCarrito() {
  const container     = document.getElementById('cartItems');
  const emptyEl       = document.getElementById('cartEmpty');
  const footerEl      = document.getElementById('cartFooter');
  const totalEl       = document.getElementById('totalAmount');
  const countLabel    = document.getElementById('cartItemsCount');

  /* Si el drawer aún no está en el DOM, salir */
  if (!container) return;

  const carrito = leerCarrito();
  const total   = carrito.reduce((s, i) => s + (i.precio * i.qty), 0);
  const qty     = carrito.reduce((s, i) => s + i.qty, 0);

  /* Actualizar badge del navbar */
  actualizarContadorGlobalCarrito();

  /* Texto "X item(s)" en el header del drawer */
  if (countLabel) {
    countLabel.textContent = `${qty} producto${qty !== 1 ? 's' : ''}`;
  }

  /* Total monetario */
  if (totalEl) {
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  /* Limpiar ítems previos (conservar #cartEmpty) */
  [...container.children].forEach(c => {
    if (c.id !== 'cartEmpty') c.remove();
  });

  /* Carrito vacío */
  if (carrito.length === 0) {
    if (emptyEl)  emptyEl.style.display  = 'flex';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (emptyEl)  emptyEl.style.display  = 'none';
  if (footerEl) footerEl.style.display = 'flex';

  /* Renderizar cada ítem */
  carrito.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';

    el.innerHTML = `
      <div class="cart-item-details">
        <p class="cart-item-name">${escapeHtml(item.nombre)}</p>
        <div class="cart-item-controls">
          <div class="qty-controls">
            <button class="qty-btn" data-action="dec" data-nombre="${escapeHtml(item.nombre)}" aria-label="Restar">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-nombre="${escapeHtml(item.nombre)}" aria-label="Sumar">+</button>
          </div>
          <span class="cart-item-price">$${(item.precio * item.qty).toFixed(2)}</span>
        </div>
        <button class="remove-item" data-remove="${escapeHtml(item.nombre)}">✕ Quitar</button>
      </div>
    `;

    container.appendChild(el);
  });

  /* Delegar eventos dentro del drawer */
  container.onclick = (e) => {
    /* Botones +/- */
    const qtyBtn = e.target.closest('.qty-btn');
    if (qtyBtn) {
      const nombre = qtyBtn.dataset.nombre;
      const delta  = qtyBtn.dataset.action === 'inc' ? 1 : -1;
      cambiarCantidad(nombre, delta);
      return;
    }
    /* Botón quitar */
    const removeBtn = e.target.closest('.remove-item');
    if (removeBtn) {
      quitarDelCarrito(removeBtn.dataset.remove);
    }
  };
}

/* ══════════════════════════════════════════════════════════════════
   cambiarCantidad(nombre, delta)
   quitarDelCarrito(nombre)
══════════════════════════════════════════════════════════════════ */
function cambiarCantidad(nombre, delta) {
  const carrito = leerCarrito();
  const item    = carrito.find(i => i.nombre === nombre);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    guardarCarrito(carrito.filter(i => i.nombre !== nombre));
  } else {
    guardarCarrito(carrito);
  }
}

function quitarDelCarrito(nombre) {
  guardarCarrito(leerCarrito().filter(i => i.nombre !== nombre));

  /* Restaurar el botón de la tarjeta si está visible */
  document.querySelectorAll('.btn-agregar').forEach(btn => {
    /* Comparamos el atributo onclick para detectar el producto */
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(nombre)) {
      btn.textContent = '+ Agregar';
      btn.classList.remove('agregado');
    }
  });
}

/* ══════════════════════════════════════════════════════════════════
   actualizarUICarrito()
   ─────────────────────
   Alias para compatibilidad con llamadas desde productos.js.
   También actualiza el contador del badge.
══════════════════════════════════════════════════════════════════ */
function actualizarUICarrito() {
  actualizarContadorGlobalCarrito();
}

/* ══════════════════════════════════════════════════════════════════
   actualizarContadorGlobalCarrito()
   ──────────────────────────────────
   Lee el total de piezas y actualiza el badge del navbar.
   También definida en navbar.js; aquí se redefine para uso
   independiente cuando solo se carga carrito.js.
══════════════════════════════════════════════════════════════════ */
function actualizarContadorGlobalCarrito() {
  const carrito = leerCarrito();
  const total   = carrito.reduce((s, i) => s + (i.qty || 0), 0);
  const badge   = document.getElementById('cartCount');
  if (!badge) return;
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'none';
}

/* ══════════════════════════════════════════════════════════════════
   DRAWER: abrir / cerrar
══════════════════════════════════════════════════════════════════ */
function abrirDrawer() {
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer) return;

  renderizarCarrito();           /* Asegurar datos frescos */
  drawer.classList.add('open');
  if (overlay) overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function cerrarDrawer() {
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer)  drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════════════════
   TOAST de notificación
══════════════════════════════════════════════════════════════════ */
function mostrarToast(mensaje) {
  /* Crear contenedor si no existe */
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    document.body.appendChild(toast);
  }

  toast.textContent = mensaje;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ══════════════════════════════════════════════════════════════════
   finalizarCompra()
   Crea el pedido en el backend con los ítems del carrito.
   Requiere sesión activa (sessionStorage almiux_sesion).
══════════════════════════════════════════════════════════════════ */
async function finalizarCompra() {
  /* No procede si el carrito está vacío */
  const carrito = leerCarrito();
  if (carrito.length === 0) {
    mostrarToast('Tu carrito está vacío');
    return;
  }

  /* Lee la sesión activa para obtener el id del usuario en el backend */
  let sesion = null;
  try { sesion = JSON.parse(sessionStorage.getItem('almiux_sesion')); } catch (_) {}

  /* Sin id de backend no se puede crear la orden; redirige a pago.html como fallback */
  if (!sesion?.id) {
    window.location.href = (typeof obtenerBasePath === 'function' ? obtenerBasePath() : './') + 'pago.html';
    return;
  }

  /* Calcula el total sumando precio × cantidad de cada ítem */
  const total = carrito.reduce((s, i) => s + (i.precio * i.qty), 0);

  /* Deshabilita el botón mientras se procesa para evitar pedidos duplicados */
  const btnFin = document.querySelector('#cartFooter .btn-primary');
  if (btnFin) { btnFin.disabled = true; btnFin.textContent = 'Procesando…'; }

  try {
    /* Crea el pedido cabecera con estatus inicial PENDIENTE */
    const orden = await PedidosAPI.create({
      estatus:          'PENDIENTE',
      total:            total.toFixed(2),               /* BigDecimal en el backend */
      direccionEntrega: sesion.direccion || '',
      telefonoContacto: sesion.telefono  || '',
      notas:            '',
      fechaPedido:      new Date().toISOString().slice(0, 19), /* LocalDateTime sin zona */
      user:             { id: sesion.id },              /* Referencia al usuario por id */
    });

    /* Crea un detalle (OrderDetail) por cada ítem del carrito en paralelo */
    await Promise.all(carrito.map(item =>
      DetallesAPI.create(orden.idPedido, {
        cantidad:       item.qty,
        precioUnitario: item.precio,
        subtotal:       (item.precio * item.qty).toFixed(2),
        /* Solo vincula al producto si fue cargado desde el backend y tiene id */
        producto:       item.id ? { id: item.id } : null,
        nombreProducto: item.nombre,
        order:          { idPedido: orden.idPedido },
      })
    ));

    /* Vacía el carrito del localStorage tras confirmar la orden en el backend */
    localStorage.removeItem(CARRITO_KEY);
    actualizarContadorGlobalCarrito();
    cerrarDrawer();
    mostrarToast(`✓ Pedido #${orden.idPedido} confirmado`);

    /* Redirige al historial de pedidos del usuario */
    setTimeout(() => {
      const base = typeof obtenerBasePath === 'function' ? obtenerBasePath() : './';
      window.location.href = base + 'usuario/mis-pedidos.html';
    }, 1800);

  } catch (err) {
    mostrarToast('Error al procesar el pedido. Intenta de nuevo.');
    console.error(err);
  } finally {
    if (btnFin) { btnFin.disabled = false; btnFin.textContent = 'Finalizar compra'; }
  }
}

/* ══════════════════════════════════════════════════════════════════
   Helper escapeHtml (por si utils.js no está cargado)
══════════════════════════════════════════════════════════════════ */
if (typeof escapeHtml === 'undefined') {
  window.escapeHtml = function(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
}

/* ══════════════════════════════════════════════════════════════════
   INICIALIZACIÓN
   Se ejecuta cuando el DOM está listo.
   · Inyecta el drawer + overlay si aún no existen en el DOM
   · Conecta el botón del navbar (#cartBtn) para abrir el drawer
   · Conecta el botón de cierre (#closeCart)
   · Actualiza el contador
══════════════════════════════════════════════════════════════════ */
function iniciarCarrito() {
  /* ── Inyectar overlay ────────────────────────────────────────── */
  if (!document.getElementById('cartOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'cartOverlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', cerrarDrawer);
    document.body.appendChild(overlay);
  }

  /* ── Inyectar drawer si no existe ya en el DOM ───────────────── */
  if (!document.getElementById('cartDrawer')) {
    const drawer = document.createElement('div');
    drawer.innerHTML = `
      <div class="cart-drawer" id="cartDrawer" aria-live="polite">
        <div class="cart-header">
          <div>
            <h3>Mi carrito</h3>
            <span id="cartItemsCount" class="cart-items-count">0 productos</span>
          </div>
          <button id="closeCart" aria-label="Cerrar carrito">✕</button>
        </div>
        <div class="cart-body" id="cartItems">
          <div class="cart-empty" id="cartEmpty">
            <span>🛒</span>
            Tu carrito está vacío
          </div>
        </div>
        <div class="cart-footer" id="cartFooter" style="display:none;">
          <div class="cart-total">
            Total: <span id="totalAmount">$0.00</span>
          </div>
          <button class="btn-primary" type="button" onclick="finalizarCompra()">
            Finalizar compra
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(drawer.firstElementChild);
  } else {
    /* Si el drawer ya está en el HTML (carrito.html),
       asegurarse de que el span de conteo exista */
    const header = document.querySelector('.cart-header');
    if (header && !document.getElementById('cartItemsCount')) {
      const h3 = header.querySelector('h3');
      if (h3) {
        const span = document.createElement('span');
        span.id = 'cartItemsCount';
        span.className = 'cart-items-count';
        span.textContent = '0 productos';
        h3.insertAdjacentElement('afterend', span);
      }
    }
  }

  /* ── Botón del navbar → abrir drawer ────────────────────────── */
  /* Desconectar el redirect a carrito.html que pone navbar.js     */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#cartBtn');
    if (btn) {
      e.stopImmediatePropagation();
      e.preventDefault();
      abrirDrawer();
    }
  }, true); /* capture=true para interceptar antes de navbar.js */

  /* ── Botón de cierre dentro del drawer ──────────────────────── */
  document.addEventListener('click', (e) => {
    if (e.target.closest('#closeCart')) cerrarDrawer();
  });

  /* ── Escape cierra el drawer ─────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarDrawer();
  });

  /* ── Sincronizar si otra pestaña modifica el carrito ─────────── */
  window.addEventListener('storage', (e) => {
    if (e.key === CARRITO_KEY) {
      actualizarContadorGlobalCarrito();
      renderizarCarrito();
    }
  });

  /* Contador inicial */
  actualizarContadorGlobalCarrito();
}

/* Esperar al DOM */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarCarrito);
} else {
  iniciarCarrito();
}