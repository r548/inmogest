// js/servicios.js
const Servicios = {
  lista: [],
  editando: null,
  conceptos: ['Expensas', 'Luz', 'Gas natural', 'Internet', 'Seguro', 'Otros'],

  async cargar() {
    const { data, error } = await db.from('servicios').select('*').order('propiedad_id');
    if (error) { console.error('Error cargando servicios:', error); this.lista = []; return; }
    this.lista = data;
  },

  direccion(id) {
    const p = Propiedades.lista.find(x => x.id === id);
    return p ? p.direccion : '—';
  },

  render() {
    const e = this.editando;
    return `
      <div class="page">
        <div class="page-header"><h1>Servicios</h1></div>

        <form class="card" style="margin-bottom:20px; display:grid; gap:10px; max-width:420px;"
              onsubmit="return Servicios.guardar(event)">
          <input type="hidden" name="id" value="${e?.id || ''}">
          <select name="propiedad_id" required>
            <option value="">Propiedad…</option>
            ${Propiedades.lista.map(p => `<option value="${p.id}" ${String(p.id) === String(e?.propiedad_id) ? 'selected' : ''}>${p.direccion}</option>`).join('')}
          </select>
          <select name="concepto">
            ${this.conceptos.map(c => `<option value="${c}" ${c === e?.concepto ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <input type="number" name="importe" step="0.01" min="0" placeholder="Importe" value="${e?.importe || ''}" required>
          <select name="pagador">
            <option value="Inquilino" ${e?.pagador === 'Inquilino' ? 'selected' : ''}>Inquilino</option>
            <option value="Propietario" ${e?.pagador === 'Propietario' ? 'selected' : ''}>Propietario</option>
          </select>
          <select name="periodo">
            <option value="Mensual" ${e?.periodo === 'Mensual' ? 'selected' : ''}>Mensual</option>
            <option value="Bimestral" ${e?.periodo === 'Bimestral' ? 'selected' : ''}>Bimestral</option>
            <option value="Anual" ${e?.periodo === 'Anual' ? 'selected' : ''}>Anual</option>
          </select>
          <label><input type="checkbox" name="activo" ${e ? (e.activo ? 'checked' : '') : 'checked'}> Activo</label>
          <div style="display:flex; gap:10px;">
            <button type="submit" class="btn-primary">${e ? 'Guardar cambios' : '➕ Nuevo servicio'}</button>
            ${e ? `<button type="button" onclick="Servicios.cancelar()">Cancelar</button>` : ''}
          </div>
        </form>

        <table class="tabla">
          <thead><tr><th>Propiedad</th><th>Concepto</th><th>Importe</th><th>Paga</th><th>Periodo</th><th>Estado</th><th></th></tr></thead>
          <tbody>${this.filas()}</tbody>
        </table>
      </div>`;
  },

  filas() {
    if (this.lista.length === 0) return `<tr><td colspan="7">Sin servicios cargados</td></tr>`;
    return this.lista.map(s => `
      <tr style="opacity:${s.activo ? 1 : 0.5}">
        <td>${this.direccion(s.propiedad_id)}</td>
        <td>${s.concepto}</td>
        <td>$${Number(s.importe).toLocaleString('es-AR')}</td>
        <td>${s.pagador}</td>
        <td>${s.periodo}</td>
        <td>${s.activo ? 'Activo' : 'Inactivo'}</td>
        <td>
          <button onclick="Servicios.editar(${s.id})">✏️</button>
          <button onclick="Servicios.eliminar(${s.id})">🗑️</button>
        </td>
      </tr>`).join('');
  },

  async guardar(ev) {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const id = fd.get('id');
    const payload = {
      propiedad_id: fd.get('propiedad_id'),
      concepto: fd.get('concepto'),
      importe: parseFloat(fd.get('importe')) || 0,
      pagador: fd.get('pagador'),
      periodo: fd.get('periodo'),
      activo: fd.get('activo') === 'on',
    };

    const { error } = id
      ? await db.from('servicios').update(payload).eq('id', id)
      : await db.from('servicios').insert(payload);

    if (error) { alert('Error al guardar: ' + error.message); return false; }

    this.editando = null;
    await this.cargar();
    abrir('servicios');
    return false;
  },

  editar(id) {
    this.editando = this.lista.find(s => s.id === id) || null;
    abrir('servicios');
  },

  cancelar() {
    this.editando = null;
    abrir('servicios');
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar este servicio?')) return;
    const { error } = await db.from('servicios').delete().eq('id', id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    await this.cargar();
    abrir('servicios');
  }
};
