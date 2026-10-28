import { useEffect } from 'react';
import { useRuta } from './router';
import Formulario from './pages/Formulario';
import Confirmacion from './pages/Confirmacion';
import Panel from './pages/Panel';
import Verificacion from './pages/Verificacion';
import Vencimientos from './pages/Vencimientos';
import Revision from './pages/Revision';

const TITULOS: Record<string, string> = {
  formulario: 'Formulario del socio',
  confirmacion: 'Confirmación',
  cobros: 'Cobros',
  verificar: 'Verificación de un pago',
  vencimientos: 'Vencimientos',
  revision: 'Revisión semanal',
};

export default function App() {
  const [seccion = 'cobros', id] = useRuta();

  useEffect(() => {
    document.title = `${TITULOS[seccion] ?? 'Cobros'} · GymXXX`;
  }, [seccion]);

  switch (seccion) {
    case 'formulario':
      return <Formulario />;
    case 'confirmacion':
      return <Confirmacion id={id} />;
    case 'verificar':
      return <Verificacion key={id} id={id} />;
    case 'vencimientos':
      return <Vencimientos />;
    case 'revision':
      return <Revision />;
    default:
      return <Panel />;
  }
}
