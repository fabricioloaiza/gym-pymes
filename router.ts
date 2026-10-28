import { useEffect, useState } from 'react';

/** Enrutador mínimo por hash (#/cobros, #/verificar/c028…). Sin dependencias. */
export function useRuta(): string[] {
  const leer = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [ruta, setRuta] = useState<string[]>(leer);
  useEffect(() => {
    const f = () => {
      setRuta(leer());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return ruta;
}

export function ir(ruta: string): void {
  window.location.hash = ruta.startsWith('/') ? ruta : `/${ruta}`;
}
