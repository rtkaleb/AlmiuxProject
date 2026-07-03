/* ═══════════════════════════════════════════════════════════════
   ADMIN.JS — Panel de administración de Abarrotes Almiux
═══════════════════════════════════════════════════════════════ */

/* ─── Credenciales del administrador ───────────────────────────
   La contraseña se guarda en localStorage como base64 igual que
   los usuarios normales. Si no existe, se crea al inicio.
─────────────────────────────────────────────────────────────── */
const ADMIN_STORAGE_KEY = 'almiux_admin_creds';
const DEFAULT_ADMIN = { email: 'admin@almiux.com', password: btoa('Admin1234') };

function getAdminCreds() {
  try { return JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY)) || DEFAULT_ADMIN; }
  catch { return DEFAULT_ADMIN; }
}

function checkAdminCreds(email, password) {
  const creds = getAdminCreds();
  return email.toLowerCase() === creds.email.toLowerCase() &&
         atob(creds.password) === password;
}

/* ─── Sesión admin (sessionStorage) ────────────────────────── */
const ADMIN_SESSION_KEY = 'almiux_admin_sesion';

function getAdminSession() {
  try { return JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY)) || null; }
  catch { return null; }
}

function setAdminSession(email) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ email, ts: Date.now() }));
}

function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

/* ─── Storage helpers ───────────────────────────────────────── */
const PROD_KEY  = 'almiux_productos_admin';
const CAT_KEY   = 'almiux_categorias_admin';
const ORDER_KEY = 'almiux_pedidos';

function getProductos() {
  try { return JSON.parse(localStorage.getItem(PROD_KEY)) || []; } catch { return []; }
}
function saveProductos(list) { localStorage.setItem(PROD_KEY, JSON.stringify(list)); }

function getCategorias() {
  try {
    const saved = JSON.parse(localStorage.getItem(CAT_KEY));
    return saved || DEFAULT_CATS.slice();
  } catch { return DEFAULT_CATS.slice(); }
}
function saveCategorias(list) { localStorage.setItem(CAT_KEY, JSON.stringify(list)); }

function getUsuarios() {
  try { return JSON.parse(localStorage.getItem('almiux_usuarios')) || []; } catch { return []; }
}

function getPedidos() {
  try { return JSON.parse(localStorage.getItem(ORDER_KEY)) || []; } catch { return []; }
}
function savePedidos(list) { localStorage.setItem(ORDER_KEY, JSON.stringify(list)); }

/* ─── Categorías por defecto ────────────────────────────────── */
const DEFAULT_CATS = [
  { slug: 'carnes',    nombre: 'Carnes',           icono: '🥩', color: '#dc3545' },
  { slug: 'lacteos',   nombre: 'Lácteos',           icono: '🥛', color: '#6f42c1' },
  { slug: 'bebidas',   nombre: 'Bebidas',            icono: '🧃', color: '#0d6efd' },
  { slug: 'enlatados', nombre: 'Enlatados',          icono: '🥫', color: '#fd7e14' },
  { slug: 'limpieza',  nombre: 'Limpieza',           icono: '🧹', color: '#20c997' },
  { slug: 'panaderia', nombre: 'Panadería',          icono: '🥖', color: '#e9a225' },
  { slug: 'especias',  nombre: 'Especias',           icono: '🌶️', color: '#d63384' },
  { slug: 'botanas',   nombre: 'Botanas',            icono: '🍿', color: '#198754' },
  { slug: 'abarrotes', nombre: 'Abarrotes',          icono: '🛒', color: '#D45F1A' },
  { slug: 'higiene',   nombre: 'Higiene personal',   icono: '🧴', color: '#0dcaf0' },
];

const COLORS_PALETTE = [
  '#D45F1A','#dc3545','#fd7e14','#e9a225','#198754',
  '#20c997','#0d6efd','#6f42c1','#d63384','#0dcaf0',
  '#2C1A0E','#7A4A26','#495057','#343a40',
];

/* ═══════════════════════════════════════════════════════════════
   BOOTSTRAP — arranque al cargar el DOM
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (getAdminSession()) {
    showDashboard();
  } else {
    showLogin();
  }
  initLogin();
  initDashboard();
});

/* ─── Mostrar / ocultar secciones ──────────────────────────── */
function showLogin() {
  document.getElementById('adminLoginSection').style.display  = 'flex';
  document.getElementById('adminDashboard').style.display     = 'none';
}

