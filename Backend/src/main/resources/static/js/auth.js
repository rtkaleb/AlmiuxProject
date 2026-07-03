/* ══════════════════════════════════════════════════════════════════
   ABARROTES ALMIUX — auth.js
   Clases y funciones GLOBALES reutilizables para autenticación.
   Debe cargarse ANTES de registro.js / login.js / olvido.js
══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────
   CLASE AlmiuxStorage
   Toda la lectura/escritura de usuarios en localStorage.
   Contraseñas guardadas en base64 (ofuscación básica).
───────────────────────────────────────────────────────────────── */
class AlmiuxStorage {
  static CLAVE = 'almiux_usuarios';

  static obtenerUsuarios() {
    try { return JSON.parse(localStorage.getItem(this.CLAVE)) || []; }
    catch { return []; }
  }

  static guardarUsuarios(usuarios) {
    localStorage.setItem(this.CLAVE, JSON.stringify(usuarios));
  }

  /* Agrega usuario; lanza Error si el correo ya existe */
  static agregarUsuario(datos) {
    const lista = this.obtenerUsuarios();
    if (lista.some(u => u.email.toLowerCase() === datos.email.toLowerCase()))
      throw new Error('Este correo ya está registrado.');
    const usuario = { ...datos, password: btoa(datos.password) };
    lista.push(usuario);
    this.guardarUsuarios(lista);
    return usuario;
  }

  /* Devuelve usuario si email + password coinciden, o null */
  static autenticar(email, password) {
    return this.obtenerUsuarios().find(
      u => u.email.toLowerCase() === email.toLowerCase() &&
           atob(u.password) === password
    ) || null;
  }

  /* Devuelve usuario si los 4 campos coinciden, o null */
  static verificarIdentidad(email, telefono, nombres, apellidos) {
    return this.obtenerUsuarios().find(
      u => u.email.toLowerCase()    === email.toLowerCase()    &&
           u.telefono               === telefono               &&
           u.nombres.toLowerCase().trim()   === nombres.toLowerCase().trim()   &&
           u.apellidos.toLowerCase().trim() === apellidos.toLowerCase().trim()
    ) || null;
  }

  /* Actualiza la contraseña de un usuario por email */
  static actualizarPassword(email, nuevaPassword) {
    const lista = this.obtenerUsuarios();
    const idx   = lista.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return false;
    lista[idx].password = btoa(nuevaPassword);
    this.guardarUsuarios(lista);
    return true;
  }

  static iniciarSesion(usuario) {
    sessionStorage.setItem('almiux_sesion',
      JSON.stringify({ email: usuario.email, nombres: usuario.nombres }));
  }

  static sesionActiva() {
    try { return JSON.parse(sessionStorage.getItem('almiux_sesion')) || null; }
    catch { return null; }
  }
}

/* ─────────────────────────────────────────────────────────────────
   CLASE CampoForm
   Abstrae un campo HTML: muestra u oculta su mensaje de error.
   Compatible con dos estructuras de HTML:
     - <div id="errorX">texto</div>           (registro)
     - <div id="errorX"><i/><span></span></div> (login / olvido)
───────────────────────────────────────────────────────────────── */
class CampoForm {
  constructor(inputId, errorId) {
    this.input   = document.getElementById(inputId);
    this.errorEl = document.getElementById(errorId);
  }

  get valor() { return this.input ? this.input.value : ''; }

  error(msg) {
    if (!this.input || !this.errorEl) return false;
    this.input.classList.add('input-error');
    this.input.classList.remove('input-ok');
    const span = this.errorEl.querySelector('span');
    if (span) span.textContent = msg;
    else      this.errorEl.textContent = msg;
    this.errorEl.style.display = 'flex';
    return false;
  }

  ok() {
    if (!this.input || !this.errorEl) return true;
    this.input.classList.remove('input-error');
    this.input.classList.add('input-ok');
    const span = this.errorEl.querySelector('span');
    if (span) span.textContent = '';
    else      this.errorEl.textContent = '';
    this.errorEl.style.display = 'none';
    return true;
  }
}

/* ─────────────────────────────────────────────────────────────────
   CLASE Alerta
   Controla las alertas globales de éxito / error del formulario.
───────────────────────────────────────────────────────────────── */
class Alerta {
  constructor(errorId, exitoId) {
    this.errorEl = document.getElementById(errorId);
    this.exitoEl = document.getElementById(exitoId);
  }

  limpiar() {
    if (this.errorEl) this.errorEl.style.display = 'none';
    if (this.exitoEl) this.exitoEl.style.display = 'none';
  }

  error(msg) {
    if (!this.errorEl) return;
    const span = this.errorEl.querySelector('#alertaErrorMsg') ||
                 this.errorEl.querySelector('span');
    if (span && msg) span.textContent = msg;
    this.errorEl.style.display = 'flex';
    if (this.exitoEl) this.exitoEl.style.display = 'none';
  }

