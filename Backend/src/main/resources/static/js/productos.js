/*productos.js
   Requiere: utils.js
 */

/* Array global que alimenta renderizarProductos(); se llena desde el backend */
const PRODUCTOS = [];

/* Descarga productos y categorías del backend y normaliza al formato interno */
async function cargarProductosDesdeAPI() {
  try {
    /* Obtiene ambas listas en paralelo para reducir tiempo de carga */
    const [productos, categorias] = await Promise.all([
      ProductosAPI.getAll(),
      CategoriasAPI.getAll(),
    ]);

    /* Crea un mapa id→categoría para buscar en O(1) al iterar productos */
    const catMap = {};
    categorias.forEach(c => { catMap[c.id] = c; });

    renderizarFiltrosCategorias(categorias);

    productos.forEach(p => {
      /* Omite productos marcados como inactivos en el backend */
      if (p.activo === false) return;
      /* Resuelve la categoría usando el mapa; usa el objeto embebido como respaldo */
      const cat = catMap[p.categoria?.id] || p.categoria || {};
      /* Normaliza el objeto del backend al shape que usan renderizarProductos y el carrito */
      PRODUCTOS.push({
        id:             p.id,                                          /* ID del backend para poder actualizar/eliminar */
        nombre:         p.nombre,
        desc:           p.descripcion,
        /* Usa precioFinal si hay descuento; si no, usa el precio base */
        precio:         parseFloat(p.precioFinal ?? p.precio) || 0,
        /* Solo muestra precio original tachado si el producto está en oferta */
        precioOriginal: p.enOferta ? parseFloat(p.precio) : null,
        icono:          p.icono || '🛒',
        imagen:         null,                                          /* Las imágenes se sirven como icono de texto */
        cat:            cat.slug    || 'otros',
        catLabel:       cat.nombre  || 'General',
        oferta:         !!p.enOferta,
        /* Badge visible en la tarjeta; cadena vacía si no hay oferta */
        badge:          p.enOferta ? `${p.descuentoPct ?? ''}% OFF`.trim() : '',
      });
    });
  } catch (_) {
    /* Backend no disponible — carga los productos guardados por el panel admin */
    try {
      const adminProds = JSON.parse(localStorage.getItem('almiux_productos_admin')) || [];
      adminProds.forEach(p => PRODUCTOS.push(p));
    } catch (__) {}
  }
}





/* ══════════════════════════════════════════════════════════════════
   RENDERIZAR PRODUCTOS DINÁMICOS
   Usa escapeHtml() para prevenir XSS con datos de localStorage.
══════════════════════════════════════════════════════════════════ */

function renderizarProductos() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  PRODUCTOS.forEach(p => {
    const nombre      = escapeHtml(p.nombre   ?? '');
    const catLabel    = escapeHtml(p.catLabel  ?? '');
    const desc        = escapeHtml(p.desc      ?? '');
    const precio      = parseFloat(p.precio)   || 0;
    const catRaw      = escapeHtml(p.cat       ?? '');
    const imagenSrc   = escapeHtml(p.imagen    ?? '');
    const iconoEsc    = escapeHtml(p.icono     ?? '');
    const badgeEsc    = p.badge ? escapeHtml(p.badge) : '';

    const imgHTML = imagenSrc
      ? `<img src="${imagenSrc}" alt="${nombre}" loading="lazy">`
      : `<span class="prod-icon">${iconoEsc}</span>`;

    const badgeHTML = badgeEsc
      ? `<span class="prod-badge">${badgeEsc}</span>`
      : '';

    const precioOrigHTML = p.precioOriginal
      ? `<span class="prod-original">$${parseFloat(p.precioOriginal).toFixed(2)}</span>`
      : '';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.cat = catRaw;
    if (p.oferta) card.dataset.oferta = 'true';

    card.innerHTML = `
      <div class="prod-img-wrap">
        ${imgHTML}
        ${badgeHTML}
      </div>
      <div class="prod-info">
        <h3 class="prod-name">${nombre}</h3>
        <p class="prod-cat-tag">${catLabel}</p>
        <p class="prod-desc">${desc}</p>
        <div class="prod-prices">
          <span class="prod-price">$${precio.toFixed(2)}</span>
          ${precioOrigHTML}
        </div>
      </div>
    `;

    const btn = document.createElement('button');
    btn.className = 'btn-agregar';
    btn.textContent = '+ Agregar';
    btn.addEventListener('click', () => agregarAlCarrito(btn, p.nombre));
    card.appendChild(btn);

    grid.appendChild(card);
  });

  actualizarUICarrito();
}


/* ══════════════════════════════════════════════════════════════════
   FILTROS DE CATEGORÍA
══════════════════════════════════════════════════════════════════ */

function renderizarFiltrosCategorias(categorias) {
  const contenedor = document.getElementById('filters');
  if (!contenedor || !categorias?.length) return;

  const emojiMap = {
    carnes: '🥩', lacteos: '🥛', bebidas: '🥤', enlatados: '🫙',
    limpieza: '🧴', panaderia: '🍞', especias: '🌶️', botanas: '🍬',
    abarrotes: '🏪', higiene_personal: '🪥',
  };

  const botonesDinamicos = categorias.map(cat => {
    const emoji = emojiMap[cat.slug] || '🏷️';
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.filter = cat.slug || cat.id;
    btn.textContent = `${emoji} ${cat.nombre}`;
    return btn;
  });

  const btnOferta = contenedor.querySelector('[data-filter="ofertas"]');
  contenedor.querySelectorAll('.filter-btn:not([data-filter="all"]):not([data-filter="ofertas"])').forEach(b => b.remove());

  botonesDinamicos.forEach(btn => {
    if (btnOferta) contenedor.insertBefore(btn, btnOferta);
    else contenedor.appendChild(btn);
  });
}

