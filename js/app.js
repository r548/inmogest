// js/app.js
// Router principal: carga todos los módulos (así los <select> de cada
// pantalla siempre tienen datos actualizados de las demás tablas) y
// renderiza el módulo elegido dentro de #contenido.

const Modulos = {
  dashboard: Dashboard,
  propietarios: Propietarios,
  propiedades: Propiedades,
  inquilinos: Inquilinos,
  contratos: Contratos,
  impuestos: Impuestos,
  servicios: Servicios,
  cobranzas: Cobranzas,
  liquidaciones: Liquidaciones,
  reportes: Reportes,
  agenda: Agenda,
  crm: Crm,
};

async function cargarTodo() {
  await Promise.all([
    Propietarios.cargar(),
    Propiedades.cargar(),
    Inquilinos.cargar(),
    Contratos.cargar(),
    Impuestos.cargar(),
    Servicios.cargar(),
    Cobranzas.cargar(),
    Liquidaciones.cargar(),
    Agenda.cargar(),
    Crm.cargar(),
  ]);
}

async function abrir(view) {
  const modulo = Modulos[view];
  if (!modulo) return;

  document.querySelectorAll('.sidebar nav button[data-view]').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === view);
  });

  const contenido = document.getElementById('contenido');
  contenido.innerHTML = '<p style="padding:20px;">Cargando…</p>';

  try {
    await cargarTodo();
    contenido.innerHTML = modulo.render();
  } catch (e) {
    console.error('Error al cargar la vista', view, e);
    contenido.innerHTML = `<p style="padding:20px; color:#e03131;">Error al cargar esta sección. Revisá la consola.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sidebar nav button[data-view]').forEach((b) => {
    b.addEventListener('click', () => abrir(b.dataset.view));
  });
  abrir('dashboard');
});
