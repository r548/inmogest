// js/cobranzas.js
// Cobranza = Alquiler + todos los Impuestos activos + todos los Servicios activos
// de la propiedad (sin importar quién figure como "pagador" — todos se cobran
// al inquilino junto con el alquiler).
const Cobranzas = {
  lista: [],
  contratoSeleccionado: '',

  async cargar() {
    const { data, error } = await db.from('cobranzas').select('*').order('id', { ascending: false });
    if (error) { console.error('Error cargando cobranzas:', error); this.lista = []; return; }
    this.lista = data;
  },

  etiquetaContrato(c) {
    const prop = Propiedades.lista.find(p => p.id === c.propiedad_id);
    const inq = Inquilinos.lista.find(i => i.id === c.inquilino_id);
    return `${prop?.direccion || '—'} / ${inq?.nombre || '—'}`;
  },

  calcularDesglose(contratoId) {
    const contrato = Contratos.lista.find(c => String(c.id) === String(contratoId));
    if (!contrato) return null;

    const impuestos = Impuestos.lista.filter(i => i.propiedad_id === contrato.propiedad_id && i.activo);
    const servicios = Servicios.lista.filter(s => s.propiedad_id === contrato.propiedad_id && s.activo);

    const totalImpuestos = impuestos.reduce((t, i) => t + Number(i.importe), 0);
    const totalServicios = servicios.reduce((t, s) => t + Number(s.importe), 0);
    const alquiler = Number(contrato.alquiler || 0);
    const total = alquiler + totalImpuestos + totalServicios;

    return { contrato, alquiler, impuestos, totalImpuestos, servicios, totalServicios, total };
  },

  render() {
    const d = this.contratoSeleccionado ? this.calcularDesglose(this.contratoSeleccionado) : null;

    return `
      <div class="page">
        <div class="page-header"><h1>Cobranzas</h1></div>

        <div class="card" style="max-width:480px; margin-bottom:20px;">
          <label>Contrato
            <select onchange="Cobranzas.seleccionar(this.value)">
              <option value="">Elegí un contrato…</option>
              ${Contratos.lista.filter(c => c.estado === 'Vigente').map(c => `
                <option value="${c.id}" ${String(c.id) === String(this.contratoSeleccionado) ? 'selected' : ''}>
                  ${this.direccionContrato(c)} — ${this.inquilinoContrato(c)}
                </option>`).join('')}
            </select>
          </label>

          ${d ? this.renderDesglose(d) : ''}
        </div>

        <h2>Historial de cobranzas</h2>
        <table class="tabla">
          <thead><tr><th>Contrato</th><th>Total</th><th>Estado</th><th>Vencimiento</th><th></th></tr></thead>
          <tbody>${this.filas()}</tbody>
        </table>
      </div>`;
  },

  direccionContrato(c) {
    const p = Propiedades.lista.find(x => x.id === c.propiedad_id);
    return p ? p.direccion : '—';
  },

  inquilinoContrato(c) {
    const i = Inquilinos.lista.find(x => x.id === c.inquilino_id);
    return i ? i.nombre : '—';
  },

  renderDesglose(d) {
    const filaImp = d.impuestos.length
      ? d.impuestos.map(i => `<div class="fila-linea"><span>${i.concepto}</span><span>$${Number(i.importe).toLocaleString('es-AR')}</span></div>`).join('')
      : `<div class="fila-linea" style="color:#888"><span>Sin impuestos activos en esta propiedad</span></div>`;

    const filaServ = d.servicios.length
      ? d.servicios.map(s => `<div class="fila-linea"><span>${s.concepto}</span><span>$${Number(s.importe).toLocaleString('es-AR')}</span></div>`).join('')
      : `<div class="fila-linea" style="color:#888"><span>Sin servicios activos en esta propiedad</span></div>`;

    return `
      <div style="margin-top:16px; border-top:1px solid #eee; padding-top:12px;">
        <div class="fila-linea" style="font-weight:600;"><span>Alquiler</span><span>$${d.alquiler.toLocaleString('es-AR')}</span></div>

        <h4 style="margin:12px 0 4px; font-size:0.85em; color:#888;">IMPUESTOS</h4>
        ${filaImp}

        <h4 style="margin:12px 0 4px; font-size:0.85em; color:#888;">SERVICIOS</h4>
        ${filaServ}

        <div class="fila-linea" style="font-weight:700; font-size:1.1em; border-top:2px solid #333; margin-top:10px; padding-top:10px;">
          <span>TOTAL A COBRAR</span><span>$${d.total.toLocaleString('es-AR')}</span>
        </div>

        <button class="btn-primary" style="width:100%; margin-top:14px;"
                onclick="Cobranzas.registrar(${d.contrato.id}, ${d.alquiler}, ${d.totalImpuestos}, ${d.totalServicios}, ${d.total})">
          Registrar cobro
        </button>
      </div>`;
  },

  filas() {
    if (this.lista.length === 0) return `<tr><td colspan="5">Sin cobranzas registradas</td></tr>`;
    return this.lista.map(c => `
      <tr>
        <td>${c.contrato || '-'}</td>
        <td>$${Number(c.total || 0).toLocaleString('es-AR')}</td>
        <td>${c.estado}</td>
        <td>${c.fecha_vencimiento || '-'}</td>
        <td>
          ${c.estado !== 'Pagado' ? `<button onclick="Cobranzas.marcarPagado(${c.id})">✅</button>` : ''}
          <button onclick="Cobranzas.eliminar(${c.id})">🗑️</button>
        </td>
      </tr>`).join('');
  },

  seleccionar(contratoId) {
    this.contratoSeleccionado = contratoId;
    abrir('cobranzas');
  },

  async registrar(contratoId, alquiler, impuestos, servicios, total) {
    const contrato = Contratos.lista.find(c => c.id === contratoId);
    const etiqueta = `${this.direccionContrato(contrato)} — ${this.inquilinoContrato(contrato)}`;

    const { error } = await db.from('cobranzas').insert({
      contrato_id: contratoId,
      contrato: etiqueta,
      alquiler,
      impuestos,
      servicios,
      total,
      estado: 'Pendiente',
    });

    if (error) { alert('Error al registrar el cobro: ' + error.message); return; }
    await this.cargar();
    abrir('cobranzas');
  },

  async marcarPagado(id) {
    const { error } = await db.from('cobranzas').update({ estado: 'Pagado', fecha_pago: new Date().toISOString().slice(0, 10) }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    await this.cargar();
    abrir('cobranzas');
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar esta cobranza?')) return;
    const { error } = await db.from('cobranzas').delete().eq('id', id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    await this.cargar();
    abrir('cobranzas');
  }
};
