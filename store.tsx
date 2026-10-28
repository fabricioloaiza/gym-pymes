import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { Cobro, EntradaBitacora, Membresia } from './types';
import { bitacoraSemilla, cobrosSemilla, membresiasSemilla } from './data/seed';

/*
 * Estado de la app: equivale a la hoja de cálculo del flujo TO BE.
 * Se guarda en el navegador (localStorage) para que la demo conserve los cambios.
 * En producción, esta capa se reemplazaría por Google Sheets o una base de datos.
 */

export interface Datos {
  cobros: Cobro[];
  membresias: Membresia[];
  bitacora: EntradaBitacora[];
}

type Accion =
  | { tipo: 'agregarCobro'; cobro: Cobro }
  | { tipo: 'aprobar'; id: string; validadoPor: string }
  | { tipo: 'rechazar'; id: string; validadoPor: string; motivo: string }
  | { tipo: 'reiniciar' };

const CLAVE = 'gymxxx-demo-v1';

function datosIniciales(): Datos {
  return { cobros: cobrosSemilla(), membresias: membresiasSemilla(), bitacora: bitacoraSemilla() };
}

function cargar(): Datos {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) {
      const d = JSON.parse(raw) as Datos;
      if (Array.isArray(d.cobros) && Array.isArray(d.membresias) && Array.isArray(d.bitacora)) return d;
    }
  } catch {
    /* sin almacenamiento disponible: se usan los datos simulados */
  }
  return datosIniciales();
}

function reducir(d: Datos, a: Accion): Datos {
  switch (a.tipo) {
    case 'agregarCobro':
      return { ...d, cobros: [a.cobro, ...d.cobros] };
    case 'aprobar': {
      const cobro = d.cobros.find((c) => c.id === a.id);
      if (!cobro || cobro.estado !== 'Pendiente') return d;
      const nueva: Membresia = { socio: cobro.socio, plan: cobro.plan, inicio: cobro.fecha };
      const existe = d.membresias.some((m) => m.socio === cobro.socio);
      return {
        ...d,
        cobros: d.cobros.map((c) => (c.id === a.id ? { ...c, estado: 'Aprobado', validadoPor: a.validadoPor } : c)),
        membresias: existe
          ? d.membresias.map((m) => (m.socio === cobro.socio ? nueva : m))
          : [...d.membresias, nueva],
      };
    }
    case 'rechazar':
      return {
        ...d,
        cobros: d.cobros.map((c) =>
          c.id === a.id && c.estado === 'Pendiente'
            ? { ...c, estado: 'Rechazado', validadoPor: a.validadoPor, motivoRechazo: a.motivo }
            : c,
        ),
      };
    case 'reiniciar':
      return datosIniciales();
  }
}

const Ctx = createContext<{ datos: Datos; despachar: React.Dispatch<Accion> } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [datos, despachar] = useReducer(reducir, undefined, cargar);
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos));
    } catch {
      /* ignorar */
    }
  }, [datos]);
  return <Ctx.Provider value={{ datos, despachar }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore debe usarse dentro de StoreProvider');
  return v;
}