  exito(msg) {
    if (!this.exitoEl) return;
    const span = this.exitoEl.querySelector('#alertaExitoMsg') ||
                 this.exitoEl.querySelector('span');
    if (span && msg) span.textContent = msg;
    this.exitoEl.style.display = 'flex';
    if (this.errorEl) this.errorEl.style.display = 'none';
  }
}

/* ─────────────────────────────────────────────────────────────────
   CLASE TogglePassword — botón ojo mostrar/ocultar contraseña
───────────────────────────────────────────────────────────────── */
class TogglePassword {
  constructor(inputId, btnId, iconId) {
    this.input = document.getElementById(inputId);
    this.icon  = document.getElementById(iconId);
    const btn  = document.getElementById(btnId);
    if (btn) btn.addEventListener('click', () => this.toggle());
  }

  toggle() {
    if (!this.input) return;
    const visible  = this.input.type === 'password';
    this.input.type = visible ? 'text' : 'password';
    if (this.icon)
      this.icon.className = visible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  }
}

/* ─────────────────────────────────────────────────────────────────
   FUNCIÓN GLOBAL — indicador de fortaleza de contraseña
───────────────────────────────────────────────────────────────── */
function evaluarFortalezaPassword(pwd) {
  const wrap  = document.getElementById('fortalezaWrap');
  const fill  = document.getElementById('fortalezaFill');
  const label = document.getElementById('fortalezaLabel');
  if (!wrap) return;
  if (!pwd) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';

  let pts = 0;
  if (pwd.length >= 8)            pts++;
  if (pwd.length >= 12)           pts++;
  if (/[A-Z]/.test(pwd))          pts++;
  if (/[0-9]/.test(pwd))          pts++;
  if (/[^A-Za-z0-9]/.test(pwd))   pts++;

  if (pts <= 1) {
    fill.style.cssText = 'width:25%;background:#dc3545';
    label.textContent  = 'Contraseña débil';
    label.style.color  = '#dc3545';
  } else if (pts <= 3) {
    fill.style.cssText = 'width:60%;background:#ffc107';
    label.textContent  = 'Contraseña regular';
    label.style.color  = '#856404';
  } else {
    fill.style.cssText = 'width:100%;background:#28a745';
    label.textContent  = 'Contraseña fuerte ✓';
    label.style.color  = '#28a745';
  }
}

/* ─────────────────────────────────────────────────────────────────
   FUNCIONES DE VALIDACIÓN GLOBALES — reciben CampoForm, retornan bool
───────────────────────────────────────────────────────────────── */

/* Campo obligatorio no vacío */
function validarRequerido(campo, etiqueta) {
  if (campo.valor.trim() === '')
    return campo.error(`${etiqueta} es obligatorio.`);
  return campo.ok();
}

/* Solo letras y espacios, 2-60 chars */
function validarSoloLetras(campo, etiqueta) {
  const v = campo.valor.trim();
  if (v === '')
    return campo.error(`${etiqueta} es obligatorio.`);
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,60}$/.test(v))
    return campo.error(`${etiqueta} solo puede contener letras (mínimo 2 caracteres).`);
  return campo.ok();
}

/* Formato email válido */
function validarEmail(campo) {
  const v = campo.valor.trim();
  if (v === '')
    return campo.error('El correo electrónico es obligatorio.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    return campo.error('Ingresa un correo válido (ejemplo@correo.com).');
  return campo.ok();
}

/* Teléfono: exactamente 10 dígitos */
function validarTelefono(campo) {
  const v = campo.valor.trim();
  if (v === '')
    return campo.error('El teléfono es obligatorio.');
  if (!/^\d{10}$/.test(v))
    return campo.error('El teléfono debe tener exactamente 10 dígitos numéricos.');
  return campo.ok();
}

/* Contraseña: mínimo 8 chars, al menos 1 mayúscula y 1 número */
function validarPassword(campo) {
  const v = campo.valor;
  if (v === '')
    return campo.error('La contraseña es obligatoria.');
  if (v.length < 8)
    return campo.error('La contraseña debe tener al menos 8 caracteres.');
  if (!/[A-Z]/.test(v))
    return campo.error('La contraseña debe contener al menos una letra mayúscula.');
  if (!/[0-9]/.test(v))
    return campo.error('La contraseña debe contener al menos un número.');
  return campo.ok();
}

/* Confirmación de contraseña */
function validarConfirmacion(campoConfirmar, valorOriginal) {
  if (campoConfirmar.valor === '')
    return campoConfirmar.error('Debes confirmar tu contraseña.');
  if (campoConfirmar.valor !== valorOriginal)
    return campoConfirmar.error('Las contraseñas no coinciden.');
  return campoConfirmar.ok();
}
