// js/impuestos.js
const Impuestos = {
  lista: [],
  editando: null,

  async cargar() {
    const { data, error } = await db.from('impuestos').select('*').order('propiedad_id');
    if (error) { console.error('Error cargando impuestos:', error); this.lista = []; return; }
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
        <div class="page-header"><h1>Impuestos</h1></div>

        <form class="card" style="margin-bottom:20px; display:grid; gap:10px; max-width:420px;"
              onsubmit="return Impuestos.guardar(event)">
          <input type="hidden" name="id" value="${e?.id || ''}">
          <select name="propiedad_id" required>
            <option value="">Propiedad…</option>
            ${Propiedades.lista.map(p => `<option value="${p.id}" ${String(p.id) === String(e?.propiedad_id) ? 'selected' : ''}>${p.direccion}</option>`).join('')}
          </select>
          <input type="text" name="concepto" placeholder="Concepto (ej. TGI, Inmobiliario)" value="${e?.concepto || ''}" required>
          <input type="number" name="importe" step="0.01" min="0" placeholder="Importe" value="${e?.importe || ''}" required>
          <select name="pagador">
            <option value="Inquilino" ${e?.pagador === 'Inquilino' ? 'selected' : ''}>Inquilino</option>
            <option value="Propietario" ${e?.pagador === 'Propietario' ? 'selected' : ''}>Propietario</option>
          </select>
          <label><input type="checkbox" name="activo" ${e ? (e.activo ? 'checked' : '') : 'checked'}> Activo</label>
          <div style="display:flex; gap:10px;">
            <button type="submit" class="btn-primary">${e ? 'Guardar cambios' : '➕ Nuevo impuesto'}</button>
            ${e ? `<button type="button" onclick="Impuestos.cancelar()">Cancelar</button>` : ''}
          </div>
        </form>

        <table class="tabla">
          <thead><tr><th>Propiedad</th><th>Concepto</th><th>Importe</th><th>Paga</th><th>Estado</th><th></th></tr></thead>
          <tbody>${this.filas()}</tbody>
        </table>
      </div>`;
  },

  filas() {
    if (this.lista.length === 0) return `<tr><td colspan="6">Sin impuestos cargados</td></tr>`;
    return this.lista.map(i => `
      <tr style="opacity:${i.activo ? 1 : 0.5}">
        <td>${this.direccion(i.propiedad_id)}</td>
        <td>${i.concepto}</td>
        <td>$${Number(i.importe).toLocaleString('es-AR')}</td>
        <td>${i.pagador}</td>
        <td>${i.activo ? 'Activo' : 'Inactivo'}</td>
        <td>
          <button onclick="Impuestos.editar(${i.id})">✏️</button>
          <button onclick="Impuestos.eliminar(${i.id})">🗑️</button>
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
      activo: fd.get('activo') === 'on',
    };

    const { error } = id
      ? await db.from('impuestos').update(payload).eq('id', id)
      : await db.from('impuestos').insert(payload);

    if (error) { alert('Error al guardar: ' + error.message); return false; }

    this.editando = null;
    await this.cargar();
    abrir('impuestos');
    return false;
  },

  editar(id) {
    this.editando = this.lista.find(i => i.id === id) || null;
    abrir('impuestos');
  },

  cancelar() {
    this.editando = null;
    abrir('impuestos');
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar este impuesto?')) return;
    const { error } = await db.from('impuestos').delete().eq('id', id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    await this.cargar();
    abrir('impuestos');
  }
};