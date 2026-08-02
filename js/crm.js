// js/crm.js
const Crm = {
  lista: [],
  editando: null,
  estados: ['Nuevo', 'Contactado', 'Visita agendada', 'En negociación', 'Cerrado', 'Descartado'],

  async cargar() {
    const { data, error } = await db.from('crm').select('*').order('fecha_creacion', { ascending: false });
    if (error) { console.error('Error cargando CRM:', error); this.lista = []; return; }
    this.lista = data;
  },

  render() {
    const e = this.editando;
    return `
      <div class="page">
        <div class="page-header"><h1>CRM - Gestión Comercial</h1></div>

        <form class="card" style="margin-bottom:20px; display:grid; gap:10px; max-width:480px;"
              onsubmit="return Crm.guardar(event)">
          <input type="hidden" name="id" value="${e?.id || ''}">
          <input type="text" name="nombre" placeholder="Nombre y Apellido del Cliente" value="${e?.nombre || ''}" required>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <input type="text" name="telefono" placeholder="Teléfono" value="${e?.telefono || ''}">
            <input type="email" name="email" placeholder="Email" value="${e?.email || ''}">
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <select name="tipo_operacion">
              <option value="Alquiler" ${e?.tipo_operacion === 'Alquiler' ? 'selected' : ''}>Alquiler</option>
              <option value="Compra" ${e?.tipo_operacion === 'Compra' ? 'selected' : ''}>Compra</option>
              <option value="Tasación" ${e?.tipo_operacion === 'Tasación' ? 'selected' : ''}>Tasación</option>
            </select>
            <input type="number" name="presupuesto" step="0.01" min="0" placeholder="Presupuesto aproximado" value="${e?.presupuesto || ''}">
          </div>
          <select name="estado">
            ${this.estados.map(est => `<option value="${est}" ${est === (e?.estado || 'Nuevo') ? 'selected' : ''}>${est}</option>`).join('')}
          </select>
          <textarea name="notas" placeholder="Notas de seguimiento (ej. Busca 2 dormitorios por zona centro, prefiere cochera...)" style="padding:8px; font-family:inherit; border:1px solid #ccc; border-radius:4px; height:70px;">${e?.notas || ''}</textarea>
          
          <div style="display:flex; gap:10px;">
            <button type="submit" class="btn-primary">${e ? 'Guardar cambios' : '➕ Registrar Prospecto'}</button>
            ${e ? `<button type="button" onclick="Crm.cancelar()">Cancelar</button>` : ''}
          </div>
        </form>

        <h2>Seguimiento de Leads</h2>
        <table class="tabla">
          <thead>
            <tr><th>Cliente</th><th>Contacto</th><th>Operación</th><th>Presupuesto</th><th>Estado</th><th>Notas</th><th></th></tr>
          </thead>
          <tbody>${this.filas()}</tbody>
        </table>
      </div>`;
  },

  filas() {
    if (this.lista.length === 0) return `<tr><td colspan="7">Sin prospectos cargados en el CRM</td></tr>`;
    return this.lista.map(c => `
      <tr>
        <td><strong>${c.nombre}</strong></td>
        <td>${c.telefono || '-'}<br><span style="font-size:0.85em; color:#666;">${c.email || ''}</span></td>
        <td>${c.tipo_operacion || '-'}</td>
        <td>$${Number(c.presupuesto || 0).toLocaleString('es-AR')}</td>
        <td>
          <span style="
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            background-color: ${c.estado === 'Cerrado' ? '#d3f9d8' : c.estado === 'Descartado' ? '#ffe3e3' : '#e7f5ff'};
            color: ${c.estado === 'Cerrado' ? '#2b8a3e' : c.estado === 'Descartado' ? '#c92a2a' : '#1864ab'};
          ">${c.estado}</span>
        </td>
        <td style="max-width: 200px; font-size:0.9em; color:#444;">${c.notas || '-'}</td>
        <td>
          <button onclick="Crm.editar(${c.id})">✏️</button>
          <button onclick="Crm.eliminar(${c.id})">🗑️</button>
        </td>
      </tr>`).join('');
  },

  async guardar(ev) {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const id = fd.get('id');
    const payload = {
      nombre: fd.get('nombre'),
      telefono: fd.get('telefono'),
      email: fd.get('email'),
      tipo_operacion: fd.get('tipo_operacion'),
      presupuesto: parseFloat(fd.get('presupuesto')) || 0,
      estado: fd.get('estado'),
      notas: fd.get('notas')
    };

    const { error } = id
      ? await db.from('crm').update(payload).eq('id', id)
      : await db.from('crm').insert(payload);

    if (error) { alert('Error al guardar en CRM: ' + error.message); return false; }

    this.editando = null;
    await this.cargar();
    abrir('crm');
    return false;
  },

  editar(id) {
    this.editando = this.lista.find(c => c.id === id) || null;
    abrir('crm');
  },

  cancelar() {
    this.editando = null;
    abrir('crm');
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar este prospecto del CRM?')) return;
    const { error } = await db.from('crm').delete().eq('id', id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    await this.cargar();
    abrir('crm');
  }
};