// js/contratos.js
const Contratos = {
  lista: [],
  editando: null,

  async cargar() {
    const { data, error } = await db.from('contratos').select('*').order('fecha_inicio', { ascending: false });
    if (error) { console.error('Error cargando contratos:', error); this.lista = []; return; }
    this.lista = data;
  },

  direccion(id) {
    const p = Propiedades.lista.find(x => x.id === id);
    return p ? p.direccion : '—';
  },

  nombreInquilino(id) {
    const i = Inquilinos.lista.find(x => x.id === id);
    return i ? i.nombre : '—';
  },

  render() {
    const e = this.editando;
    return `
      <div class="page">
        <div class="page-header"><h1>Contratos</h1></div>

        <form class="card" style="margin-bottom:20px; display:grid; gap:10px; max-width:420px;"
              onsubmit="return Contratos.guardar(event)">
          <input type="hidden" name="id" value="${e?.id || ''}">
          <select name="propiedad_id" required>
            <option value="">Propiedad…</option>
            ${Propiedades.lista.map(p => `<option value="${p.id}" ${String(p.id) === String(e?.propiedad_id) ? 'selected' : ''}>${p.direccion}</option>`).join('')}
          </select>
          <select name="inquilino_id" required>
            <option value="">Inquilino…</option>
            ${Inquilinos.lista.map(i => `<option value="${i.id}" ${String(i.id) === String(e?.inquilino_id) ? 'selected' : ''}>${i.nombre}</option>`).join('')}
          </select>
          <input type="number" name="alquiler" step="0.01" min="0" placeholder="Alquiler" value="${e?.alquiler || ''}" required>
          <input type="date" name="fecha_inicio" value="${e?.fecha_inicio || ''}" required>
          <input type="date" name="fecha_fin" value="${e?.fecha_fin || ''}">
          <select name="estado">
            <option value="Vigente" ${e?.estado === 'Vigente' ? 'selected' : ''}>Vigente</option>
            <option value="Finalizado" ${e?.estado === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
          </select>
          <div style="display:flex; gap:10px;">
            <button type="submit" class="btn-primary">${e ? 'Guardar cambios' : '➕ Nuevo Contrato'}</button>
            ${e ? `<button type="button" onclick="Contratos.cancelar()">Cancelar</button>` : ''}
          </div>
        </form>

        <table class="tabla">
          <thead><tr><th>Propiedad</th><th>Inquilino</th><th>Alquiler</th><th>Inicio</th><th>Fin</th><th>Estado</th><th></th></tr></thead>
          <tbody>${this.filas()}</tbody>
        </table>
      </div>`;
  },

  filas() {
    if (this.lista.length === 0) return `<tr><td colspan="7">Sin contratos cargados</td></tr>`;
    return this.lista.map(c => `
      <tr>
        <td>${this.direccion(c.propiedad_id)}</td>
        <td>${this.nombreInquilino(c.inquilino_id)}</td>
        <td>$${Number(c.alquiler || 0).toLocaleString('es-AR')}</td>
        <td>${c.fecha_inicio || '-'}</td>
        <td>${c.fecha_fin || '-'}</td>
        <td>${c.estado || '-'}</td>
        <td>
          <button onclick="Contratos.editar(${c.id})">✏️</button>
          <button onclick="Contratos.eliminar(${c.id})">🗑️</button>
        </td>
      </tr>`).join('');
  },

  async guardar(ev) {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const id = fd.get('id');
    const payload = {
      propiedad_id: fd.get('propiedad_id'),
      inquilino_id: fd.get('inquilino_id'),
      alquiler: parseFloat(fd.get('alquiler')) || 0,
      fecha_inicio: fd.get('fecha_inicio'),
      fecha_fin: fd.get('fecha_fin') || null,
      estado: fd.get('estado'),
    };

    const { error } = id
      ? await db.from('contratos').update(payload).eq('id', id)
      : await db.from('contratos').insert(payload);

    if (error) { alert('Error al guardar: ' + error.message); return false; }

    this.editando = null;
    await this.cargar();
    abrir('contratos');
    return false;
  },

  editar(id) {
    this.editando = this.lista.find(c => c.id === id) || null;
    abrir('contratos');
  },

  cancelar() {
    this.editando = null;
    abrir('contratos');
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar este contrato? También se borran sus cobranzas y liquidaciones asociadas.')) return;
    const { error } = await db.from('contratos').delete().eq('id', id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    await this.cargar();
    abrir('contratos');
  }
};
