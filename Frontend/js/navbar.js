/* ══════════════════════════════════════════════════════════════════
   ABARROTES ALMIUX — navbar.js
   Comportamiento del navbar: scroll hide/show, hamburguesa, link activo.
   Requiere: utils.js
══════════════════════════════════════════════════════════════════ */

function iniciarNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar) return;

  let ultimoScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollActual = window.scrollY;
    navbar.style.transform = (scrollActual > ultimoScroll && scrollActual > 80)
      ? 'translateY(-100%)'
      : 'translateY(0)';
    ultimoScroll = scrollActual;
  });

  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

function marcarLinkActivo() {
  const paginaActual = window.location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(paginaActual) && !link.classList.contains('nav-cta')) {
      link.classList.add('active');
    }
  });
}




function actualizarMenuUsuario() {
  const menu = document.getElementById('userMenu');
  if (!menu) return;

  const sesion = (() => {
    try { return JSON.parse(sessionStorage.getItem('almiux_sesion')); } catch(e) { return null; }
  })();
  const base = obtenerBasePath();

  if (sesion) {
    const esAdmin = sesion.rol === 'ADMIN';
    menu.innerHTML = `
      <button data-go="${esAdmin ? 'admin.html' : 'usuario/index.html'}">
        ${esAdmin ? '<i class="fa-solid fa-lock"></i> Panel Admin' : '<i class="fa-regular fa-user"></i> Mi cuenta'}
      </button>
      <button id="btnCerrarSesion">
        <i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión
      </button>`;
    menu.querySelector('#btnCerrarSesion').addEventListener('click', () => {
      sessionStorage.removeItem('almiux_sesion');
      sessionStorage.removeItem('almiux_admin_sesion');
      window.location.href = base + 'home.html';
    });
  } else {
    menu.innerHTML = `
      <button data-go="usuario/login.html">Iniciar sesión</button>
      <button data-go="usuario/registro.html">Crear cuenta</button>`;
  }

  menu.querySelectorAll('button[data-go]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = base + btn.dataset.go;
    });
  });
}

function actualizarContadorGlobalCarrito(){
 let carrito=[];
 try{carrito=JSON.parse(localStorage.getItem('almiux_carrito'))||[]}catch(e){}
 const total=carrito.reduce((s,i)=>s+(i.qty ?? i.cantidad ?? 0),0);
 const badge=document.getElementById('cartCount');
 if(!badge) return;
 badge.textContent=total;
 badge.style.display=total>0?'flex':'none';
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(actualizarContadorGlobalCarrito,300));
window.addEventListener('storage',actualizarContadorGlobalCarrito);

