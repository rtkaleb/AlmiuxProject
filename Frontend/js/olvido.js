/* ══════════════════════════════════════════════════════════════════
   ABARROTES ALMIUX — olvido.js  (archivo nuevo)
   Recuperación de contraseña en 3 pasos con stepper.
   Requiere: utils.js · auth.js
══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Referencias al stepper ─────────────────────────────── */
  const pasos   = [
    document.getElementById('paso1'),
    document.getElementById('paso2'),
    document.getElementById('paso3'),
  ];
  const stepEls = [
    document.getElementById('stepEl1'),
    document.getElementById('stepEl2'),
    document.getElementById('stepEl3'),
  ];
  const stepNums = [
    document.getElementById('stepNum1'),
    document.getElementById('stepNum2'),
    document.getElementById('stepNum3'),
  ];
  const stepLines = [
    document.getElementById('stepLine1'),
    document.getElementById('stepLine2'),
  ];

  /* Alerta global */
  const alerta = new Alerta('alertaError', 'alertaExito');
  alerta.limpiar();

  /* Usuario que superó la verificación del paso 1 */
  let usuarioVerificado = null;

  /* ── Función central: mostrar paso activo ───────────────── */
  function activarPaso(num) {
    pasos.forEach((p, i) => {
      if (!p) return;
      const activo = (i + 1 === num);
      p.classList.toggle('activo', activo);
      p.style.display = activo ? 'block' : 'none';
    });

    stepEls.forEach((el, i) => {
      if (!el) return;
      el.classList.toggle('active',    i + 1 === num);
      el.classList.toggle('completado', i + 1 < num);
    });

    stepLines.forEach((ln, i) => {
      if (ln) ln.classList.toggle('completado', num > i + 1);
    });

    /* Checkmark en pasos completados */
    if (stepNums[1]) stepNums[1].innerHTML = num > 2
      ? '<i class="fa-solid fa-check"></i>' : '2';
    if (stepNums[2]) stepNums[2].innerHTML = num > 2
      ? '<i class="fa-solid fa-check"></i>' : '3';
  }

  activarPaso(1);

  /* ══════════════════════════════════════════════════════════
     PASO 1 — Verificar identidad
  ══════════════════════════════════════════════════════════ */
  const formPaso1 = document.getElementById('authForm');

  /* Campos del paso 1 (IDs exactos del HTML) */
  const fNombres   = new CampoForm('vNombres',  'errNombres');
  const fApellidos = new CampoForm('vApellidos','errApellidos');
  const fEmail     = new CampoForm('vEmail',    'errEmail');
  const fTelefono  = new CampoForm('vTelefono', 'errTelefono');

  /* Validaciones individuales paso 1 */
  function vNombres()   { return validarSoloLetras(fNombres,   'El nombre'); }
  function vApellidos() { return validarSoloLetras(fApellidos, 'Los apellidos'); }
  function vEmail()     { return validarEmail(fEmail); }
  function vTelefono()  { return validarTelefono(fTelefono); }

  /* Blur paso 1 */
  fNombres.input?.addEventListener('blur',   vNombres);
  fApellidos.input?.addEventListener('blur', vApellidos);
  fEmail.input?.addEventListener('blur',     vEmail);
  fTelefono.input?.addEventListener('blur',  vTelefono);

  /* Submit paso 1 */
  formPaso1?.addEventListener('submit', e => {
    e.preventDefault();
    alerta.limpiar();

    /* Ejecutar todas las validaciones para mostrar todos los errores */
    const resultados = [vNombres(), vApellidos(), vEmail(), vTelefono()];
    if (resultados.includes(false)) {
      alerta.error('Corrige los errores antes de continuar.');
      return;
    }

    /* Buscar usuario en localStorage */
    const usuario = AlmiuxStorage.verificarIdentidad(
      fEmail.valor.trim().toLowerCase(),
      fTelefono.valor.trim(),
      fNombres.valor.trim(),
      fApellidos.valor.trim()
    );

    if (!usuario) {
      alerta.error('Los datos no coinciden con ningún usuario registrado. Verifica tu información.');
      return;
    }

    /* Usuario encontrado → avanzar al paso 2 */
    usuarioVerificado = usuario;
    const msgUsuario  = document.getElementById('alertaUsuarioMsg');
    if (msgUsuario)
      msgUsuario.textContent = `Usuario verificado: ${usuario.nombres} ${usuario.apellidos}`;

    alerta.limpiar();
    activarPaso(2);
  });

  /* ══════════════════════════════════════════════════════════
     PASO 2 — Nueva contraseña
  ══════════════════════════════════════════════════════════ */
  const formPaso2 = document.getElementById('formNuevaClave');

  /* Campos del paso 2 (IDs exactos del HTML) */
  const fNuevaPwd  = new CampoForm('nuevaPassword',    'errNuevaPwd');
  const fConfirmar = new CampoForm('confirmarPassword','errConfirmar');

  /* Botones ojo paso 2 */
  new TogglePassword('nuevaPassword',    'ojoNueva',    'ojoNuevaIcon');
  new TogglePassword('confirmarPassword','ojoConfirmar','ojoConfirmarIcon');

  /* Fortaleza en tiempo real */
  fNuevaPwd.input?.addEventListener('input', () => {
    evaluarFortalezaPassword(fNuevaPwd.valor);
    if (fConfirmar.valor !== '') vConfirmar();
  });

  /* Validaciones individuales paso 2 */
  function vNuevaPwd()  { return validarPassword(fNuevaPwd); }
  function vConfirmar() { return validarConfirmacion(fConfirmar, fNuevaPwd.valor); }

  /* Blur paso 2 */
  fNuevaPwd.input?.addEventListener('blur',  vNuevaPwd);
  fConfirmar.input?.addEventListener('blur', vConfirmar);

  /* Submit paso 2 */
  formPaso2?.addEventListener('submit', e => {
    e.preventDefault();

    const resultados = [vNuevaPwd(), vConfirmar()];
    if (resultados.includes(false)) return;

    if (!usuarioVerificado) {
      alerta.error('Sesión expirada. Vuelve al paso 1.');
      activarPaso(1);
      return;
    }

    const actualizado = AlmiuxStorage.actualizarPassword(
      usuarioVerificado.email,
      fNuevaPwd.valor
    );

    if (!actualizado) {
      alerta.error('No se pudo actualizar la contraseña. Inténtalo de nuevo.');
      return;
    }

    activarPaso(3);
  });

  /* Botón volver en paso 2 */
  document.getElementById('btnVolver1')?.addEventListener('click', () => {
    alerta.limpiar();
    activarPaso(1);
  });

});