function iniciarFiltros() {
  const botonesFiltro = document.querySelectorAll('.filter-btn');
  if (botonesFiltro.length === 0) return;

  botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
      botonesFiltro.forEach(b => b.classList.remove('filter-active'));
      boton.classList.add('filter-active');
      aplicarFiltro(boton.dataset.filter);
    });
  });
}

function aplicarFiltro(filtro) {
  const tarjetas      = document.querySelectorAll('.product-card');
  const contadorTexto = document.getElementById('resultsCount');
  const noResultados  = document.getElementById('noResults');
  let visibles = 0;

  tarjetas.forEach(tarjeta => {
    let mostrar = false;
    if (filtro === 'all') {
      mostrar = true;
    } else if (filtro === 'ofertas') {
      mostrar = tarjeta.dataset.oferta === 'true';
    } else {
      mostrar = tarjeta.dataset.cat.split(' ').includes(filtro);
    }
    tarjeta.classList.toggle('hidden', !mostrar);
    if (mostrar) visibles++;
  });

  if (contadorTexto) {
    contadorTexto.textContent = filtro === 'all'
      ? 'Mostrando todos los productos'
      : `${visibles} producto${visibles !== 1 ? 's' : ''} encontrado${visibles !== 1 ? 's' : ''}`;
  }

  if (noResultados) noResultados.style.display = visibles === 0 ? 'block' : 'none';
}

function resetFiltros() {
  const botonTodos = document.querySelector('.filter-btn[data-filter="all"]');
  if (botonTodos) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-active'));
    botonTodos.classList.add('filter-active');
  }
  aplicarFiltro('all');
}


/* ══════════════════════════════════════════════════════════════════
   BÚSQUEDA EN TIEMPO REAL
══════════════════════════════════════════════════════════════════ */

function iniciarBusqueda() {
  const inputBusqueda = document.getElementById('searchInput');
  if (!inputBusqueda) return;

  inputBusqueda.addEventListener('input', () => {
    const termino       = inputBusqueda.value.toLowerCase().trim();
    const tarjetas      = document.querySelectorAll('.product-card');
    const noResultados  = document.getElementById('noResults');
    const contadorTexto = document.getElementById('resultsCount');

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-active'));
    const botonTodos = document.querySelector('.filter-btn[data-filter="all"]');
    if (botonTodos) botonTodos.classList.add('filter-active');

    let visibles = 0;
    tarjetas.forEach(tarjeta => {
      const nombre   = tarjeta.querySelector('.prod-name')?.textContent.toLowerCase()    || '';
      const desc     = tarjeta.querySelector('.prod-desc')?.textContent.toLowerCase()    || '';
      const cat      = tarjeta.querySelector('.prod-cat-tag')?.textContent.toLowerCase() || '';
      const coincide = nombre.includes(termino) || desc.includes(termino) || cat.includes(termino);
      tarjeta.classList.toggle('hidden', !coincide && termino !== '');
      if (coincide || termino === '') visibles++;
    });

    if (contadorTexto) {
      contadorTexto.textContent = termino
        ? `${visibles} resultado${visibles !== 1 ? 's' : ''} para "${termino}"`
        : 'Mostrando todos los productos';
    }
    if (noResultados) noResultados.style.display = visibles === 0 ? 'block' : 'none';
  });
}


/* ══════════════════════════════════════════════════════════════════
   CATEGORÍAS HOME → PRODUCTOS CON FILTRO
   Incluye accesibilidad: role="button", tabindex, teclado.
══════════════════════════════════════════════════════════════════ */

function iniciarCategoriasHome() {
  const tarjetasCat = document.querySelectorAll('.cat-card[data-cat]');
  if (tarjetasCat.length === 0) return;

  tarjetasCat.forEach(tarjeta => {
    tarjeta.setAttribute('role', 'button');
    tarjeta.setAttribute('tabindex', '0');

    const navegar = () => {
      window.location.href = `productos.html?filtro=${tarjeta.dataset.cat}`;
    };

    tarjeta.addEventListener('click', navegar);
    tarjeta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navegar();
      }
    });
  });
}

function revisarFiltroURL() {
  const filtro = new URLSearchParams(window.location.search).get('filtro');
  if (!filtro) return;

  const botonFiltro = document.querySelector(`.filter-btn[data-filter="${filtro}"]`);
  if (botonFiltro) {
    botonFiltro.click();
    setTimeout(() => {
      document.getElementById('productsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
}


if(typeof actualizarContadorGlobalCarrito==='function'){
  actualizarContadorGlobalCarrito();
}

/* ── Inicialización con datos del backend ────────────────────────── */
/* Solo se ejecuta en páginas que tienen el grid de productos */
document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('productsGrid')) {
    /* Primero carga los datos para que renderizarProductos tenga algo que mostrar */
    await cargarProductosDesdeAPI();
    /* Dibuja las tarjetas en el DOM */
    renderizarProductos();
    /* Conecta los botones de filtro por categoría */
    iniciarFiltros();
    /* Conecta el input de búsqueda en tiempo real */
    iniciarBusqueda();
    /* Aplica el filtro si la URL tiene ?filtro=... (viene desde el home) */
    revisarFiltroURL();
  }
  /* Siempre inicializa las tarjetas de categoría del home */
  iniciarCategoriasHome();
});
