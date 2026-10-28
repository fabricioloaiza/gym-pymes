import { PRECIOS } from '../config';
import type { Cobro, EntradaBitacora, Membresia, Objetivo, Plan } from '../types';
import { hoy, sumarDias, sumarMeses } from '../lib/utils';

/*
 * Datos SIMULADOS y anonimizados para el piloto (30 cobros de octubre 2026, 120 socios activos).
 * Los socios se identifican solo con un código; no hay nombres, teléfonos ni datos de cuentas.
 */

type FilaSemilla = [
  fecha: string,
  socio: string,
  plan: Plan,
  op: string,
  estado: Cobro['estado'],
  validadoPor: string | null,
  edad: number,
  objetivo: Objetivo,
  motivo?: string,
];

const M = 'Recepción, turno mañana';
const T = 'Recepción, turno tarde';

const FILAS: FilaSemilla[] = [
  // Antes de la semana revisada
  ['2026-10-09', '090', 'Mensual', '0048101245', 'Aprobado', M, 24, 'Ganar masa muscular'],
  ['2026-10-10', '094', 'Mensual', '0048108830', 'Aprobado', T, 37, 'Salud general'],
  ['2026-10-13', '099', 'Mensual', '0048125517', 'Aprobado', M, 29, 'Bajar de peso'],
  ['2026-10-14', '102', 'Mensual', '0048131062', 'Aprobado', T, 45, 'Salud general'],
  // Semana 15/10 – 21/10
  ['2026-10-15', '005', 'Mensual', '0048140218', 'Aprobado', M, 31, 'Bajar de peso'],
  ['2026-10-15', '012', 'Mensual', '0048141903', 'Aprobado', M, 22, 'Ganar masa muscular'],
  ['2026-10-15', '019', 'Trimestral', '0048143377', 'Aprobado', T, 27, 'Rendimiento'],
  ['2026-10-15', '024', 'Mensual', '0048144620', 'Aprobado', T, 52, 'Salud general'],
  ['2026-10-16', '031', 'Mensual', '0048150184', 'Aprobado', M, 19, 'Ganar masa muscular'],
  ['2026-10-16', '036', 'Mensual', '0048152709', 'Aprobado', M, 34, 'Bajar de peso'],
  ['2026-10-16', '040', 'Mensual', '0048155341', 'Aprobado', T, 41, 'Salud general'],
  ['2026-10-17', '046', 'Mensual', '0048160926', 'Aprobado', M, 26, 'Rendimiento'],
  ['2026-10-17', '048', 'Trimestral', '0048162258', 'Aprobado', T, 38, 'Bajar de peso'],
  ['2026-10-17', '053', 'Mensual', '0048164473', 'Aprobado', T, 23, 'Ganar masa muscular'],
  ['2026-10-18', '017', 'Mensual', '0048179918', 'Aprobado', M, 30, 'Salud general'],
  ['2026-10-18', '058', 'Mensual', '0048171035', 'Aprobado', M, 47, 'Salud general'],
  ['2026-10-18', '064', 'Mensual', '0048173890', 'Aprobado', T, 21, 'Ganar masa muscular'],
  ['2026-10-19', '009', 'Mensual', '0048187731', 'Rechazado', T, 33, 'Bajar de peso', 'Monto no acreditado en la app del banco'],
  ['2026-10-19', '062', 'Mensual', '0048186502', 'Aprobado', M, 28, 'Rendimiento'],
  ['2026-10-19', '070', 'Mensual', '0048184116', 'Aprobado', M, 35, 'Bajar de peso'],
  ['2026-10-19', '073', 'Mensual', '0048185624', 'Aprobado', T, 44, 'Salud general'],
  ['2026-10-20', '051', 'Mensual', '0048199120', 'Aprobado', M, 25, 'Ganar masa muscular'],
  ['2026-10-20', '038', 'Trimestral', '0048198004', 'Aprobado', T, 39, 'Salud general'],
  ['2026-10-20', '022', 'Mensual', '0048196457', 'Aprobado', M, 32, 'Bajar de peso'],
  ['2026-10-20', '077', 'Mensual', '0048200583', 'Aprobado', T, 20, 'Rendimiento'],
  ['2026-10-20', '081', 'Mensual', '0048202931', 'Aprobado', T, 56, 'Salud general'],
  ['2026-10-21', '085', 'Mensual', '0048209376', 'Aprobado', M, 27, 'Ganar masa muscular'],
  // Pendientes de verificación
  ['2026-10-21', '014', 'Mensual', '0048213907', 'Pendiente', null, 28, 'Ganar masa muscular'],
  ['2026-10-21', '027', 'Trimestral', '0048214455', 'Pendiente', null, 36, 'Bajar de peso'],
  ['2026-10-21', '003', 'Mensual', '0048213907', 'Pendiente', null, 42, 'Salud general'],
];

export function cobrosSemilla(): Cobro[] {
  return FILAS.map(([fecha, cod, plan, op, estado, validadoPor, edad, objetivo, motivo], i) => ({
    id: `c${String(i + 1).padStart(3, '0')}`,
    fecha,
    socio: `Socio ${cod}`,
    edad,
    objetivo,
    plan,
    monto: PRECIOS[plan],
    op,
    captura: `REF-${fecha.slice(5, 7)}${fecha.slice(8, 10)}-${cod}`,
    estado,
    validadoPor,
    motivoRechazo: motivo ?? null,
  }));
}

/**
 * 120 socios activos. Casi todos están al día; cinco se fijan para que haya
 * vencidos y vencimientos próximos, igual que en el diseño.
 */
export function membresiasSemilla(): Membresia[] {
  const h = hoy();
  const fijos: Record<string, Membresia> = {
    '044': { socio: 'Socio 044', plan: 'Mensual', inicio: sumarMeses(sumarDias(h, -6), -1) },
    '029': { socio: 'Socio 029', plan: 'Mensual', inicio: sumarMeses(sumarDias(h, -3), -1) },
    '011': { socio: 'Socio 011', plan: 'Trimestral', inicio: sumarMeses(sumarDias(h, 2), -3) },
    '056': { socio: 'Socio 056', plan: 'Mensual', inicio: sumarMeses(sumarDias(h, 4), -1) },
    '033': { socio: 'Socio 033', plan: 'Mensual', inicio: sumarMeses(sumarDias(h, 7), -1) },
  };
  // Los socios con un cobro aprobado renovaron en la fecha de ese cobro.
  const renovados = new Map<string, Membresia>();
  for (const c of cobrosSemilla()) {
    if (c.estado === 'Aprobado') renovados.set(c.socio, { socio: c.socio, plan: c.plan, inicio: c.fecha });
  }
  const lista: Membresia[] = [];
  for (let n = 1; n <= 120; n++) {
    const cod = String(n).padStart(3, '0');
    const socio = `Socio ${cod}`;
    if (fijos[cod]) lista.push(fijos[cod]);
    else if (renovados.has(socio)) lista.push(renovados.get(socio)!);
    else if (n % 5 === 0) lista.push({ socio, plan: 'Trimestral', inicio: sumarDias(h, -((n * 11) % 80)) });
    else lista.push({ socio, plan: 'Mensual', inicio: sumarDias(h, -((n * 7) % 22)) });
  }
  return lista;
}

export function bitacoraSemilla(): EntradaBitacora[] {
  return [
    {
      id: 'b001',
      fecha: '2026-10-17',
      titulo: 'Registros con datos incompletos (2)',
      detalle: 'Corregidos por recepción',
      estado: 'Corregido',
    },
  ];
}
