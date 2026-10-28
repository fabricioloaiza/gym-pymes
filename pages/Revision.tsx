import { useState } from 'react';
import { TAMANO_MUESTRA } from '../config';
import { useStore } from '../store';
import type { Cobro } from '../types';
import { bs, descargarCsv, duplicados, fechaCorta, fechaLarga, hoy, sumarDias, vencimiento } from '../lib/utils';
import { Insignia, Pagina } from '../components/Comunes';

function sortear(lista: Cobro[], n: number): string[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, n).map((c) => c.id);
}

export default function Revision() {
  const { datos } = useStore();
  const h = hoy();
  const desde = sumarDias(h, -6);
  const semana = datos.cobros.filter((c) => c.fecha >= desde && c.fecha <= h);
  const aprobados = semana.filter((c) => c.estado === 'Aprobado');
  const pendientes = semana.filter((c) => c.estado === 'Pendiente');
  const rechazados = semana.filter((c) => c.estado === 'Rechazado');

  const [muestra, setMuestra] = useState<string[]>(() => sortear(aprobados, TAMANO_MUESTRA));
  const [revisados, setRevisados] = useState<Record<string, boolean>>({});
  const filasMuestra = muestra.map((id) => datos.cobros.find((c) => c.id === id)).filter((c): c is Cobro => !!c);
  const cnt = filasMuestra.filter((c) => revisados[c.id]).length;

  // Excepciones: se calculan a partir de los datos + bitácora manual
  const vistos = new Set<string>();
  const excDuplicados = semana
    .filter((c) => c.estado === 'Pendiente' && duplicados(c, datos.cobros).length > 0)
    .filter((c) => (vistos.has(c.op) ? false : (vistos.add(c.op), true)))
    .map((c) => {
      const grupo = [c, ...duplicados(c, datos.cobros)];
      return {
        id: `dup-${c.op}`,
        titulo: 'N.º de operación duplicado',
        detalle: `${grupo.map((g) => g.socio).join(' y ')} · ${fechaCorta(c.fecha)} · ${c.op}`,
        estado: 'Pendiente',
      };
    });
  const excRechazos = rechazados.map((c) => ({
    id: `rech-${c.id}`,
    titulo: 'Pago rechazado',
    detalle: `${c.socio} · ${(c.motivoRechazo ?? 'sin motivo').toLowerCase()}`,
    estado: 'Rechazado',
  }));
  const excBitacora = datos.bitacora
    .filter((b) => b.fecha >= desde && b.fecha <= h)
    .map((b) => ({ id: b.id, titulo: b.titulo, detalle: b.detalle, estado: b.estado }));
  const excepciones = [...excDuplicados, ...excRechazos, ...excBitacora];

  const exportar = () => {
    const filas: (string | number)[][] = [
      ['Fecha', 'Socio', 'Edad', 'Objetivo', 'Plan', 'Monto Bs', 'N.º operación QR', 'Captura', 'Estado', 'Validado por', 'Motivo rechazo', 'Vencimiento'],
      ...[...semana]
        .sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0))
        .map((c) => [
          fechaLarga(c.fecha),
          c.socio,
          c.edad ?? '',
          c.objetivo ?? '',
          c.plan,
          c.monto,
          c.op,
          c.captura,
          c.estado,
          c.validadoPor ?? '',
          c.motivoRechazo ?? '',
          c.estado === 'Aprobado' ? fechaLarga(vencimiento(c.fecha, c.plan)) : '',
        ]),
    ];
    descargarCsv(`gymxxx_cobros_${desde}_a_${h}.csv`, filas);
  };

  return (
    <Pagina seccion="revision" rol="Propietario">
      <div className="encabezado">
        <div>
          <h1 className="h1">Revisión semanal del propietario</h1>
          <p className="sub">Semana {fechaCorta(desde)} – {fechaLarga(h)}</p>
        </div>
        <button type="button" className="btn btn--primario" onClick={exportar}>
          Exportar a Excel / CSV
        </button>
      </div>

      <section aria-label="Indicadores" className="kpis kpis--5">
        <div className="tarjeta kpi">
          <div className="kpi-etq">Cobros de la semana</div>
          <div className="kpi-val">{semana.length}</div>
        </div>
        <div className="tarjeta kpi">
          <div className="kpi-etq">Aprobados</div>
          <div className="kpi-val">{aprobados.length}</div>
          <div className="kpi-extra">{bs(aprobados.reduce((s, c) => s + c.monto, 0))}</div>
        </div>
        <div className="tarjeta kpi">
          <div className="kpi-etq">Pendientes</div>
          <div className="kpi-val">{pendientes.length}</div>
        </div>
        <div className="tarjeta kpi">
          <div className="kpi-etq">Rechazados</div>
          <div className="kpi-val">{rechazados.length}</div>
        </div>
        <div className="tarjeta kpi">
          <div className="kpi-etq">Tiempo promedio por cobro</div>
          <div className="kpi-val kpi-val--texto">Por medir en el piloto</div>
          <div className="kpi-extra" style={{ marginTop: 4 }}>Meta ≤ 3,5 min</div>
        </div>
      </section>

      <section className="tarjeta tarjeta--lista" aria-labelledby="exc-h">
        <h2 id="exc-h" className="h2" style={{ margin: '14px 0 4px' }}>Excepciones</h2>
        {excepciones.length === 0 ? (
          <p className="texto-apagado" style={{ padding: '10px 0 16px' }}>Sin excepciones esta semana.</p>
        ) : (
          <ul className="lista-exc">
            {excepciones.map((e) => (
              <li key={e.id}>
                <div>
                  <div style={{ fontWeight: 600 }}>{e.titulo}</div>
                  <div className="texto-apagado">{e.detalle}</div>
                </div>
                <Insignia estado={e.estado} grande />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="tarjeta" style={{ padding: '6px 20px 14px' }} aria-labelledby="ctrl-h">
        <div className="encabezado" style={{ marginTop: 14, alignItems: 'baseline' }}>
          <h2 id="ctrl-h" className="h2">Muestra de control</h2>
          <div className="fila-acciones">
            <p style={{ fontSize: 15, fontWeight: 600 }} aria-live="polite">
              Revisados {cnt}/{filasMuestra.length}
            </p>
            <button
              type="button"
              className="btn btn--secundario btn--chico"
              onClick={() => {
                setMuestra(sortear(aprobados, TAMANO_MUESTRA));
                setRevisados({});
              }}
            >
              Sortear otra muestra
            </button>
          </div>
        </div>
        <p className="texto-apagado" style={{ marginTop: 6 }}>
          {TAMANO_MUESTRA} cobros aprobados al azar para revisar contra la app del banco.
        </p>
        <div className="tabla-scroll" style={{ marginTop: 8 }}>
          <table className="tabla tabla--simple" style={{ minWidth: 560, fontSize: 15 }}>
            <thead>
              <tr>
                <th scope="col">Socio</th>
                <th scope="col">Plan</th>
                <th scope="col" className="num">Monto Bs</th>
                <th scope="col">N.º de operación</th>
                <th scope="col">Control</th>
              </tr>
            </thead>
            <tbody>
              {filasMuestra.map((c) => (
                <tr key={c.id}>
                  <td>{c.socio}</td>
                  <td>{c.plan}</td>
                  <td className="num">{c.monto}</td>
                  <td className="mono">{c.op}</td>
                  <td>
                    <label className="check" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        style={{ margin: 0 }}
                        checked={!!revisados[c.id]}
                        onChange={() => setRevisados({ ...revisados, [c.id]: !revisados[c.id] })}
                      />
                      Revisado
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Pagina>
  );
}
