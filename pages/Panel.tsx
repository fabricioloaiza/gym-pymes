import { useState } from 'react';
import { useStore } from '../store';
import type { Estado } from '../types';
import { bs, duplicados, fechaCorta, fechaLarga, hoy } from '../lib/utils';
import { Insignia, Pagina } from '../components/Comunes';

type Filtro = 'Todos' | Estado;
const FILTROS: Filtro[] = ['Todos', 'Pendiente', 'Aprobado', 'Rechazado'];

export default function Panel() {
  const { datos } = useStore();
  const [filtro, setFiltro] = useState<Filtro>('Todos');
  const h = hoy();
  const mes = h.slice(0, 7);

  const ordenados = [...datos.cobros].sort((a, b) => (a.fecha === b.fecha ? 0 : a.fecha < b.fecha ? 1 : -1));
  const conteo = (f: Filtro) => (f === 'Todos' ? datos.cobros.length : datos.cobros.filter((c) => c.estado === f).length);
  const filas = ordenados.filter((c) => filtro === 'Todos' || c.estado === filtro);

  const pendientes = conteo('Pendiente');
  const aprobadosMes = datos.cobros.filter((c) => c.estado === 'Aprobado' && c.fecha.startsWith(mes));
  const montoMes = aprobadosMes.reduce((s, c) => s + c.monto, 0);

  return (
    <Pagina seccion="cobros" rol="Recepción">
      <div>
        <h1 className="h1">Cobros</h1>
        <p className="sub">Hoy, {fechaLarga(h)}</p>
      </div>

      <div className="kpis">
        <div className="tarjeta kpi">
          <div className="kpi-etq">Pendientes de verificar</div>
          <div className="kpi-val">{pendientes}</div>
        </div>
        <div className="tarjeta kpi">
          <div className="kpi-etq">Aprobados del mes</div>
          <div className="kpi-val">{aprobadosMes.length}</div>
        </div>
        <div className="tarjeta kpi">
          <div className="kpi-etq">Monto aprobado del mes</div>
          <div className="kpi-val">{bs(montoMes)}</div>
        </div>
      </div>

      <section className="tarjeta" style={{ overflow: 'hidden' }} aria-label="Cobros registrados">
        <div className="barra-tabla">
          <div role="group" aria-label="Filtrar por estado" className="pills">
            {FILTROS.map((f) => (
              <button key={f} type="button" className="pill" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
                {f} ({conteo(f)})
              </button>
            ))}
          </div>
          <a className="btn btn--secundario btn--chico" href="#/formulario">+ Nuevo cobro (formulario)</a>
        </div>

        <div className="tabla-scroll">
          <table className="tabla" style={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Socio</th>
                <th scope="col">Plan</th>
                <th scope="col" className="num">Monto Bs</th>
                <th scope="col">N.º de operación QR</th>
                <th scope="col">Estado</th>
                <th scope="col">Validado por</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((c) => {
                const dup = duplicados(c, datos.cobros).length > 0;
                return (
                  <tr key={c.id} className={dup ? 'fila-dup' : undefined}>
                    <td style={{ whiteSpace: 'nowrap' }}>{fechaCorta(c.fecha)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.socio}</div>
                      {dup && <div className="marca-dup">N.º de operación duplicado</div>}
                    </td>
                    <td>{c.plan}</td>
                    <td className="num">{c.monto}</td>
                    <td className="mono">{c.op}</td>
                    <td><Insignia estado={c.estado} /></td>
                    <td>{c.validadoPor ?? '—'}</td>
                    <td>
                      {c.estado === 'Pendiente' ? (
                        <a className="btn btn--primario btn--chico" href={`#/verificar/${c.id}`}>Verificar</a>
                      ) : (
                        <span style={{ color: 'var(--apagado)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filas.length === 0 && <p className="vacio">No hay cobros con este estado.</p>}
        </div>
      </section>
    </Pagina>
  );
}
