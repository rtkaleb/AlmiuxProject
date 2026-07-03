/* ══════════════════════════════════════════════════════════════════
   ABARROTES ALMIUX — registro.js  (reemplaza el existente)
   Valida al submit y blur · Guarda en localStorage
   Requiere: utils.js · auth.js
══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('authForm');
  if (!form) return;

  /* Alertas globales */
  const alerta = new Alerta('alertaError', 'alertaExito');
  alerta.limpiar();

  /* ── Campos (IDs exactos del HTML) ─────────────────────── */
  const fNombres   = new CampoForm('nombres',          'errorNombres');
  const fApellidos = new CampoForm('apellidos',        'errorApellidos');
  const fEmail     = new CampoForm('email',            'errorEmail');
  const fTelefono  = new CampoForm('telefono',         'errorTelefono');
  const fFecha     = new CampoForm('fechaNacimiento',  'errorFecha');
  const fDireccion = new CampoForm('direccion',        'errorDireccion');
  const fPassword  = new CampoForm('password',         'errorPassword');
  const fConfirmar = new CampoForm('confirmarPassword','errorConfirmar');

  /* ── Botones ojo ───────────────────────────────────────── */
  new TogglePassword('password',          'ojoPwd',     'ojoIcon');
  new TogglePassword('confirmarPassword', 'ojoConfirm', 'ojoIcon');

  /* ── Fortaleza en tiempo real ──────────────────────────── */
  fPassword.input?.addEventListener('input', () => {
    evaluarFortalezaPassword(fPassword.valor);
    if (fConfirmar.valor !== '') vConfirmar();
  });

  /* ── Funciones de validación individuales ───────────────── */
  function vNombres()   { return validarSoloLetras(fNombres,   'El nombre'); }
  function vApellidos() { return validarSoloLetras(fApellidos, 'Los apellidos'); }
  function vEmail()     { return validarEmail(fEmail); }
  function vTelefono()  { return validarTelefono(fTelefono); }
  function vPassword()  { return validarPassword(fPassword); }
  function vConfirmar() { return validarConfirmacion(fConfirmar, fPassword.valor); }

  function vFecha() {
    if (!fFecha.input?.value)
      return fFecha.error('La fecha de nacimiento es obligatoria.');
    const hoy  = new Date();
    const nac  = new Date(fFecha.input.value);
    let edad   = hoy.getFullYear() - nac.getFullYear();
    const mes  = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    if (edad < 18)
      return fFecha.error('Debes tener al menos 18 años para registrarte.');
    return fFecha.ok();
  }

  function vDireccion() { return validarRequerido(fDireccion, 'La dirección'); }

  function vTerminos() {
    const chk = document.getElementById('terminos');
    const err = document.getElementById('errorTerminos');
    if (!chk?.checked) {
      err.textContent    = 'Debes aceptar los términos y condiciones.';
      err.style.display  = 'block';
      return false;
    }
    err.style.display = 'none';
    return true;
  }

  /* ── Validación blur (en tiempo real al salir del campo) ── */
  fNombres.input?.addEventListener('blur',   vNombres);
  fApellidos.input?.addEventListener('blur', vApellidos);
  fEmail.input?.addEventListener('blur',     vEmail);
  fTelefono.input?.addEventListener('blur',  vTelefono);
  fFecha.input?.addEventListener('blur',     vFecha);
  fDireccion.input?.addEventListener('blur', vDireccion);
  fPassword.input?.addEventListener('blur',  vPassword);
  fConfirmar.input?.addEventListener('blur', vConfirmar);

  /* ── Submit ─────────────────────────────────────────────── */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    /* Ejecutar TODAS las validaciones para mostrar todos los errores */
    const resultados = [
      vNombres(),
      vApellidos(),
      vEmail(),
      vTelefono(),
      vFecha(),
      vDireccion(),
      vPassword(),
      vConfirmar(),
      vTerminos()
    ];

    if (resultados.includes(false)) {
      alerta.error('Por favor corrige los errores marcados.');
      /* Scroll al primer campo con error */
      form.querySelector('.input-error')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    /* Construye el payload con la forma que espera el backend (modelo User) */
    const payload = {
      nombres:         fNombres.valor.trim(),
      apellidos:       fApellidos.valor.trim(),
      /* Normaliza el email a minúsculas para evitar duplicados en la BD */
      email:           fEmail.valor.trim().toLowerCase(),
      telefono:        fTelefono.valor.trim(),
      fechaNacimiento: fFecha.input.value,
      genero:          document.getElementById('genero')?.value || '',
      direccion:       fDireccion.valor.trim(),
      password:        fPassword.valor,
      /* Todos los registros públicos son CLIENTE; ADMIN se asigna desde el panel */
      rol:             'CLIENTE',
      /* ISO 8601 sin zona horaria para que Spring lo parsee como LocalDateTime */
      fechaRegistro:   new Date().toISOString().slice(0, 19),
    };

    /* Deshabilita el botón para evitar doble envío */
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Registrando…'; }

    try {
      /* Llama a POST /api/v1.0/users; lanza error si el servidor responde ≥ 400 */
      await UsuariosAPI.create(payload);
    } catch (apiErr) {
      if (btn) { btn.disabled = false; btn.textContent = 'Crear cuenta'; }
      if (apiErr.status === 409) {
        /* 409 Conflict: el correo ya existe en la base de datos */
        alerta.error('Este correo ya está registrado.');
        fEmail.error('Este correo ya está registrado.');
      } else {
        /* Cualquier otro error (red caída, servidor apagado): guardar localmente */
        try {
          AlmiuxStorage.agregarUsuario({ ...payload });
        } catch (localErr) {
          alerta.error(localErr.message);
          fEmail.error(localErr.message);
          return;
        }
      }
      if (apiErr.status === 409) return;
    }

    /* Guarda también en localStorage para que el login offline funcione */
    try { AlmiuxStorage.agregarUsuario({ ...payload }); } catch (_) {}

    alerta.exito('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión…');
    form.reset();
    form.querySelectorAll('.input-ok').forEach(el => el.classList.remove('input-ok'));
    const wrap = document.getElementById('fortalezaWrap');
    if (wrap) wrap.style.display = 'none';
    if (btn) { btn.disabled = false; btn.textContent = 'Crear cuenta'; }

    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
  });

  /* ── Limpiar ─────────────────────────────────────────────── */
  document.getElementById('btnLimpiar')?.addEventListener('click', () => {
    form.reset();
    alerta.limpiar();
    form.querySelectorAll('.input-ok,.input-error')
        .forEach(el => el.classList.remove('input-ok','input-error'));
    form.querySelectorAll('.alerta-global.alerta-error').forEach(el => {
      el.textContent    = '';
      el.style.display  = 'none';
    });
    form.querySelectorAll('.msg-error span').forEach(el => el.textContent = '');
    form.querySelectorAll('.msg-error').forEach(el => el.style.display = 'none');
    const wrap = document.getElementById('fortalezaWrap');
    if (wrap) wrap.style.display = 'none';
  });

});
