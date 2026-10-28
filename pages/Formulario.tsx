import React, { useState } from 'react';
import { PRECIOS } from '../config';
import { ir } from '../router';
import { useStore } from '../store';
import type { Cobro, Objetivo, Plan } from '../types';
import { bs, codigoCorto, hoy, normalizarSocio, nuevoId } from '../lib/utils';
import { IconoInfo, MovilCabecera } from '../components/Comunes';

const OBJETIVOS: Objetivo[] = ['Bajar de peso', 'Ganar masa muscular', 'Salud general', 'Rendimiento'];

export default function Formulario() {
  const { despachar } = useStore();
  const [codigo, setCodigo] = useState('');
  const [edad, setEdad] = useState('');
  const [objetivo, setObjetivo] = useState<Objetivo>('Bajar de peso');
  const [plan, setPlan] = useState<Plan>('Mensual');
  const [op, setOp] = useState('');
  const [consent, setConsent] = useState(false);
  const [intentado, setIntentado] = useState(false);

  const edadNum = Number(edad);
  const errores = {
    codigo: !/\d/.test(codigo) ? 'Escribe tu código de socio (por ejemplo, Socio 014).' : '',
    edad: edad === '' || !Number.isInteger(edadNum) || edadNum < 14 || edadNum > 99 ? 'Escribe una edad entre 14 y 99.' : '',
    op: !/^\d{6,}$/.test(op.trim()) ? 'Copia el N.º de operación del comprobante (solo números).' : '',
  };
  const valido = !errores.codigo && !errores.edad && !errores.op;

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    setIntentado(true);
    if (!valido || !consent) return;
    const fecha = hoy();
    const socio = normalizarSocio(codigo);
    const cobro: Cobro = {
      id: nuevoId('c'),
      fecha,
      socio,
      edad: edadNum,
      objetivo,
      plan,
      monto: PRECIOS[plan],
      op: op.trim(),
      captura: `REF-${fecha.slice(5, 7)}${fecha.slice(8, 10)}-${codigoCorto(socio)}`,
      estado: 'Pendiente',
      validadoPor: null,
      motivoRechazo: null,
    };
    despachar({ tipo: 'agregarCobro', cobro });
    ir(`/confirmacion/${cobro.id}`);
  };

  const err = (k: keyof typeof errores) => (intentado && errores[k] ? errores[k] : '');

  return (
    <div className="movil-fondo">
      <div className="movil">
        <MovilCabecera />
        <form className="movil-cuerpo" onSubmit={enviar} noValidate>
          <div className="tarjeta formulario">
            <div className="campo">
              <label htmlFor="codigo">Código de socio</label>
              <input id="codigo" type="text" placeholder="Ej. Socio 014" value={codigo} onChange={(e) => setCodigo(e.target.value)} aria-invalid={!!err('codigo')} aria-describedby="codigo-err" />
              {err('codigo') && <span id="codigo-err" className="error-campo">{err('codigo')}</span>}
            </div>

            <div className="campo">
              <label htmlFor="edad">Edad</label>
              <input id="edad" type="number" min={14} max={99} placeholder="Ej. 28" value={edad} onChange={(e) => setEdad(e.target.value)} aria-invalid={!!err('edad')} aria-describedby="edad-err" />
              {err('edad') && <span id="edad-err" className="error-campo">{err('edad')}</span>}
            </div>

            <div className="campo">
              <label htmlFor="objetivo">Objetivo</label>
              <select id="objetivo" value={objetivo} onChange={(e) => setObjetivo(e.target.value as Objetivo)}>
                {OBJETIVOS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <span className="etq" id="plan-label">Plan</span>
              <div role="group" aria-labelledby="plan-label" className="planes">
                {(['Mensual', 'Trimestral'] as Plan[]).map((p) => (
                  <button key={p} type="button" className="plan-btn" aria-pressed={plan === p} onClick={() => setPlan(p)}>
                    <strong>{p}</strong>
                    <span>{bs(PRECIOS[p])}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="campo">
              <label htmlFor="monto">Monto pagado</label>
              <input id="monto" type="text" readOnly value={bs(PRECIOS[plan])} />
              <span className="ayuda">Se completa según el plan elegido.</span>
            </div>

            <div className="campo">
              <label htmlFor="operacion">
                N.º de operación del QR <span className="obligatorio">(obligatorio)</span>
              </label>
              <input id="operacion" type="text" inputMode="numeric" placeholder="Ej. 0048213907" value={op} onChange={(e) => setOp(e.target.value)} aria-invalid={!!err('op')} aria-describedby="op-ayuda" />
              {err('op') ? (
                <span id="op-ayuda" className="error-campo">{err('op')}</span>
              ) : (
                <span id="op-ayuda" className="ayuda">Cada número de operación se acepta una sola vez.</span>
              )}
            </div>
          </div>

          <div role="note" className="info">
            <IconoInfo />
            <span>Envía también la captura del pago al WhatsApp del gimnasio.</span>
          </div>

          <label className="check consentimiento">
            <input type="checkbox" checked={consent} onChange={() => setConsent(!consent)} />
            <span>Acepto que GymXXX use estos datos solo para gestionar mi membresía.</span>
          </label>

          <div>
            <button type="submit" className="btn btn--primario btn--bloque" disabled={!consent}>
              Enviar
            </button>
            {!consent && (
              <p className="ayuda" style={{ marginTop: 8, textAlign: 'center' }}>
                Marca la casilla de consentimiento para enviar.
              </p>
            )}
          </div>
        </form>
      </div>
      <a className="enlace-panel" href="#/cobros">
        Ir al panel de recepción (vista del gimnasio)
      </a>
    </div>
  );
}
