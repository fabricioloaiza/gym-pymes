import { FECHA_REFERENCIA, MESES_PLAN } from '../config';
import type { Cobro, Membresia, Plan } from '../types';

// ---------- Fechas (todas en ISO AAAA-MM-DD, sin zona horaria) ----------

function aPartes(iso: string): [number, number, number] {
  const [a, m, d] = iso.split('-').map(Number);
  return [a, m, d];
}

function aIso(a: number, m: number, d: number): string {
  return `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function diasDelMes(a: number, m: number): number {
  return new Date(Date.UTC(a, m, 0)).getUTCDate();
}

export function hoy(): string {
  if (FECHA_REFERENCIA) return FECHA_REFERENCIA;
  const d = new Date();
  return aIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/** Igual que FECHA.MES (EDATE) en Excel/Sheets: suma meses y ajusta al último día si hace falta. */
export function sumarMeses(iso: string, meses: number): string {
  const [a, m, d] = aPartes(iso);
  const total = a * 12 + (m - 1) + meses;
  const na = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return aIso(na, nm, Math.min(d, diasDelMes(na, nm)));
}

export function sumarDias(iso: string, dias: number): string {
  const [a, m, d] = aPartes(iso);
  const f = new Date(Date.UTC(a, m - 1, d + dias));
  return aIso(f.getUTCFullYear(), f.getUTCMonth() + 1, f.getUTCDate());
}

/** Días de b menos a. */
export function diferenciaDias(a: string, b: string): number {
  const [a1, m1, d1] = aPartes(a);
  const [a2, m2, d2] = aPartes(b);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000);
}

export function fechaLarga(iso: string): string {
  const [a, m, d] = aPartes(iso);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${a}`;
}

export function fechaCorta(iso: string): string {
  return fechaLarga(iso).slice(0, 5);
}

export function vencimiento(inicio: string, plan: Plan): string {
  return sumarMeses(inicio, MESES_PLAN[plan]);
}

export function vencimientoDe(m: Membresia): string {
  return vencimiento(m.inicio, m.plan);
}

// ---------- Formato ----------

/** 14700 -> "Bs 14.700" (separador de miles con punto, como en Bolivia). */
export function bs(n: number): string {
  const entero = Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Bs ${entero}`;
}

/** "14", "socio 14", "Socio 014" -> "Socio 014". Si no hay dígitos, devuelve el texto tal cual. */
export function normalizarSocio(texto: string): string {
  const t = texto.trim();
  const dig = t.match(/\d+/);
  if (!dig) return t;
  return `Socio ${dig[0].padStart(3, '0')}`;
}

export function codigoCorto(socio: string): string {
  const dig = socio.match(/\d+/);
  return dig ? dig[0] : socio;
}

// ---------- Controles ----------

/** Otros cobros con el mismo N.º de operación (control de duplicados). */
export function duplicados(c: Cobro, cobros: Cobro[]): Cobro[] {
  return cobros.filter((o) => o.id !== c.id && o.op === c.op);
}

export function nuevoId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Descarga un CSV (separador ";" para que Excel en español lo abra en columnas). */
export function descargarCsv(nombre: string, filas: (string | number)[][]): void {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const texto = '﻿' + filas.map((f) => f.map(esc).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