function showDashboard() {
  document.getElementById('adminLoginSection').style.display  = 'none';
  document.getElementById('adminDashboard').style.display     = 'block';
  const sess = getAdminSession();
  document.getElementById('dashAdminEmail').textContent = sess?.email || 'admin@almiux.com';
  refreshAll();
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════════ */
function initLogin() {
  const form   = document.getElementById('adminLoginForm');
  const eyeBtn = document.getElementById('toggleAdminPwd');
  const pwdIn  = document.getElementById('adminPwd');
  const pwdIco = document.getElementById('adminPwdIcon');

  eyeBtn?.addEventListener('click', () => {
    const show = pwdIn.type === 'password';
    pwdIn.type = show ? 'text' : 'password';
    pwdIco.className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const pwd   = document.getElementById('adminPwd').value;

    const errEmail = document.getElementById('errAdminEmail');
    const errPwd   = document.getElementById('errAdminPwd');
    const alertaEl = document.getElementById('loginAlertaError');

    errEmail.classList.remove('visible');
    errPwd.classList.remove('visible');
    alertaEl.style.display = 'none';

    let ok = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errEmail.classList.add('visible'); ok = false;
    }
    if (!pwd) {
      errPwd.classList.add('visible'); ok = false;
    }
    if (!ok) return;

    if (checkAdminCreds(email, pwd)) {
      setAdminSession(email);
      showDashboard();
    } else {
      document.getElementById('loginAlertaErrorMsg').textContent = 'Correo o contraseña incorrectos.';
      alertaEl.style.display = 'flex';
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD — inicialización general
═══════════════════════════════════════════════════════════════ */
function initDashboard() {
  // Navegación sidebar
  document.querySelectorAll('.dash-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.dataset.panel;
      switchPanel(panel);
      // cerrar sidebar en mobile
      closeSidebarMobile();
    });
  });

  // Logout
  document.getElementById('btnLogout')?.addEventListener('click', () => {
    clearAdminSession();
    showLogin();
  });

  // Toggle sidebar mobile
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('dashSidebar').classList.toggle('open');
    document.getElementById('sidebarBackdrop').classList.toggle('open');
  });
  document.getElementById('sidebarBackdrop')?.addEventListener('click', closeSidebarMobile);

  initModalProducto();
  initModalCategoria();
  initModalConfirm();
  initModalPedido();
  buildColorSwatches();
}

function closeSidebarMobile() {
  document.getElementById('dashSidebar')?.classList.remove('open');
  document.getElementById('sidebarBackdrop')?.classList.remove('open');
}

function switchPanel(name) {
  // Nav items
  document.querySelectorAll('.dash-nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.panel === name);
  });
  // Panels
  document.querySelectorAll('.dash-panel').forEach(p => {
    p.classList.toggle('active', p.id === `panel-${name}`);
  });
  // Topbar title
  const titles = {
    inicio:     'Inicio',
    productos:  'Productos',
    categorias: 'Categorías',
    usuarios:   'Usuarios',
    pedidos:    'Pedidos',
  };
  document.getElementById('dashPanelTitle').textContent = titles[name] || name;

  // Render el panel activo
  if (name === 'inicio')     renderInicio();
  if (name === 'productos')  renderProductos();
  if (name === 'categorias') renderCategorias();
  if (name === 'usuarios')   renderUsuarios();
  if (name === 'pedidos')    renderPedidos();
}

