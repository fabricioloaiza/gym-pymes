import React from 'react';
import { useStore } from '../store';

type Seccion = 'cobros' | 'vencimientos' | 'revision';

const ENLACES: { id: Seccion | 'formulario'; texto: string; ruta: string }[] = [
  { id: 'cobros', texto: 'Cobros', ruta: '#/cobros' },
  { id: 'vencimientos', texto: 'Vencimientos', ruta: '#/vencimientos' },
  { id: 'revision', texto: 'Revisión semanal', ruta: '#/revision' },
  { id: 'formulario', texto: 'Formulario del socio', ruta: '#/formulario' },
];

export function Pagina({ seccion, rol, children }: { seccion: Seccion; rol: string; children: React.ReactNode }) {
  const { despachar } = useStore();
  const reiniciar = () => {
    if (window.confirm('¿Restablecer los datos simulados? Se perderán los cambios hechos en esta demo.')) {
      despachar({ tipo: 'reiniciar' });
    }
  };
  return (
    <>
      <header className="topbar">
        <div className="marca">
          GymXXX <span>· {rol}</span>
        </div>
        <nav className="nav" aria-label="Principal">
          {ENLACES.map((e) => (
            <a key={e.id} href={e.ruta} aria-current={e.id === seccion ? 'page' : undefined}>
              {e.texto}
            </a>
          ))}
        </nav>
      </header>
      <main className="contenedor">
        {children}
        <div className="pie">
          <p className="nota-pie">Datos simulados para el piloto.</p>
          <button type="button" className="btn--enlace btn" style={{ fontSize: 13, minHeight: 32 }} onClick={reiniciar}>
            Restablecer datos de demostración
          </button>
        </div>
      </main>
    </>
  );
}

export function Insignia({ estado, grande }: { estado: string; grande?: boolean }) {
  return <span className={`badge badge--${estado}${grande ? ' badge--grande' : ''}`}>{estado}</span>;
}

export function MovilCabecera() {
  return (
    <header className="movil-cab">
      <h1>GymXXX · Renovación de membresía</h1>
    </header>
  );
}

export function IconoInfo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1F4E79" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="8" x2="12" y2="8.01" />
    </svg>
  );
}

export function IconoAlerta() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7F1D1D" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 3 22 20H2Z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </svg>
  );
}

export function IconoCheck() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1F4E79" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="5 12.5 10 17.5 19 7.5" />
    </svg>
  );
}
