// js/dashboard.js
const Dashboard = {
  async cargar() {
    // Los datos ya están en los otros módulos (app.js los carga a todos
    // antes de renderizar cualquier vista)
  },

  render() {
    const totalPropiedades = Propiedades.lista.length;
    const totalInquilinos = Inquilinos.lista.length;

    const totalCobradoMes = Cobranzas.lista
      .filter(c => c.estado === 'Pagado')
      .reduce((t, c) => t + Number(c.total), 0);

    const pendienteMes = Cobranzas.lista
      .filter(c => c.estado === 'Pendiente')
      .reduce((t, c) => t + Number(c.total), 0);

    const netoMes = Liquidaciones.lista.length > 0
      ? Liquidaciones.lista.reduce((t, l) => t + Number(l.neto), 0)
      : 0;

    const tasaCobro = Cobranzas.lista.length > 0
      ? Math.round((Cobranzas.lista.filter(c => c.estado === 'Pagado').length / Cobranzas.lista.length) * 100)
      : 0;

    return `
      <div class="page">
        <div class="page-header">
          <h1>Dashboard</h1>
          <p style="color:#666; font-size:0.95em">Resumen general de InmoGest</p>
        </div>

        <div class="cards">
          <div class="card">
            <h3>Propiedades</h3>
            <h1>${totalPropiedades}</h1>
            <p style="font-size:0.9em; color:#666">Inmuebles registrados</p>
          </div>
          <div class="card">
            <h3>Inquilinos</h3>
            <h1>${totalInquilinos}</h1>
            <p style="font-size:0.9em; color:#666">Locatarios activos</p>
          </div>
          <div class="card">
            <h3>Cobrado Este Mes</h3>
            <h1>$${totalCobradoMes.toLocaleString('es-AR')}</h1>
            <p style="font-size:0.9em; color:#666">${Cobranzas.lista.filter(c => c.estado === 'Pagado').length} cobranzas</p>
          </div>
          <div class="card">
            <h3>Pendiente</h3>
            <h1 style="color:#ff6b6b">$${pendienteMes.toLocaleString('es-AR')}</h1>
            <p style="font-size:0.9em; color:#666">Tasa de cobro: ${tasaCobro}%</p>
          </div>
        </div>

        <div class="cards">
          <div class="card">
            <h3>Neto Propietarios</h3>
            <h1 style="color:#51cf66">$${netoMes.toLocaleString('es-AR')}</h1>
            <p style="font-size:0.9em; color:#666">${Liquidaciones.lista.length} liquidaciones</p>
          </div>
          <div class="card">
            <h3>Cobranzas</h3>
            <h1>${Cobranzas.lista.length}</h1>
            <p style="font-size:0.9em; color:#666">${Cobranzas.lista.filter(c => c.estado === 'Pagado').length} pagadas</p>
          </div>
          <div class="card">
            <h3>Impuestos</h3>
            <h1>${Impuestos.lista.length}</h1>
            <p style="font-size:0.9em; color:#666">Registrados</p>
          </div>
          <div class="card">
            <h3>Servicios</h3>
            <h1>${Servicios.lista.length}</h1>
            <p style="font-size:0.9em; color:#666">Cargados</p>
          </div>
        </div>

        <h2>Últimas Cobranzas</h2>
        <table class="tabla">
          <thead>
            <tr><th>Contrato</th><th>Total</th><th>Estado</th><th>Vencimiento</th></tr>
          </thead>
          <tbody>${this.filasUltimas()}</tbody>
        </table>

        <h2>Acciones Rápidas</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 15px;">
          <button class="btn-primary" onclick="abrir('propiedades')" style="padding: 15px;">➕ Nueva Propiedad</button>
          <button class="btn-primary" onclick="abrir('inquilinos')" style="padding: 15px;">➕ Nuevo Inquilino</button>
          <button class="btn-primary" onclick="abrir('contratos')" style="padding: 15px;">➕ Nuevo Contrato</button>
          <button class="btn-primary" onclick="abrir('cobranzas')" style="padding: 15px;">💳 Nueva Cobranza</button>
        </div>
      </div>
    `;
  },

  filasUltimas() {
    const ultimas = Cobranzas.lista.slice(0, 5);
    if (ultimas.length === 0) {
      return `<tr><td colspan="4">Sin cobranzas registradas</td></tr>`;
    }
    return ultimas.map(c => `
      <tr style="background-color: ${c.estado === 'Pagado' ? '#f0f9ff' : '#fff8f0'}">
        <td>${c.contrato || '-'}</td>
        <td>$${Number(c.total || 0).toLocaleString('es-AR')}</td>
        <td>
          <span style="
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            background-color: ${c.estado === 'Pagado' ? '#d3f9d8' : '#ffe0b2'};
            color: ${c.estado === 'Pagado' ? '#2b8a3e' : '#e65100'};
          ">${c.estado}</span>
        </td>
        <td>${c.fecha_vencimiento || '-'}</td>
      </tr>
    `).join('');
  }
};