function refreshAll() {
  renderInicio();
  renderProductos();
  renderCategorias();
  renderUsuarios();
  renderPedidos();
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: INICIO
═══════════════════════════════════════════════════════════════ */
function renderInicio() {
  const prods   = getProductos();
  const cats    = getCategorias();
  const users   = getUsuarios();
  const pedidos = getPedidos();

  document.getElementById('statProductos').textContent  = prods.length;
  document.getElementById('statCategorias').textContent = cats.length;
  document.getElementById('statUsuarios').textContent   = users.length;
  document.getElementById('statPedidos').textContent    = pedidos.length;

  const tbody = document.getElementById('inicioProductosTbody');
  const ultimos = prods.slice(-5).reverse();

  if (ultimos.length === 0) {
    tbody.innerHTML = `<tr><td class="table-empty" colspan="5">Sin productos aún.</td></tr>`;
    return;
  }

  tbody.innerHTML = ultimos.map(p => `
    <tr>
      <td>${p.imagen
        ? `<img class="prod-thumb" src="${p.imagen}" alt="${p.nombre}">`
        : `<div class="prod-thumb-placeholder">${p.icono || '📦'}</div>`}</td>
      <td>${esc(p.nombre)}</td>
      <td>${esc(p.catLabel || p.cat)}</td>
      <td>$${Number(p.precio).toFixed(2)}</td>
      <td>${p.creadoEn || '—'}</td>
    </tr>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: PRODUCTOS
═══════════════════════════════════════════════════════════════ */
function renderProductos() {
  const tbody = document.getElementById('productosTableBody');
  const prods = getProductos();

  if (prods.length === 0) {
    tbody.innerHTML = `<tr><td class="table-empty" colspan="6">No hay productos. ¡Crea el primero!</td></tr>`;
    return;
  }

  tbody.innerHTML = prods.map((p, i) => `
    <tr style="cursor:pointer" onclick="editarProducto(${i})">
      <td>${p.imagen
        ? `<img class="prod-thumb" src="${p.imagen}" alt="${p.nombre}">`
        : `<div class="prod-thumb-placeholder">${p.icono || '📦'}</div>`}</td>
      <td><strong>${esc(p.nombre)}</strong><br><small style="color:var(--color-muted)">${esc((p.desc||'').slice(0,50))}…</small></td>
      <td>${esc(p.catLabel || p.cat)}</td>
      <td>$${Number(p.precio).toFixed(2)}
        ${p.precioOriginal ? `<br><small style="text-decoration:line-through;color:var(--color-muted)">$${Number(p.precioOriginal).toFixed(2)}</small>` : ''}
      </td>
      <td>${p.oferta ? `<span class="tag oferta">${p.badge || 'Oferta'}</span>` : '—'}</td>
      <td style="white-space:nowrap" onclick="event.stopPropagation()">
        <button class="btn-dash secondary sm" onclick="editarProducto(${i})"><i class="fa-solid fa-pen"></i> Editar</button>
        <button class="btn-dash danger sm" onclick="eliminarProducto(${i})" style="margin-left:.3rem"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

/* ── Modal Producto ─────────────────────────────────────────── */
let editingProdIndex = -1;

function initModalProducto() {
  document.getElementById('btnNuevoProducto')?.addEventListener('click', () => abrirModalProducto(-1));
  document.getElementById('btnCancelarProducto')?.addEventListener('click', cerrarModalProducto);
  document.getElementById('btnGuardarProducto')?.addEventListener('click', guardarProducto);
  document.getElementById('mpOferta')?.addEventListener('change', e => {
    document.getElementById('mpDescuentoGroup').style.display = e.target.checked ? '' : 'none';
  });
  document.getElementById('mpImagen')?.addEventListener('input', e => {
    const url  = e.target.value.trim();
    const wrap = document.getElementById('mpImagenPreviewWrap');
    const img  = document.getElementById('mpImagenPreview');
    if (url) {
      img.src = url;
      wrap.style.display = '';
    } else {
      wrap.style.display = 'none';
    }
  });
  document.getElementById('modalProducto')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modalProducto')) cerrarModalProducto();
  });
}

function abrirModalProducto(index) {
  editingProdIndex = index;
  const modal = document.getElementById('modalProducto');
  document.getElementById('modalProdError').style.display = 'none';
  document.getElementById('mpDescuentoGroup').style.display = 'none';
  document.getElementById('mpImagenPreviewWrap').style.display = 'none';

  // Poblar select de categorías
  const cats = getCategorias();
  const sel  = document.getElementById('mpCategoria');
  sel.innerHTML = `<option value="">Selecciona una categoría</option>` +
    cats.map(c => `<option value="${esc(c.slug)}">${esc(c.nombre)}</option>`).join('');

  if (index === -1) {
    document.getElementById('modalProductoTitle').textContent = 'Nuevo producto';
    document.getElementById('mpNombre').value = '';
    document.getElementById('mpDescripcion').value = '';
    document.getElementById('mpCategoria').value = '';
    document.getElementById('mpPrecio').value = '';
    document.getElementById('mpOferta').checked = false;
    document.getElementById('mpDescuento').value = '';
    document.getElementById('mpImagen').value = '';
  } else {
    const p = getProductos()[index];
    document.getElementById('modalProductoTitle').textContent = 'Editar producto';
    document.getElementById('mpNombre').value       = p.nombre;
    document.getElementById('mpDescripcion').value  = p.desc;
    document.getElementById('mpCategoria').value    = p.cat;
    document.getElementById('mpPrecio').value       = p.precioOriginal || p.precio;
    document.getElementById('mpOferta').checked     = !!p.oferta;
    if (p.oferta) {
      document.getElementById('mpDescuentoGroup').style.display = '';
      const badge = p.badge || '';
      const pct   = parseInt(badge.replace(/[^0-9]/g, '')) || 0;
      document.getElementById('mpDescuento').value = pct;
    }
    document.getElementById('mpImagen').value = p.imagen || '';
    if (p.imagen) {
      document.getElementById('mpImagenPreview').src = p.imagen;
      document.getElementById('mpImagenPreviewWrap').style.display = '';
    }
  }

  modal.classList.add('open');
}

function cerrarModalProducto() {
  document.getElementById('modalProducto').classList.remove('open');
}

async function guardarProducto() {
  const nombre      = document.getElementById('mpNombre').value.trim();
  const desc        = document.getElementById('mpDescripcion').value.trim();
  const cat         = document.getElementById('mpCategoria').value;
  const precioRaw   = parseFloat(document.getElementById('mpPrecio').value);
  const enOferta    = document.getElementById('mpOferta').checked;
  const descuentoPct = parseInt(document.getElementById('mpDescuento').value) || 0;
  const imagenInput = document.getElementById('mpImagen');

  const errEl = document.getElementById('modalProdError');
  const msgs  = [];
  if (!nombre)         msgs.push('Nombre obligatorio');
  if (!desc)           msgs.push('Descripción obligatoria');
  if (!cat)            msgs.push('Categoría obligatoria');
  if (isNaN(precioRaw) || precioRaw <= 0) msgs.push('Precio inválido');
  if (enOferta && (descuentoPct < 1 || descuentoPct > 99)) msgs.push('Descuento debe ser 1-99%');

  if (msgs.length) {
    document.getElementById('modalProdErrorMsg').textContent = msgs.join(' · ');
    errEl.style.display = 'flex';
    return;
  }
  errEl.style.display = 'none';

  // Usar URL de imagen directamente
  const urlNueva = imagenInput.value.trim();
  const imagenBase64 = urlNueva || (editingProdIndex >= 0 ? getProductos()[editingProdIndex].imagen : null);

  const cats         = getCategorias();
  const catObj       = cats.find(c => c.slug === cat) || {};
  const precioFinal  = enOferta && descuentoPct > 0
    ? parseFloat((precioRaw * (1 - descuentoPct / 100)).toFixed(2))
    : precioRaw;
  const precioOriginal = enOferta && descuentoPct > 0 ? precioRaw : null;

  const etiquetas = Object.fromEntries(cats.map(c => [c.slug, c.nombre]));

  const producto = {
    id:            editingProdIndex >= 0 ? getProductos()[editingProdIndex].id : `prod_${Date.now()}`,
    nombre,
    desc,
    cat,
    catLabel:      catObj.nombre || etiquetas[cat] || cat,
    precio:        precioFinal,
    precioOriginal,
    oferta:        enOferta,
    badge:         enOferta && descuentoPct > 0 ? `-${descuentoPct}%` : (enOferta ? 'Oferta' : null),
    icono:         catObj.icono || '📦',
    imagen:        imagenBase64,
    creadoEn:      editingProdIndex >= 0
      ? getProductos()[editingProdIndex].creadoEn
      : new Date().toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' }),
  };

  const lista = getProductos();
  if (editingProdIndex >= 0) lista[editingProdIndex] = producto;
  else lista.push(producto);
  saveProductos(lista);

  cerrarModalProducto();
  renderProductos();
  renderInicio();
}

function editarProducto(index) { abrirModalProducto(index); }

function eliminarProducto(index) {
  openConfirm(
    '¿Eliminar producto?',
    'El producto se eliminará permanentemente del catálogo.',
    () => {
      const lista = getProductos();
      lista.splice(index, 1);
      saveProductos(lista);
      renderProductos();
      renderInicio();
    }
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: CATEGORÍAS
═══════════════════════════════════════════════════════════════ */
function renderCategorias() {
  const grid = document.getElementById('categoriasGrid');
  const cats = getCategorias();
  const prods = getProductos();

  if (cats.length === 0) {
    grid.innerHTML = `<p style="color:var(--color-muted);font-size:.875rem;">No hay categorías.</p>`;
    return;
  }

  grid.innerHTML = cats.map((c, i) => {
    const count = prods.filter(p => p.cat === c.slug).length;
    return `
      <div class="cat-card">
        <div style="display:flex;align-items:center;gap:.4rem;">
          <span style="font-size:1.2rem;">${c.icono || '📦'}</span>
          <span class="cat-name">${esc(c.nombre)}</span>
        </div>
        <div class="cat-count">${count} producto${count !== 1 ? 's' : ''}</div>
        <div style="font-size:.75rem;color:var(--color-muted)">
          <span class="cat-color-dot" style="background:${c.color}"></span>${esc(c.slug)}
        </div>
        <div class="cat-actions">
          <button class="btn-dash secondary sm" onclick="editarCategoria(${i})"><i class="fa-solid fa-pen"></i> Editar</button>
          <button class="btn-dash danger sm" onclick="eliminarCategoria(${i})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

/* ── Modal Categoría ────────────────────────────────────────── */
let editingCatIndex = -1;
let selectedColor   = '#D45F1A';

function buildColorSwatches() {
  const wrap = document.getElementById('colorSwatches');
  if (!wrap) return;
  wrap.innerHTML = COLORS_PALETTE.map(c => `
    <div class="color-swatch ${c === selectedColor ? 'selected' : ''}"
         style="background:${c}"
         data-color="${c}"
         title="${c}"
         onclick="selectColor('${c}')"></div>
  `).join('');
}

function selectColor(color) {
  selectedColor = color;
  document.getElementById('mcColor').value = color;
  document.querySelectorAll('.color-swatch').forEach(el => {
    el.classList.toggle('selected', el.dataset.color === color);
  });
}

function initModalCategoria() {
  document.getElementById('btnNuevaCategoria')?.addEventListener('click', () => abrirModalCategoria(-1));
  document.getElementById('btnCancelarCategoria')?.addEventListener('click', cerrarModalCategoria);
  document.getElementById('btnGuardarCategoria')?.addEventListener('click', guardarCategoria);
  document.getElementById('mcNombre')?.addEventListener('input', e => {
    const slug = document.getElementById('mcSlug');
    if (editingCatIndex === -1) {
      slug.value = e.target.value.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }
  });
  document.getElementById('modalCategoria')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modalCategoria')) cerrarModalCategoria();
  });
}

function abrirModalCategoria(index) {
  editingCatIndex = index;
  buildColorSwatches();
  if (index === -1) {
    document.getElementById('modalCategoriaTitle').textContent = 'Nueva categoría';
    document.getElementById('mcNombre').value = '';
    document.getElementById('mcSlug').value   = '';
    document.getElementById('mcIcono').value  = '';
    selectColor('#D45F1A');
  } else {
    const c = getCategorias()[index];
    document.getElementById('modalCategoriaTitle').textContent = 'Editar categoría';
    document.getElementById('mcNombre').value = c.nombre;
    document.getElementById('mcSlug').value   = c.slug;
    document.getElementById('mcIcono').value  = c.icono || '';
    selectColor(c.color || '#D45F1A');
  }
  document.getElementById('modalCategoria').classList.add('open');
}

function cerrarModalCategoria() {
  document.getElementById('modalCategoria').classList.remove('open');
}

function guardarCategoria() {
  const nombre = document.getElementById('mcNombre').value.trim();
  const slug   = document.getElementById('mcSlug').value.trim().toLowerCase();
  const icono  = document.getElementById('mcIcono').value.trim() || '📦';
  const color  = document.getElementById('mcColor').value;

  if (!nombre || !slug) {
    alert('Nombre y clave son obligatorios.');
    return;
  }

  const lista = getCategorias();

  // Verificar slug duplicado (excepto la misma)
  const dup = lista.findIndex((c, i) => c.slug === slug && i !== editingCatIndex);
  if (dup !== -1) { alert('La clave ya existe. Usa una diferente.'); return; }

  const cat = { slug, nombre, icono, color };
  if (editingCatIndex >= 0) lista[editingCatIndex] = cat;
  else lista.push(cat);
  saveCategorias(lista);

  cerrarModalCategoria();
  renderCategorias();
}

function editarCategoria(index) { abrirModalCategoria(index); }

function eliminarCategoria(index) {
  const cat   = getCategorias()[index];
  const prods = getProductos().filter(p => p.cat === cat.slug).length;
  const msg   = prods > 0
    ? `La categoría tiene ${prods} producto(s). Al eliminarla, los productos quedarán sin categoría.`
    : 'Esta acción no se puede deshacer.';

  openConfirm('¿Eliminar categoría?', msg, () => {
    const lista = getCategorias();
    lista.splice(index, 1);
    saveCategorias(lista);
    renderCategorias();
    renderInicio();
  });
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: USUARIOS
═══════════════════════════════════════════════════════════════ */
function renderUsuarios() {
  const tbody   = document.getElementById('usuariosTableBody');
  const usuarios = getUsuarios();

  if (usuarios.length === 0) {
    tbody.innerHTML = `<tr><td class="table-empty" colspan="5">No hay usuarios registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = usuarios.map((u, i) => {
    const inicial = ((u.nombres || u.email || '?')[0]).toUpperCase();
    const estado  = u.bloqueado ? 'inactivo' : 'activo';
    const textoEstado = u.bloqueado ? 'Bloqueado' : 'Activo';
    return `
      <tr style="cursor:pointer" title="Ver detalles">
        <td>
          <span class="user-avatar">${inicial}</span>
          ${esc((u.nombres || '') + ' ' + (u.apellidos || ''))}
        </td>
        <td>${esc(u.email)}</td>
        <td>${esc(u.telefono || '—')}</td>
        <td><span class="tag ${estado}">${textoEstado}</span></td>
        <td style="white-space:nowrap" onclick="event.stopPropagation()">
          <button class="btn-dash ${u.bloqueado ? 'secondary' : 'danger'} sm"
                  onclick="toggleBloquearUsuario(${i})">
            <i class="fa-solid fa-${u.bloqueado ? 'unlock' : 'ban'}"></i>
            ${u.bloqueado ? 'Desbloquear' : 'Bloquear'}
          </button>
          <button class="btn-dash danger sm" onclick="eliminarUsuario(${i})" style="margin-left:.3rem">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleBloquearUsuario(index) {
  const lista = getUsuarios();
  lista[index].bloqueado = !lista[index].bloqueado;
  localStorage.setItem('almiux_usuarios', JSON.stringify(lista));
  renderUsuarios();
  renderInicio();
}

function eliminarUsuario(index) {
  const u = getUsuarios()[index];
  openConfirm(
    '¿Eliminar usuario?',
    `Se eliminará la cuenta de ${esc(u.email)}. Esta acción no se puede deshacer.`,
    () => {
      const lista = getUsuarios();
      lista.splice(index, 1);
      localStorage.setItem('almiux_usuarios', JSON.stringify(lista));
      renderUsuarios();
      renderInicio();
    }
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: PEDIDOS
═══════════════════════════════════════════════════════════════ */
function renderPedidos() {
  const tbody   = document.getElementById('pedidosTableBody');
  const pedidos = getPedidos();

  if (pedidos.length === 0) {
    tbody.innerHTML = `<tr><td class="table-empty" colspan="6">No hay pedidos registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = pedidos.slice().reverse().map((p, idx) => {
    const realIdx = pedidos.length - 1 - idx;
    const total = Array.isArray(p.items)
      ? p.items.reduce((s, it) => s + (it.precio || 0) * (it.cantidad || 1), 0)
      : (p.total || 0);
    const estado = p.estado || 'pendiente';
    const nItems = Array.isArray(p.items) ? p.items.length : '—';
    return `
      <tr>
        <td><code style="font-size:.75rem">${esc(p.id || `#${realIdx + 1}`)}</code></td>
        <td>${esc(p.cliente || p.email || '—')}</td>
        <td>${nItems} artículo${nItems !== 1 ? 's' : ''}</td>
        <td>$${Number(total).toFixed(2)}</td>
        <td>
          <select class="btn-dash secondary sm" style="padding:.25rem .4rem;border-radius:6px;"
                  onchange="cambiarEstadoPedido(${realIdx}, this.value)">
            ${['pendiente','en proceso','enviado','completado','cancelado'].map(s =>
              `<option value="${s}" ${estado === s ? 'selected' : ''}>${capitalizar(s)}</option>`
            ).join('')}
          </select>
        </td>
        <td>
          <button class="btn-dash secondary sm" onclick="verDetallePedido(${realIdx})">
            <i class="fa-solid fa-eye"></i> Ver
          </button>
          <button class="btn-dash danger sm" onclick="eliminarPedido(${realIdx})" style="margin-left:.3rem">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function cambiarEstadoPedido(index, estado) {
  const lista = getPedidos();
  if (!lista[index]) return;
  lista[index].estado = estado;
  savePedidos(lista);
}

function eliminarPedido(index) {
  openConfirm('¿Eliminar pedido?', 'El pedido se eliminará del registro.', () => {
    const lista = getPedidos();
    lista.splice(index, 1);
    savePedidos(lista);
    renderPedidos();
    renderInicio();
  });
}

function verDetallePedido(index) {
  const p   = getPedidos()[index];
  if (!p) return;
  const total = Array.isArray(p.items)
    ? p.items.reduce((s, it) => s + (it.precio || 0) * (it.cantidad || 1), 0)
    : (p.total || 0);

  const itemsHTML = Array.isArray(p.items) && p.items.length
    ? `<table style="width:100%;border-collapse:collapse;font-size:.82rem;margin-top:.5rem;">
        <thead><tr>
          <th style="text-align:left;padding:.35rem .5rem;border-bottom:1px solid var(--color-border);color:var(--color-muted)">Producto</th>
          <th style="text-align:right;padding:.35rem .5rem;border-bottom:1px solid var(--color-border);color:var(--color-muted)">Cant.</th>
          <th style="text-align:right;padding:.35rem .5rem;border-bottom:1px solid var(--color-border);color:var(--color-muted)">Precio</th>
          <th style="text-align:right;padding:.35rem .5rem;border-bottom:1px solid var(--color-border);color:var(--color-muted)">Subtotal</th>
        </tr></thead>
        <tbody>${p.items.map(it => `
          <tr>
            <td style="padding:.35rem .5rem;">${esc(it.nombre || it.name || '—')}</td>
            <td style="padding:.35rem .5rem;text-align:right;">${it.cantidad || 1}</td>
            <td style="padding:.35rem .5rem;text-align:right;">$${Number(it.precio || 0).toFixed(2)}</td>
            <td style="padding:.35rem .5rem;text-align:right;">$${(Number(it.precio || 0) * (it.cantidad || 1)).toFixed(2)}</td>
          </tr>`).join('')}
        </tbody>
      </table>`
    : '<p style="color:var(--color-muted);font-size:.82rem;">Sin detalle de artículos.</p>';

  document.getElementById('modalPedidoContent').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem 1rem;margin-bottom:.75rem;font-size:.82rem;">
      <div><strong>ID:</strong> ${esc(p.id || '—')}</div>
      <div><strong>Estado:</strong> ${capitalizar(p.estado || 'pendiente')}</div>
      <div><strong>Cliente:</strong> ${esc(p.cliente || p.email || '—')}</div>
      <div><strong>Fecha:</strong> ${p.fecha || '—'}</div>
    </div>
    <strong style="font-size:.85rem;">Artículos</strong>
    ${itemsHTML}
    <div style="text-align:right;margin-top:.75rem;font-weight:600;font-size:.95rem;">
      Total: $${Number(total).toFixed(2)}
    </div>
  `;
  document.getElementById('modalPedido').classList.add('open');
}

function initModalPedido() {
  document.getElementById('btnCerrarPedido')?.addEventListener('click', () => {
    document.getElementById('modalPedido').classList.remove('open');
  });
  document.getElementById('modalPedido')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modalPedido'))
      document.getElementById('modalPedido').classList.remove('open');
  });
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: CONFIRMAR ELIMINACIÓN
═══════════════════════════════════════════════════════════════ */
let confirmCallback = null;

function initModalConfirm() {
  document.getElementById('btnConfirmCancel')?.addEventListener('click', () => {
    document.getElementById('modalConfirm').classList.remove('open');
    confirmCallback = null;
  });
  document.getElementById('btnConfirmOk')?.addEventListener('click', () => {
    document.getElementById('modalConfirm').classList.remove('open');
    if (typeof confirmCallback === 'function') confirmCallback();
    confirmCallback = null;
  });
}

function openConfirm(title, msg, cb) {
  document.getElementById('modalConfirmTitle').textContent = title;
  document.getElementById('modalConfirmMsg').textContent   = msg;
  confirmCallback = cb;
  document.getElementById('modalConfirm').classList.add('open');
}

/* ═══════════════════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════════════════ */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function capitalizar(str) {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

/* Compatibilidad: funciones globales usadas desde HTML onclick */
window.editarProducto    = editarProducto;
window.eliminarProducto  = eliminarProducto;
window.editarCategoria   = editarCategoria;
window.eliminarCategoria = eliminarCategoria;
window.toggleBloquearUsuario = toggleBloquearUsuario;
window.eliminarUsuario   = eliminarUsuario;
window.verDetallePedido  = verDetallePedido;
window.eliminarPedido    = eliminarPedido;
window.cambiarEstadoPedido = cambiarEstadoPedido;
window.selectColor       = selectColor;

/* ═══════════════════════════════════════════════════════════════
   SINCRONIZACIÓN CON BACKEND
   Carga datos desde la API y los refleja en localStorage para que
   los renders existentes funcionen sin cambios.
═══════════════════════════════════════════════════════════════ */

async function sincronizarDesdeAPI() {
  try {
    const [productos, categorias, pedidos, usuarios] = await Promise.allSettled([
      ProductosAPI.getAll(),
      CategoriasAPI.getAll(),
      PedidosAPI.getAll(),
      UsuariosAPI.getAll(),
    ]);

    if (categorias.status === 'fulfilled') {
      const cats = categorias.value.map(c => ({
        id:     c.id,
        slug:   c.slug || c.nombre.toLowerCase().replace(/\s+/g, '-'),
        nombre: c.nombre,
        icono:  c.icono || '📦',
        color:  '#D45F1A',
        descripcion: c.descripcion || '',
      }));
      saveCategorias(cats);
    }

    if (productos.status === 'fulfilled') {
      const cats = getCategorias();
      const catMap = {};
      cats.forEach(c => { catMap[c.id] = c; });

      const prods = productos.value.map(p => {
        const cat = catMap[p.categoria?.id] || {};
        return {
          id:            p.id,
          _backendId:    p.id,
          nombre:        p.nombre,
          desc:          p.descripcion,
          precio:        parseFloat(p.precioFinal ?? p.precio) || 0,
          precioOriginal:p.enOferta ? parseFloat(p.precio) : null,
          icono:         p.icono || cat.icono || '📦',
          imagen:        null,
          cat:           cat.slug || 'otros',
          catLabel:      cat.nombre || 'General',
          oferta:        !!p.enOferta,
          badge:         p.enOferta ? `-${p.descuentoPct ?? ''}%` : null,
          activo:        p.activo !== false,
          creadoEn:      p.fechaCreacion
            ? new Date(p.fechaCreacion).toLocaleDateString('es-MX')
            : '—',
        };
      });
      saveProductos(prods);
    }

    if (pedidos.status === 'fulfilled') {
      const lista = pedidos.value.map(p => ({
        id:       p.idPedido,
        cliente:  p.user ? `${p.user.nombres || ''} ${p.user.apellidos || ''}`.trim() : '—',
        email:    p.user?.email || '—',
        total:    parseFloat(p.total) || 0,
        estado:   (p.estatus || 'PENDIENTE').toLowerCase().replace('_', ' '),
        items:    [],
        fecha:    p.fechaPedido || '',
        direccion:p.direccionEntrega || '',
      }));
      savePedidos(lista);
    }

    if (usuarios.status === 'fulfilled') {
      const stored = usuarios.value.map(u => ({
        ...u,
        nombres:  u.nombres,
        apellidos:u.apellidos,
        email:    u.email,
        rol:      u.rol,
        id:       u.id,
      }));
      localStorage.setItem('almiux_usuarios', JSON.stringify(stored));
    }
  } catch (_) {
    /* Backend no disponible — los datos de localStorage ya están cargados */
  }
}

/* Sobrescribir guardarProducto para también llamar al backend */
const _guardarProductoOriginal = guardarProducto;
window.guardarProducto = async function() {
  await _guardarProductoOriginal();

  const prods = getProductos();
  const prod  = prods[editingProdIndex >= 0 ? editingProdIndex : prods.length - 1];
  const cats  = getCategorias();
  const catObj = cats.find(c => c.slug === prod?.cat);

  if (!prod || !catObj?.id) return;

  const payload = {
    nombre:       prod.nombre,
    descripcion:  prod.desc,
    icono:        prod.icono || '📦',
    precio:       prod.precioOriginal || prod.precio,
    precioFinal:  prod.precio,
    enOferta:     prod.oferta,
    descuentoPct: prod.oferta ? parseInt((prod.badge || '0').replace(/\D/g, '')) : 0,
    activo:       true,
    fechaCreacion:new Date().toISOString().slice(0, 19),
    categoria:    { id: catObj.id },
  };

  try {
    if (prod._backendId) {
      await ProductosAPI.update(prod._backendId, payload);
    } else {
      const creado = await ProductosAPI.create(payload);
      prod._backendId = creado.id;
      saveProductos(getProductos());
    }
  } catch (_) {}
};

/* Sobrescribir guardarCategoria para también llamar al backend */
const _guardarCatOriginal = guardarCategoria;
window.guardarCategoria = async function() {
  _guardarCatOriginal();

  const cats = getCategorias();
  const cat  = cats[editingCatIndex >= 0 ? editingCatIndex : cats.length - 1];
  if (!cat) return;

  const payload = {
    nombre:      cat.nombre,
    slug:        cat.slug,
    icono:       cat.icono,
    descripcion: cat.descripcion || cat.nombre,
  };

  try {
    if (cat.id) {
      await CategoriasAPI.update(cat.id, payload);
    } else {
      const creada = await CategoriasAPI.create(payload);
      cat.id = creada.id;
      saveCategorias(getCategorias());
    }
  } catch (_) {}
};

/* Sobrescribir cambiarEstadoPedido para actualizar en el backend */
const _cambiarEstadoOriginal = cambiarEstadoPedido;
window.cambiarEstadoPedido = async function(index, estado) {
  _cambiarEstadoOriginal(index, estado);

  const pedido = getPedidos()[index];
  if (!pedido?.id) return;

  const ESTATUS_MAP = {
    'pendiente':   'PENDIENTE',
    'en proceso':  'EN_PROCESO',
    'enviado':     'ENVIADO',
    'completado':  'COMPLETADO',
    'cancelado':   'CANCELADO',
  };

  try {
    await PedidosAPI.update(pedido.id, {
      estatus: ESTATUS_MAP[estado] || estado.toUpperCase(),
    });
  } catch (_) {}
};

/* Al mostrar el dashboard sincronizar con el backend */
const _showDashOriginal = showDashboard;
window.showDashboard = async function() {
  _showDashOriginal();
  await sincronizarDesdeAPI();
  refreshAll();
};
