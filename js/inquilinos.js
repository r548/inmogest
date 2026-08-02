// js/inquilinos.js
const Inquilinos = {
  lista: [],
  editando: null,

  async cargar() {
    const { data, error } = await db.from('inquilinos').select('*').order('nombre');
    if (error) { console.error('Error cargando inquilinos:', error); this.lista = []; return; }
    this.lista = data;
  },

  render() {
    const e = this.editando;
    return `
      <div class="page">
        <div class="page-header"><h1>Inquilinos</h1></div>

        <form class="card" style="margin-bottom:20px; display:grid; gap:10px; max-width:420px;"
              onsubmit="return Inquilinos.guardar(event)">
          <input type="hidden" name="id" value="${e?.id || ''}">
          <input type="text" name="nombre" placeholder="Nombre" value="${e?.nombre || ''}" required>
          <input type="text" name="telefono" placeholder="Teléfono" value="${e?.telefono || ''}">
          <input type="email" name="email" placeholder="Email" value="${e?.email || ''}">
          <div style="display:flex; gap:10px;">
            <button type="submit" class="btn-primary">${e ? 'Guardar cambios' : '➕ Agregar inquilino'}</button>
            ${e ? `<button type="button" onclick="Inquilinos.cancelar()">Cancelar</button>` : ''}
          </div>
        </form>

        <table class="tabla">
          <thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th></th></tr></thead>
          <tbody>${this.filas()}</tbody>
        </table>
      </div>`;
  },

  filas() {
    if (this.lista.length === 0) return `<tr><td colspan="4">Sin inquilinos cargados</td></tr>`;
    return this.lista.map(i => `
      <tr>
        <td>${i.nombre}</td>
        <td>${i.telefono || '-'}</td>
        <td>${i.email || '-'}</td>
        <td>
          <button onclick="Inquilinos.editar(${i.id})">✏️</button>
          <button onclick="Inquilinos.eliminar(${i.id})">🗑️</button>
        </td>
      </tr>`).join('');
  },

  async guardar(ev) {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const id = fd.get('id');
    const payload = { nombre: fd.get('nombre'), telefono: fd.get('telefono'), email: fd.get('email') };

    const { error } = id
      ? await db.from('inquilinos').update(payload).eq('id', id)
      : await db.from('inquilinos').insert(payload);

    if (error) { alert('Error al guardar: ' + error.message); return false; }

    this.editando = null;
    await this.cargar();
    abrir('inquilinos');
    return false;
  },

  editar(id) {
    this.editando = this.lista.find(i => i.id === id) || null;
    abrir('inquilinos');
  },

  cancelar() {
    this.editando = null;
    abrir('inquilinos');
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar este inquilino?')) return;
    const { error } = await db.from('inquilinos').delete().eq('id', id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    await this.cargar();
    abrir('inquilinos');
  }
};
