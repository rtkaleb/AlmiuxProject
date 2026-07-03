/* ══════════════════════════════════════════════════════════════════
   ABARROTES ALMIUX — main.js
   Entry point: carga navbar/footer, inicia contadores y animaciones.

   Orden de carga requerido:
     1. utils.js
     2. navbar.js
     3. productos.js
     4. main.js
     [5. registro.js  → solo en usuario/registro.html]
     [6. admin.js     → solo en admin.html]
══════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════
   ANIMACIONES DE ENTRADA AL HACER SCROLL
══════════════════════════════════════════════════════════════════ */

function iniciarAnimacionesScroll() {
  const selectores = [
    '.cat-card',
    '.product-card',
    '.valor-card',
    '.miembro-card',
    '.dato-card',
    '.promo',
    '.hero-text',
    '.page-hero-content',
  ];

  const elementos = document.querySelectorAll(selectores.join(','));
  if (elementos.length === 0) return;

  elementos.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, indice) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, indice * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elementos.forEach(el => observer.observe(el));
}


/* ══════════════════════════════════════════════════════════════════
   CONTADOR ANIMADO (Stats Strip)
══════════════════════════════════════════════════════════════════ */

function iniciarContadores() {
  const strip = document.querySelector('.stats-strip');
  if (!strip) return;
  if (strip.dataset.contadorIniciado) return;
  strip.dataset.contadorIniciado = 'true';

  function animarContador(el, destino, prefijo = '', sufijo = '', duracion = 1200) {
    if (el.dataset.animando) return;
    el.dataset.animando = 'true';
    let inicio = null;
    function paso(timestamp) {
      if (!inicio) inicio = timestamp;
      const progreso  = Math.min((timestamp - inicio) / duracion, 1);
      const suavizado = 1 - Math.pow(1 - progreso, 3);
      el.textContent  = prefijo + Math.floor(suavizado * destino).toLocaleString('es-MX') + sufijo;
      if (progreso < 1) {
        requestAnimationFrame(paso);
      } else {
        el.textContent = prefijo + destino.toLocaleString('es-MX') + sufijo;
        delete el.dataset.animando;
      }
    }
    requestAnimationFrame(paso);
  }

  function correrContadores() {
    document.querySelectorAll('.stat-num[data-target]').forEach(el => {
      const destino = parseInt(el.dataset.target, 10);
      const prefijo = el.dataset.prefix || '';
      const sufijo  = el.dataset.suffix || '';
      if (!isNaN(destino)) animarContador(el, destino, prefijo, sufijo);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    correrContadores();
    observer.unobserve(strip);
  }, { threshold: 0 });

  observer.observe(strip);

  // Seguro: si el strip ya es visible al cargar
  const rect = strip.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    correrContadores();
    observer.unobserve(strip);
  }
}


/* ══════════════════════════════════════════════════════════════════
   DOM READY
══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  iniciarCategoriasHome();

  //CAMBIOOOO
  const basePath = obtenerBasePath();

  // ── Cargar Navbar ────────────────────────────────────────────────
  cargarFragmento(
  `${basePath}/utils/navbar/navbar.html`,
  'navbar-container',
  () => {
    arreglarLinks();
    arreglarImagenes();
    arreglarBotones();
    iniciarNavbar();
    marcarLinkActivo();
    iniciarContadores();
    iniciarAnimacionesScroll();
    if (typeof iniciarCarrito === 'function') iniciarCarrito();
    if (typeof actualizarMenuUsuario === 'function') actualizarMenuUsuario();

    const userBtn  = document.getElementById('userBtn');
    const userMenu = document.getElementById('userMenu');
    if (userBtn && userMenu) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const abierto = userMenu.style.display === 'block';
        userMenu.style.display = abierto ? 'none' : 'block';
        userMenu.setAttribute('aria-hidden', String(abierto));
      });
      document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target) && !userBtn.contains(e.target)) {
          userMenu.style.display = 'none';
          userMenu.setAttribute('aria-hidden', 'true');
        }
      });
    }
  }
  );

  // ── Cargar Footer ────────────────────────────────────────────────
  cargarFragmento(
  `${basePath}utils/footer/footer.html`,
  'footer-container',
    () => {
      arreglarLinks();
      arreglarImagenes();
    }
  );

  // ── Contacto embebido (nosotros.html) ────────────────────────────
  const contenedorContacto = document.getElementById('contacto-container');
  if (contenedorContacto) {
    fetch('./contacto.html')
      .then(res => res.text())
      .then(data => { contenedorContacto.innerHTML = data; })
      .catch(err => console.error(err));
  }

  // ── Página de productos ──────────────────────────────────────────
  if (document.getElementById('productsGrid')) {
    iniciarFiltros();
    iniciarBusqueda();
    revisarFiltroURL();
    renderizarProductos();
  }

});