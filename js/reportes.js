// js/reportes.js
const Reportes = {
  async cargar() {
    // usa los datos ya cargados por los otros módulos
  },

  render() {
    return `
      <div class="page">
        <div class="page-header"><h1>Reportes</h1></div>
        <table class="tabla">
          <thead><tr><th>Propiedad</th><th>Cobros</th><th>Total cobrado</th><th>Liquidaciones</th><th>Total liquidado</th></tr></thead>
          <tbody>${this.filas()}</tbody>
        </table>
      </div>`;
  },

  filas() {
    if (Propiedades.lista.length === 0) return `<tr><td colspan="5">Sin datos suficientes todavía</td></tr>`;

    return Propiedades.lista.map(p => {
      const contratosProp = Contratos.lista.filter(c => c.propiedad_id === p.id).map(c => c.id);
      const cobrosProp = Cobranzas.lista.filter(c => contratosProp.includes(c.contrato_id));
      const liqProp = Liquidaciones.lista.filter(l => contratosProp.includes(l.contrato_id));

      const totalCobrado = cobrosProp.reduce((t, c) => t + Number(c.total || 0), 0);
      const totalLiquidado = liqProp.reduce((t, l) => t + Number(l.neto || 0), 0);

      return `
        <tr>
          <td>${p.direccion}</td>
          <td>${cobrosProp.length}</td>
          <td>$${totalCobrado.toLocaleString('es-AR')}</td>
          <td>${liqProp.length}</td>
          <td>$${totalLiquidado.toLocaleString('es-AR')}</td>
        </tr>`;
    }).join('');
  }
};
