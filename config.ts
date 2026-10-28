import type { Plan } from './types';

/**
 * Fecha de referencia del piloto ("hoy").
 * Está fija en 21/10/2026 para que los datos simulados sean coherentes con el diseño.
 * Pon `null` para usar la fecha real del dispositivo.
 */
export const FECHA_REFERENCIA: string | null = '2026-10-21';

/** Tarifas en bolivianos (supuestos del diagnóstico). */
export const PRECIOS: Record<Plan, number> = {
  Mensual: 150,
  Trimestral: 400,
};

/** Meses que cubre cada plan (para calcular el vencimiento). */
export const MESES_PLAN: Record<Plan, number> = {
  Mensual: 1,
  Trimestral: 3,
};

/** Días de anticipación para listar "vencen pronto". */
export const DIAS_AVISO = 7;

/** Tamaño de la muestra de control semanal del propietario. */
export const TAMANO_MUESTRA = 5;

/** Personas que pueden validar un cobro. */
export const VALIDADORES = ['Recepción, turno mañana', 'Recepción, turno tarde', 'Propietario'];

/** Plantilla del recordatorio por WhatsApp. Se edita antes de enviar. */
export const ENLACE_FORMULARIO = '[enlace al formulario]';
