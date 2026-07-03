/* ══════════════════════════════════════════════════════════════════
   ABARROTES ALMIUX — login.js  (archivo nuevo)
   Inicio de sesión con validación y autenticación via localStorage.
   Requiere: utils.js · auth.js
══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('authForm');
  if (!form) return;

  /* Alertas globales */
  const alerta = new Alerta('alertaError', 'alertaExito');
  alerta.limpiar();

  /* ── Campos (IDs exactos del HTML) ─────────────────────── */
  const fEmail    = new CampoForm('loginEmail',    'errorEmail');
  const fPassword = new CampoForm('loginPassword', 'errorPassword');

  /* ── Botón ojo ──────────────────────────────────────────── */
  new TogglePassword('loginPassword', 'ojoPwd', 'ojoIcon');

  /* ── Validaciones individuales ──────────────────────────── */
  function vEmail() { return validarEmail(fEmail); }

  function vPassword() {
    const v = fPassword.valor;
    if (v === '')
      return fPassword.error('La contraseña es obligatoria.');
    if (v.length < 8)
      return fPassword.error('La contraseña debe tener al menos 8 caracteres.');
    if (!/[A-Z]/.test(v))
      return fPassword.error('La contraseña debe contener al menos una mayúscula.');
    if (!/[0-9]/.test(v))
      return fPassword.error('La contraseña debe contener al menos un número.');
    return fPassword.ok();
  }

  /* ── Validación blur ────────────────────────────────────── */
  fEmail.input?.addEventListener('blur',    vEmail);
  fPassword.input?.addEventListener('blur', vPassword);

  /* ── Helpers del spinner / botón ────────────────────────── */
  function setSpinner(activo) {
    const spinner = document.getElementById('loginSpinner');
    const icon    = document.getElementById('loginBtnIcon');
    const texto   = document.getElementById('loginBtnText');
    const btn     = document.getElementById('btnLogin');
    if (!btn) return;
    spinner && (spinner.style.display = activo ? 'inline-block' : 'none');
    icon    && (icon.style.display    = activo ? 'none'         : 'inline');
    texto   && (texto.textContent     = activo ? 'Verificando…' : 'Iniciar sesión');
    btn.disabled = activo;
  }

  /* ── Submit ─────────────────────────────────────────────── */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    alerta.limpiar();

    /* 1. Validar campos vacíos y formato */
    const formatoOk = [vEmail(), vPassword()];
    if (formatoOk.includes(false)) {
      alerta.error('Revisa los campos antes de continuar.');
      return;
    }

    setSpinner(true);

    const email    = fEmail.valor.trim().toLowerCase();
    const password = fPassword.valor;

    let usuario = null;

    /* 2a. Intentar autenticación contra el backend (BCrypt) */
    try {
      const BASE = 'http://localhost:8080/api/v1.0';
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        usuario = await res.json();
      } else if (res.status === 401) {
        /* Credenciales incorrectas según el backend — no probar localStorage */
        setSpinner(false);
        alerta.error('Nombre de usuario o contraseña inválidos.');
        fEmail.error('Verifica tu correo electrónico.');
        fPassword.error('Verifica tu contraseña.');
        return;
      }
      /* Cualquier otro error de red/servidor → caer en localStorage */
    } catch (_) {
      /* Backend no disponible → caer en localStorage */
    }

    /* 2b. Fallback localStorage: autentica con los datos guardados al registrarse */
    if (!usuario) {
      usuario = AlmiuxStorage.autenticar(email, password);
    }

    setSpinner(false);

    /* Si tras ambos intentos no hay usuario, las credenciales son inválidas */
    if (!usuario) {
      alerta.error('Nombre de usuario o contraseña inválidos.');
      fEmail.error('Verifica tu correo electrónico.');
      fPassword.error('Verifica tu contraseña.');
      return;
    }

    /* 3. Sesión correcta — persiste el id del backend para llamadas futuras a la API */
    const sesionData = {
      id:      usuario.id      ?? null,      /* null si vino de localStorage sin ID */
      email:   usuario.email   ?? email,
      nombres: usuario.nombres ?? usuario.nombres,
      rol:     usuario.rol     ?? 'CLIENTE', /* ADMIN redirige al panel de admin */
    };
    /* Sesión extendida con el ID para que perfil.js y carrito puedan usarla */
    sessionStorage.setItem('almiux_sesion', JSON.stringify(sesionData));
    /* También guarda en el formato original de AlmiuxStorage por compatibilidad */
    AlmiuxStorage.iniciarSesion(usuario);

    /* Recordarme: guarda el email para precargarlo en el próximo login */
    const recordar = document.getElementById('recordarme');
    if (recordar?.checked) {
      localStorage.setItem('almiux_recordar_email', email);
    } else {
      localStorage.removeItem('almiux_recordar_email');
    }

    alerta.exito(`¡Bienvenido/a, ${sesionData.nombres}! Redirigiendo…`);

    /* 4. Redirige al panel de admin si el rol es ADMIN; si no, al home */
    setTimeout(() => {
      if (sesionData.rol === 'ADMIN') {
        window.location.href = obtenerBasePath() + 'admin/index.html';
      } else {
        window.location.href = obtenerBasePath() + 'home.html';
      }
    }, 1500);
  });

  /* ── Precargar email si "Recordarme" estaba activo ──────── */
  const emailGuardado = localStorage.getItem('almiux_recordar_email');
  if (emailGuardado && fEmail.input) {
    fEmail.input.value = emailGuardado;
    const chk = document.getElementById('recordarme');
    if (chk) chk.checked = true;
  }

});