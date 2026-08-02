// js/liquidaciones.js
// Neto a pagar = Alquiler cobrado - Comisión - Gastos del propietario +/- Ajuste por impuestos
//
// El "ajuste por impuestos" es un campo manual (no se calcula solo), porque
// no hay una regla fija de cómo cada impuesto afecta la liquidación del
// propietario — depende del impuesto puntual.
const Liquidaciones = {
  lista: [],
  contratoSeleccionado: '',
  _comision: 8,
  _gastos: 0,
  _ajusteImpuestos: 0,

  async cargar() {
    const { data, error } = await db.from('liquidaciones').select('*').order('id', { ascending: false });
    if (error) { console.error('Error cargando liquidaciones:', error); this.lista = []; return; }
    this.lista = data;
  },

  calcular(contratoId, comisionPct, gastos, ajusteImpuestos) {
    const contrato = Contratos.lista.find(c => String(c.id) === String(contratoId));
    if (!contrato) return null;

    const alquiler = Number(contrato.alquiler || 0);
    const comision = alquiler * (Number(comisionPct || 0) / 100);
    const neto = alquiler - comision - Number(gastos || 0) + Number(ajusteImpuestos || 0);

    return { contrato, alquiler, comision, gastos: Number(gastos || 0), ajusteImpuestos: Number(ajusteImpuestos || 0), neto };
  },

  etiqueta(contrato) {
    const p = Propiedades.lista.find(x => x.id === contrato.propiedad_id);
    const i = Inquilinos.lista.find(x => x.id === contrato.inquilino_id);
    return `${p?.direccion || '—'} — ${i?.nombre || '—'}`;
  },

  render() {
    const d = this.contratoSeleccionado ? this.calcular(this.contratoSeleccionado, this._comision, this._gastos, this._ajusteImpuestos) : null;

    return `
      <div class="page">
        <div class="page-header"><h1>Liquidaciones</h1></div>

        <div class="card" style="max-width:480px; margin-bottom:20px; display:grid; gap:10px;">
          <label>Contrato
            <select onchange="Liquidaciones.seleccionar(this.value)">
              <option value="">Elegí un contrato…</option>
              ${Contratos.lista.filter(c => c.estado === 'Vigente').map(c => `
                <option value="${c.id}" ${String(c.id) === String(this.contratoSeleccionado) ? 'selected' : ''}>${this.etiqueta(c)}</option>`).join('')}
            </select>
          </label>
          <label>Comisión (%)
            <input type="number" step="0.1" min="0" max="100" value="${this._comision}"
                   onchange="Liquidaciones.actualizar('_comision', this.value)">
          </label>
          <label>Gastos del propietario
            <input type="number" step="0.01" min="0" value="${this._gastos}"
                   onchange="Liquidaciones.actualizar('_gastos', this.value)">
          </label>
          <label>Ajuste por impuestos (+ suma, - resta)
            <input type="number" step="0.01" value="${this._ajusteImpuestos}"
                   onchange="Liquidaciones.actualizar('_ajusteImpuestos', this.value)">
          </label>

          ${d ? this.renderDesglose(d) : ''}
        </div>

        <h2>Historial de liquidaciones</h2>
        <table class="tabla">
          <thead><tr><th>Contrato</th><th>Alquiler</th><th>Comisión</th><th>Gastos</th><th>Ajuste impuestos</th><th>Neto</th><th>Estado</th><th></th></tr></thead>
          <tbody>${this.filas()}</tbody>
        </table>
      </div>`;
  },

  renderDesglose(d) {
    const signoAjuste = d.ajusteImpuestos >= 0 ? '+' : '-';
    const colorAjuste = d.ajusteImpuestos >= 0 ? '#2b8a3e' : '#e03131';
    return `
      <div style="margin-top:10px; border-top:1px solid #eee; padding-top:12px;">
        <div class="fila-linea"><span>Alquiler cobrado</span><span>$${d.alquiler.toLocaleString('es-AR')}</span></div>
        <div class="fila-linea" style="color:#e03131"><span>(-) Comisión</span><span>-$${d.comision.toLocaleString('es-AR')}</span></div>
        <div class="fila-linea" style="color:#e03131"><span>(-) Gastos del propietario</span><span>-$${d.gastos.toLocaleString('es-AR')}</span></div>
        <div class="fila-linea" style="color:${colorAjuste}"><span>(${signoAjuste}) Ajuste por impuestos</span><span>${signoAjuste}$${Math.abs(d.ajusteImpuestos).toLocaleString('es-AR')}</span></div>
        <div class="fila-linea" style="font-weight:700; font-size:1.1em; border-top:2px solid #333; margin-top:10px; padding-top:10px;">
          <span>NETO A PAGAR</span><span>$${d.neto.toLocaleString('es-AR')}</span>
        </div>
        <button class="btn-primary" style="width:100%; margin-top:14px;"
                onclick="Liquidaciones.registrar(${d.contrato.id}, ${d.alquiler}, ${d.comision}, ${d.gastos}, ${d.ajusteImpuestos}, ${d.neto})">
          Registrar liquidación
        </button>
      </div>`;
  },

  filas() {
    if (this.lista.length === 0) return `<tr><td colspan="8">Sin liquidaciones registradas</td></tr>`;
    return this.lista.map(l => `
      <tr>
        <td>#${l.contrato_id}</td>
        <td>$${Number(l.alquiler || 0).toLocaleString('es-AR')}</td>
        <td>$${Number(l.comision || 0).toLocaleString('es-AR')}</td>
        <td>$${Number(l.gastos || 0).toLocaleString('es-AR')}</td>
        <td>$${Number(l.impuestos_transferidos || 0).toLocaleString('es-AR')}</td>
        <td><strong>$${Number(l.neto || 0).toLocaleString('es-AR')}</strong></td>
        <td>${l.estado || 'Pendiente'}</td>
        <td>
          ${l.estado !== 'Pagada' ? `<button onclick="Liquidaciones.marcarPagada(${l.id})">✅</button>` : ''}
          <button onclick="Liquidaciones.eliminar(${l.id})">🗑️</button>
        </td>
      </tr>`).join('');
  },

  seleccionar(contratoId) {
    this.contratoSeleccionado = contratoId;
    abrir('liquidaciones');
  },

  actualizar(campo, valor) {
    this[campo] = valor;
    abrir('liquidaciones');
  },

  async registrar(contratoId, alquiler, comision, gastos, ajusteImpuestos, neto) {
    const { error } = await db.from('liquidaciones').insert({
      contrato_id: contratoId,
      alquiler,
      comision,
      gastos,
      impuestos_transferidos: ajusteImpuestos,
      neto,
      estado: 'Pendiente',
      fecha: new Date().toISOString().slice(0, 10),
    });

    if (error) { alert('Error al registrar la liquidación: ' + error.message); return; }
    await this.cargar();
    abrir('liquidaciones');
  },

  async marcarPagada(id) {
    const { error } = await db.from('liquidaciones').update({ estado: 'Pagada' }).eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    await this.cargar();
    abrir('liquidaciones');
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar esta liquidación?')) return;
    const { error } = await db.from('liquidaciones').delete().eq('id', id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    await this.cargar();
    abrir('liquidaciones');
  }
};
