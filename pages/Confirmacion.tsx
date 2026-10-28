import { useStore } from '../store';
import { bs } from '../lib/utils';
import { IconoCheck, Insignia, MovilCabecera } from '../components/Comunes';

export default function Confirmacion({ id }: { id?: string }) {
  const { datos } = useStore();
  const cobro = datos.cobros.find((c) => c.id === id);

  return (
    <div className="movil-fondo">
      <div className="movil">
        <MovilCabecera />
        <main className="movil-cuerpo" style={{ paddingTop: 24 }}>
          {!cobro ? (
            <section className="tarjeta exito">
              <h2 style={{ fontSize: 20 }}>No encontramos ese envío</h2>
              <a className="btn btn--primario" href="#/formulario">Volver al formulario</a>
            </section>
          ) : (
            <>
              <section className="tarjeta exito">
                <div className="exito-icono" aria-hidden="true">
                  <IconoCheck />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>Recibimos tu pago</h2>
                {cobro.estado === 'Pendiente' ? (
                  <span className="badge badge--Pendiente badge--grande">Pendiente de verificación</span>
                ) : (
                  <Insignia estado={cobro.estado} grande />
                )}
                <p style={{ fontSize: 15, lineHeight: 1.5 }}>Te avisaremos por WhatsApp cuando tu membresía se active.</p>
              </section>

              <section className="tarjeta" style={{ padding: '6px 18px' }} aria-labelledby="resumen">
                <h3 id="resumen" style={{ margin: '12px 0 4px', fontSize: 14, fontWeight: 600, color: 'var(--apagado)' }}>
                  Resumen
                </h3>
                <dl className="dl">
                  <div><dt>Socio</dt><dd>{cobro.socio}</dd></div>
                  <div><dt>Plan</dt><dd>{cobro.plan}</dd></div>
                  <div><dt>Monto</dt><dd>{bs(cobro.monto)}</dd></div>
                  <div><dt>N.º de operación</dt><dd>{cobro.op}</dd></div>
                </dl>
              </section>

              <div style={{ textAlign: 'center', marginTop: 4 }}>
                <a className="btn btn--enlace" href="#/formulario">Volver al formulario</a>
              </div>
            </>
          )}
        </main>
      </div>
      <a className="enlace-panel" href="#/cobros">
        Ir al panel de recepción (vista del gimnasio)
      </a>
    </div>
  );
}
