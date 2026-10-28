import { useState } from 'react';
import { DIAS_AVISO, ENLACE_FORMULARIO, PRECIOS } from '../config';
import { useStore } from '../store';
import type { Membresia } from '../types';
import { bs, diferenciaDias, fechaLarga, hoy, vencimientoDe } from '../lib/utils';
import { Pagina } from '../components/Comunes';

interface Fila {
  m: Membresia;
  venc: string;
  dias: number; // días desde hoy hasta el vencimiento (negativo = vencido)
}

function mensajeBase(f: Fila): string {
  const verbo = f.dias < 0 ? 'venció' : 'vence';
  return `Hola, tu membresía ${f.m.plan.toLowerCase()} de GymXXX ${verbo} el ${fechaLarga(f.venc)}. Puedes renovar pagando ${bs(PRECIOS[f.m.plan])} por QR y llenando el formulario: ${ENLACE_FORMULARIO}. ¡Te esperamos!`;
}

function textoPlazo(f: Fila): string {
  if (f.dias < 0) return `Venció el ${fechaLarga(f.venc)} · hace ${-f.dias} ${-f.dias === 1 ? 'día' : 'días'}`;
  if (f.dias === 0) return `Vence hoy, ${fechaLarga(f.venc)}`;
  return `Vence el ${fechaLarga(f.venc)} · faltan ${f.dias} ${f.dias === 1 ? 'día' : 'días'}`;
}

function Item({ f, abierto, alternar }: { f: Fila; abierto: boolean; alternar: () => void }) {
  const [msg, setMsg] = useState(() => mensajeBase(f));
  const [abiertoWa, setAbiertoWa] = useState(false);
  const idTexto = `msg-${f.m.socio.replace(/\D/g, '')}`;
  return (
    <div className="tarjeta item-venc">
      <div>
        <div style={{ fontWeight: 600 }}>{f.m.socio} · {f.m.plan}</div>
        <div className="texto-apagado" style={{ marginTop: 2 }}>{textoPlazo(f)}</div>
      </div>
      <button type="button" className="btn btn--secundario" aria-expanded={abierto} onClick={alternar}>
        Preparar recordatorio
      </button>
      {abierto && (
        <div className="detalle">
          <div className="campo">
            <label htmlFor={idTexto}>Mensaje (editable)</label>
            <textarea id={idTexto} rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} />
          </div>
          <div className="fila-acciones">
            <a
              className="btn btn--primario"
              href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setAbiertoWa(true)}
            >
              Abrir en WhatsApp
            </a>
            {abiertoWa && (
              <p role="status" className="estado-ok">
                Mensaje abierto en WhatsApp. La recepcionista lo revisa y lo envía manualmente.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Vencimientos() {
  const { datos } = useStore();
  const [abierto, setAbierto] = useState<string | null>(null);
  const h = hoy();

  const filas: Fila[] = datos.membresias
    .map((m) => {
      const venc = vencimientoDe(m);
      return { m, venc, dias: diferenciaDias(h, venc) };
    })
    .sort((a, b) => a.dias - b.dias);

  const vencidos = filas.filter((f) => f.dias < 0);
  const proximos = filas.filter((f) => f.dias >= 0 && f.dias <= DIAS_AVISO);
  const alDia = filas.length - vencidos.length - proximos.length;

  const lista = (fs: Fila[]) =>
    fs.map((f) => (
      <Item
        key={`${f.m.socio}-${f.venc}`}
        f={f}
        abierto={abierto === f.m.socio}
        alternar={() => setAbierto(abierto === f.m.socio ? null : f.m.socio)}
      />
    ));

  return (
    <Pagina seccion="vencimientos" rol="Recepción">
      <div>
        <h1 className="h1">Vencimientos y recordatorios</h1>
        <p className="sub">Hoy, {fechaLarga(h)}</p>
      </div>

      <section className="seccion" aria-labelledby="venc-h">
        <h2 id="venc-h" className="h2">
          Vencidos <span className="badge badge--Rechazado">{vencidos.length}</span>
        </h2>
        {vencidos.length ? lista(vencidos) : <p className="texto-apagado">No hay membresías vencidas.</p>}
      </section>

      <section className="seccion" aria-labelledby="prox-h">
        <h2 id="prox-h" className="h2">
          Vencen en los próximos {DIAS_AVISO} días <span className="badge badge--Pendiente">{proximos.length}</span>
        </h2>
        {proximos.length ? lista(proximos) : <p className="texto-apagado">Nadie vence en los próximos días.</p>}
      </section>

      <section className="tarjeta al-dia" aria-labelledby="dia-h">
        <h2 id="dia-h" className="h2">Al día</h2>
        <span className="cifra">{alDia}</span>
        <span className="texto-apagado" style={{ fontSize: 15 }}>socios</span>
      </section>

      <p className="texto-apagado">
        Nada se envía de forma automática. Cada recordatorio lo revisa y envía la recepcionista desde WhatsApp.
      </p>
    </Pagina>
  );
}
