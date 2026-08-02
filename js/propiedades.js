// js/propiedades.js
const Propiedades = {
  lista: [],
  editando: null,

  async cargar() {
    const { data, error } = await db.from('propiedades').select('*').order('direccion');
    if (error) { console.error('Error cargando propiedades:', error); this.lista = []; return; }
    this.lista = data;
  },

  nombrePropietario(id) {
    const p = Propietarios.lista.find(x => x.id === id);
    return p ? p.nombre : '—';
  },

  render() {
    const e = this.editando;
    return `
      <div class="page">
        <div class="page-header"><h1>Propiedades</h1></div>

        <form class="card" style="margin-bottom:20px; display:grid; gap:10px; max-width:420px;"
              onsubmit="return Propiedades.guardar(event)">
          <input type="hidden" name="id" value="${e?.id || ''}">
          <input type="text" name="direccion" placeholder="Dirección" value="${e?.direccion || ''}" required>
          <input type="number" name="alquiler" step="0.01" min="0" placeholder="Alquiler" value="${e?.alquiler || ''}" required>
          <select name="propietario_id" required>
            <option value="">Propietario…</option>
            ${Propietarios.lista.map(p => `<option value="${p.id}" ${String(p.id) === String(e?.propietario_id) ? 'selected' : ''}>${p.nombre}</option>`).join('')}
          </select>
          <div style="display:flex; gap:10px;">
            <button type="submit" class="btn-primary">${e ? 'Guardar cambios' : '➕ Nueva Propiedad'}</button>
            ${e ? `<button type="button" onclick="Propiedades.cancelar()">Cancelar</button>` : ''}
          </div>
        </form>

        <table class="tabla">
          <thead><tr><th>Dirección</th><th>Alquiler</th><th>Propietario</th><th></th></tr></thead>
          <tbody>${this.filas()}</tbody>
        </table>
      </div>`;
  },

  filas() {
    if (this.lista.length === 0) return `<tr><td colspan="4">Sin propiedades cargadas</td></tr>`;
    return this.lista.map(p => `
      <tr>
        <td>${p.direccion}</td>
        <td>$${Number(p.alquiler || 0).toLocaleString('es-AR')}</td>
        <td>${this.nombrePropietario(p.propietario_id)}</td>
        <td>
          <button onclick="Propiedades.editar(${p.id})">✏️</button>
          <button onclick="Propiedades.eliminar(${p.id})">🗑️</button>
        </td>
      </tr>`).join('');
  },

  async guardar(ev) {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const id = fd.get('id');
    const payload = {
      direccion: fd.get('direccion'),
      alquiler: parseFloat(fd.get('alquiler')) || 0,
      propietario_id: fd.get('propietario_id') || null,
    };

    const { error } = id
      ? await db.from('propiedades').update(payload).eq('id', id)
      : await db.from('propiedades').insert(payload);

    if (error) { alert('Error al guardar: ' + error.message); return false; }

    this.editando = null;
    await this.cargar();
    abrir('propiedades');
    return false;
  },

  editar(id) {
    this.editando = this.lista.find(p => p.id === id) || null;
    abrir('propiedades');
  },

  cancelar() {
    this.editando = null;
    abrir('propiedades');
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar esta propiedad? También se borrarán sus contratos, impuestos y servicios asociados.')) return;
    const { error } = await db.from('propiedades').delete().eq('id', id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    await this.cargar();
    abrir('propiedades');
  }
};
