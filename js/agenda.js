// js/agenda.js
// Recordatorios / eventos: vencimientos de contratos, pagos pendientes,
// tareas, etc. Se pueden vincular opcionalmente a una propiedad.
const Agenda = {
  lista: [],
  editando: null,

  async cargar() {
    const { data, error } = await db.from('agenda').select('*').order('fecha', { ascending: true });
    if (error) { console.error('Error cargando agenda:', error); this.lista = []; return; }
    this.lista = data;
  },

  direccion(id) {
    if (!id) return '';
    const p = Propiedades.lista.find(x => x.id === id);
    return p ? p.direccion : '';
  },

  render() {
    const e = this.editando;
    const hoy = new Date().toISOString().slice(0, 10);

    return `
      <div class="page">
        <div class="page-header"><h1>Agenda</h1></div>

        <form class="card" style="margin-bottom:20px; display:grid; gap:10px; max-width:420px;"
              onsubmit="return Agenda.guardar(event)">
          <input type="hidden" name="id" value="${e?.id || ''}">
          <input type="text" name="titulo" placeholder="Título (ej. Vencimiento contrato)" value="${e?.titulo || ''}" required>
          <input type="date" name="fecha" value="${e?.fecha || hoy}" required>
          <textarea name="descripcion" placeholder="Detalle (opcional)" rows="2">${e?.descripcion || ''}</textarea>
          <select name="propiedad_id">
            <option value="">Sin propiedad asociada</option>
            ${Propiedades.lista.map(p => `<option value="${p.id}" ${String(p.id) === String(e?.propiedad_id) ? 'selected' : ''}>${p.direccion}</option>`).join('')}
          </select>
          <label><input type="checkbox" name="completado" ${e?.completado ? 'checked' : ''}> Completado</label>
          <div style="display:flex; gap:10px;">
            <button type="submit" class="btn-primary">${e ? 'Guardar cambios' : '➕ Nuevo recordatorio'}</button>
            ${e ? `<button type="button" onclick="Agenda.cancelar()">Cancelar</button>` : ''}
          </div>
        </form>

        <table class="tabla">
          <thead><tr><th>Fecha</th><th>Título</th><th>Propiedad</th><th>Estado</th><th></th></tr></thead>
          <tbody>${this.filas(hoy)}</tbody>
        </table>
      </div>`;
  },

  filas(hoy) {
    if (this.lista.length === 0) return `<tr><td colspan="5">Sin recordatorios cargados</td></tr>`;
    return this.lista.map(a => {
      const vencido = !a.completado && a.fecha < hoy;
      return `
      <tr style="opacity:${a.completado ? 0.5 : 1}">
        <td style="color:${vencido ? '#e03131' : 'inherit'}; font-weight:${vencido ? '600' : 'normal'}">${a.fecha}</td>
        <td>${a.titulo}${a.descripcion ? `<br><span style="font-size:0.85em; color:#888">${a.descripcion}</span>` : ''}</td>
        <td>${this.direccion(a.propiedad_id) || '-'}</td>
        <td>${a.completado ? 'Completado' : (vencido ? 'Vencido' : 'Pendiente')}</td>
        <td>
          ${!a.completado ? `<button onclick="Agenda.marcarCompletado(${a.id})">✅</button>` : ''}
          <button onclick="Agenda.editar(${a.id})">✏️</button>
          <button onclick="Agenda.eliminar(${a.id})">🗑️</button>
        </td>
      </tr>`;
    }).join('');
  },

  async guardar(ev) {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const id = fd.get('id');
    const payload = {
      titulo: fd.get('titulo'),
      fecha: fd.get('fecha'),
      descripcion: fd.get('descripcion') || null,
      propiedad_id: fd.get('propiedad_id') || null,
      completado: fd.get('completado') === 'on',
    };

    const { error } = id
      ? await db.from('agenda').update(payload).eq('id', id)
      : await db.from('agenda').insert(payload);

    if (error) { alert('Error al guardar: ' + error.message); return false; }

    this.editando = null;
    await this.cargar();
    abrir('agenda');
    return false;
  },

  editar(id) {
    this.editando = this.lista.find(a => a.id === id) || null;
    abrir('agenda');
  },

  cancelar() {
    this.editando = null;
    abrir('agenda');
  },

  async marcarCompletado(id) {
    const { error } = await db.from('agenda').update({ completado: true }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    await this.cargar();
    abrir('agenda');
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar este recordatorio?')) return;
    const { error } = await db.from('agenda').delete().eq('id', id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    await this.cargar();
    abrir('agenda');
  }
};
