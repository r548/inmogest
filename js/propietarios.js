// js/propietarios.js
const Propietarios = {
  lista: [],
  editando: null,

  async cargar() {
    const { data, error } = await db.from('propietarios').select('*').order('nombre');
    if (error) { console.error('Error cargando propietarios:', error); this.lista = []; return; }
    this.lista = data;
  },

  render() {
    const e = this.editando;
    return `
      <div class="page">
        <div class="page-header"><h1>Propietarios</h1></div>

        <form class="card" style="margin-bottom:20px; display:grid; gap:10px; max-width:420px;"
              onsubmit="return Propietarios.guardar(event)">
          <input type="hidden" name="id" value="${e?.id || ''}">
          <input type="text" name="nombre" placeholder="Nombre" value="${e?.nombre || ''}" required>
          <input type="text" name="telefono" placeholder="Teléfono" value="${e?.telefono || ''}">
          <input type="email" name="email" placeholder="Email" value="${e?.email || ''}">
          <div style="display:flex; gap:10px;">
            <button type="submit" class="btn-primary">${e ? 'Guardar cambios' : '➕ Agregar propietario'}</button>
            ${e ? `<button type="button" onclick="Propietarios.cancelar()">Cancelar</button>` : ''}
          </div>
        </form>

        <table class="tabla">
          <thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th></th></tr></thead>
          <tbody>${this.filas()}</tbody>
        </table>
      </div>`;
  },

  filas() {
    if (this.lista.length === 0) return `<tr><td colspan="4">Sin propietarios cargados</td></tr>`;
    return this.lista.map(p => `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.telefono || '-'}</td>
        <td>${p.email || '-'}</td>
        <td>
          <button onclick="Propietarios.editar(${p.id})">✏️</button>
          <button onclick="Propietarios.eliminar(${p.id})">🗑️</button>
        </td>
      </tr>`).join('');
  },

  async guardar(ev) {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const id = fd.get('id');
    const payload = { nombre: fd.get('nombre'), telefono: fd.get('telefono'), email: fd.get('email') };

    const { error } = id
      ? await db.from('propietarios').update(payload).eq('id', id)
      : await db.from('propietarios').insert(payload);

    if (error) { alert('Error al guardar: ' + error.message); return false; }

    this.editando = null;
    await this.cargar();
    abrir('propietarios');
    return false;
  },

  editar(id) {
    this.editando = this.lista.find(p => p.id === id) || null;
    abrir('propietarios');
  },

  cancelar() {
    this.editando = null;
    abrir('propietarios');
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar este propietario?')) return;
    const { error } = await db.from('propietarios').delete().eq('id', id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    await this.cargar();
    abrir('propietarios');
  }
};
