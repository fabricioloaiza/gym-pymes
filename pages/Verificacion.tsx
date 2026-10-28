import { useState } from 'react';
import { VALIDADORES } from '../config';
import { ir } from '../router';
import { useStore } from '../store';
import { bs, duplicados, fechaCorta, fechaLarga, vencimiento } from '../lib/utils';
import { IconoAlerta, Insignia, Pagina } from '../components/Comunes';

export default function Verificacion({ id }: { id?: string }) {
  const { datos, despachar } = useStore();
  const cobro = datos.cobros.find((c) => c.id === id);
  const [verificado, setVerificado] = useState(false);
  const [rechazoAbierto, setRechazoAbierto] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [validador, setValidador] = useState(VALIDADORES[0]);
  const [intentoRechazo, setIntentoRechazo] = useState(false);

  if (!cobro) {
    return (
      <Pagina seccion="cobros" rol="Recepción">
        <h1 className="h1">Cobro no encontrado</h1>
        <a href="#/cobros">Volver a Cobros</a>
      </Pagina>
    );
  }

  const otros = duplicados(cobro, datos.cobros);
  const yaAprobado = otros.find((o) => o.estado === 'Aprobado');
  const pendiente = cobro.estado === 'Pendiente';
  const puedeAprobar = pendiente && verificado && !yaAprobado;

  const aprobar = () => {
    if (!puedeAprobar) return;
    despachar({ tipo: 'aprobar', id: cobro.id, validadoPor: validador });
    ir('/cobros');
  };

  const rechazar = () => {
    setIntentoRechazo(true);
    if (!motivo.trim()) return;
    despachar({ tipo: 'rechazar', id: cobro.id, validadoPor: validador, motivo: motivo.trim() });
    ir('/cobros');
  };

  return (
    <Pagina seccion="cobros" rol="Recepción">
      <div className="migas">
        <a href="#/cobros">Cobros</a> / {cobro.socio}
      </div>
      <div className="encabezado encabezado--centro">
        <h1 className="h1">Verificación de un pago</h1>
        <Insignia estado={cobro.estado} grande />
      </div>

      {otros.length > 0 && (
        <div role="alert" className="alerta">
          <IconoAlerta />
          <span>
            {otros.length === 1
              ? `Este N.º de operación también aparece en el cobro de ${otros[0].socio} (${fechaCorta(otros[0].fecha)}).`
              : `Este N.º de operación también aparece en ${otros.length} cobros más: ${otros.map((o) => o.socio).join(', ')}.`}{' '}
            {yaAprobado ? `Ya fue aprobado para ${yaAprobado.socio}: no se puede aprobar dos veces.` : 'Revisa antes de aprobar.'}
          </span>
        </div>
      )}

      <div className="columnas">
        <section className="col-principal" aria-label="Detalle del cobro">
          <div className="tarjeta tarjeta--lista">
            <h2 className="h2 h2--chico" style={{ margin: '14px 0 4px' }}>Detalle del cobro</h2>
            <dl className="dl">
              <div><dt>Socio</dt><dd>{cobro.socio}</dd></div>
              <div><dt>Edad · objetivo</dt><dd>{cobro.edad ?? '—'} · {cobro.objetivo ?? '—'}</dd></div>
              <div><dt>Plan</dt><dd>{cobro.plan}</dd></div>
              <div><dt>Monto</dt><dd>{bs(cobro.monto)}</dd></div>
              <div><dt>N.º de operación</dt><dd>{cobro.op}</dd></div>
              <div>
                <dt>Captura recibida</dt>
                <dd style={{ fontWeight: 400 }}>Por WhatsApp · <strong>{cobro.captura}</strong></dd>
              </div>
              <div><dt>Fecha de inicio</dt><dd>{fechaLarga(cobro.fecha)}</dd></div>
              <div>
                <dt>Vencimiento <span style={{ fontSize: 13 }}>(calculado por fórmula)</span></dt>
                <dd>{fechaLarga(vencimiento(cobro.fecha, cobro.plan))}</dd>
              </div>
              {cobro.estado !== 'Pendiente' && (
                <div><dt>Validado por</dt><dd>{cobro.validadoPor ?? '—'}</dd></div>
              )}
              {cobro.motivoRechazo && (
                <div><dt>Motivo del rechazo</dt><dd>{cobro.motivoRechazo}</dd></div>
              )}
            </dl>
          </div>

          {pendiente && (
            <div className="tarjeta tarjeta--pad">
              <h2 className="h2 h2--chico" style={{ marginBottom: 10 }}>Pasos de verificación</h2>
              <ol className="pasos">
                <li>Abrir la app del banco.</li>
                <li>Buscar el N.º de operación <strong>{cobro.op}</strong>.</li>
                <li>Confirmar monto ({bs(cobro.monto)}) y fecha del abono.</li>
              </ol>
              <label className="check separador" style={{ fontWeight: 600 }}>
                <input type="checkbox" checked={verificado} onChange={() => setVerificado(!verificado)} />
                <span>Verifiqué el abono en la app del banco</span>
              </label>
            </div>
          )}
        </section>

        {pendiente && (
          <aside className="tarjeta col-lateral" aria-label="Acciones">
            <h2 className="h2 h2--chico">Decisión</h2>

            <div className="campo">
              <label htmlFor="validador">Validado por</label>
              <select id="validador" value={validador} onChange={(e) => setValidador(e.target.value)}>
                {VALIDADORES.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <button type="button" className="btn btn--primario btn--bloque" disabled={!puedeAprobar} onClick={aprobar}>
                Aprobar
              </button>
              {!verificado && !yaAprobado && (
                <p className="ayuda" style={{ marginTop: 8 }}>Marca la casilla de verificación para aprobar.</p>
              )}
              {yaAprobado && (
                <p className="error-campo" style={{ marginTop: 8 }}>Número de operación ya usado en un cobro aprobado.</p>
              )}
            </div>

            <button
              type="button"
              className="btn btn--rechazar btn--bloque"
              aria-expanded={rechazoAbierto}
              onClick={() => setRechazoAbierto(!rechazoAbierto)}
            >
              Rechazar
            </button>

            {rechazoAbierto && (
              <div className="campo" style={{ borderTop: '1px solid var(--divisor)', paddingTop: 14, gap: 8 }}>
                <label htmlFor="motivo">Motivo del rechazo</label>
                <textarea
                  id="motivo"
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  aria-invalid={intentoRechazo && !motivo.trim()}
                  placeholder="Ej. Monto no acreditado en la app del banco"
                />
                {intentoRechazo && !motivo.trim() && <span className="error-campo">Escribe el motivo para dejarlo registrado.</span>}
                <button type="button" className="btn btn--peligro" onClick={rechazar}>
                  Confirmar rechazo
                </button>
              </div>
            )}
          </aside>
        )}
      </div>

      <p className="texto-apagado">Ningún pago se activa sin verificación en el banco.</p>
    </Pagina>
  );
}
