export type Plan = 'Mensual' | 'Trimestral';
export type Estado = 'Pendiente' | 'Aprobado' | 'Rechazado';
export type Objetivo = 'Bajar de peso' | 'Ganar masa muscular' | 'Salud general' | 'Rendimiento';

/** Un cobro recibido por QR Simple (una fila de la hoja de cálculo del flujo TO BE). */
export interface Cobro {
  id: string;
  /** Fecha del cobro, formato ISO AAAA-MM-DD */
  fecha: string;
  socio: string;
  edad: number | null;
  objetivo: Objetivo | null;
  plan: Plan;
  monto: number;
  /** N.º de operación del QR: debe ser único */
  op: string;
  /** Referencia de la captura enviada por WhatsApp */
  captura: string;
  estado: Estado;
  validadoPor: string | null;
  motivoRechazo: string | null;
}

/** Membresía vigente de un socio. El vencimiento se calcula por fórmula a partir del inicio y el plan. */
export interface Membresia {
  socio: string;
  plan: Plan;
  /** Fecha de inicio ISO AAAA-MM-DD */
  inicio: string;
}

/** Entrada manual de la bitácora de excepciones (errores corregidos, ajustes). */
export interface EntradaBitacora {
  id: string;
  fecha: string;
  titulo: string;
  detalle: string;
  estado: 'Pendiente' | 'Rechazado' | 'Corregido';
}
