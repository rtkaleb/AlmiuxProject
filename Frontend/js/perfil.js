/* ══════════════════════════════════════════════════════════════════
   ABARROTES ALMIUX — perfil.js
   Carga y actualiza los datos del usuario autenticado.
   Requiere: api.js · auth.js
══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  /* Referencias a los elementos del DOM que se usarán en todo el script */
  const form       = document.getElementById('perfilForm');
  const alertaErr  = document.getElementById('alertaError');
  const alertaOk   = document.getElementById('alertaExito');
  const btnGuardar = document.getElementById('btnGuardar');

  /* Muestra el mensaje de error y oculta el de éxito */
  function mostrarError(msg) {
    alertaErr.textContent    = msg;
    alertaErr.style.display  = 'block';
    alertaOk.style.display   = 'none';
  }

  /* Muestra el mensaje de éxito y oculta el de error */
  function mostrarExito(msg) {
    alertaOk.textContent    = msg;
    alertaOk.style.display  = 'block';
    alertaErr.style.display = 'none';
  }

  /* ── 1. Verificar que haya una sesión activa ──────────────── */
  let sesion = null;
  try {
    /* Lee el objeto de sesión guardado al hacer login */
    sesion = JSON.parse(sessionStorage.getItem('almiux_sesion'));
  } catch (_) {}

  /* Si no hay sesión, redirige al login para forzar autenticación */
  if (!sesion) {
    window.location.href = 'login.html';
    return;
  }

  /* ── 2. Cargar datos del usuario ──────────────────────────── */
  let usuario = null;

  /* Intento primario: buscar por ID (más rápido y preciso) */
  if (sesion.id) {
    try {
      usuario = await UsuariosAPI.getById(sesion.id);
    } catch (_) {}
  }

  /* Intento secundario: buscar por email si el ID no funcionó */
  if (!usuario) {
    try {
      usuario = await UsuariosAPI.getByEmail(sesion.email);
    } catch (_) {}
  }

  /* Fallback final: leer del localStorage si el backend no responde */
  if (!usuario) {
    const stored = JSON.parse(localStorage.getItem('almiux_usuarios') || '[]');
    usuario = stored.find(u => u.email === sesion.email) || null;
  }

  /* Si tras los tres intentos no hay datos, mostrar error y detener */
  if (!usuario) {
    mostrarError('No se pudieron cargar tus datos. Intenta de nuevo.');
    return;
  }

  /* ── 3. Rellenar el formulario con los datos obtenidos ────── */
  document.getElementById('nombres').value         = usuario.nombres         || '';
  document.getElementById('apellidos').value       = usuario.apellidos       || '';
  document.getElementById('email').value           = usuario.email           || '';
  document.getElementById('telefono').value        = usuario.telefono        || '';
  /* fechaNacimiento viene como string ISO (YYYY-MM-DD) desde el backend */
  document.getElementById('fechaNacimiento').value = usuario.fechaNacimiento || '';
  document.getElementById('genero').value          = usuario.genero          || '';
  document.getElementById('direccion').value       = usuario.direccion       || '';

  /* ── 4. Cerrar sesión ─────────────────────────────────────── */
  document.getElementById('linkCerrarSesion')?.addEventListener('click', (e) => {
    e.preventDefault();
    /* Elimina la sesión de sessionStorage y redirige al login */
    sessionStorage.removeItem('almiux_sesion');
    window.location.href = 'login.html';
  });

  /* ── 5. Guardar cambios ───────────────────────────────────── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Construye el payload con los valores actuales del formulario */
    const payload = {
      nombres:         document.getElementById('nombres').value.trim(),
      apellidos:       document.getElementById('apellidos').value.trim(),
      /* Normaliza el email a minúsculas para evitar duplicados */
      email:           document.getElementById('email').value.trim().toLowerCase(),
      telefono:        document.getElementById('telefono').value.trim(),
      /* null si el campo está vacío para no enviar cadena vacía al backend */
      fechaNacimiento: document.getElementById('fechaNacimiento').value || null,
      genero:          document.getElementById('genero').value          || null,
      direccion:       document.getElementById('direccion').value.trim(),
      /* Conserva el rol original; el usuario no puede cambiar su propio rol */
      rol:             usuario.rol      || 'CLIENTE',
      /* Conserva la contraseña actual; este formulario no la modifica */
      password:        usuario.password || '',
    };

    /* Validación mínima antes de llamar al backend */
    if (!payload.nombres || !payload.apellidos || !payload.email) {
      mostrarError('Nombre, apellidos y correo son obligatorios.');
      return;
    }

    /* Deshabilita el botón mientras se procesa para evitar doble envío */
    btnGuardar.disabled    = true;
    btnGuardar.textContent = 'Guardando…';

    let guardado = false;

    /* Intento primario: actualizar en el backend via PUT /users/{id} */
    if (usuario.id) {
      try {
        await UsuariosAPI.update(usuario.id, payload);
        guardado = true;
      } catch (_) {}
    }

    /* Fallback: si el backend falla, actualizar solo en localStorage */
    if (!guardado) {
      try {
        const stored = JSON.parse(localStorage.getItem('almiux_usuarios') || '[]');
        /* Busca el índice del usuario por su email original de sesión */
        const idx = stored.findIndex(u => u.email === sesion.email);
        /* Reemplaza el objeto combinando datos anteriores con los nuevos */
        if (idx !== -1) { stored[idx] = { ...stored[idx], ...payload }; }
        localStorage.setItem('almiux_usuarios', JSON.stringify(stored));
        guardado = true;
      } catch (_) {}
    }

    /* Reactiva el botón sin importar el resultado */
    btnGuardar.disabled  = false;
    btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar cambios';

    if (guardado) {
      /* Actualiza sessionStorage con el nuevo nombre y email por si cambiaron */
      sessionStorage.setItem('almiux_sesion', JSON.stringify({
        ...sesion,
        nombres: payload.nombres,
        email:   payload.email,
      }));
      mostrarExito('¡Perfil actualizado correctamente!');
    } else {
      mostrarError('No se pudo guardar. Verifica tu conexión e intenta de nuevo.');
    }
  });
});
