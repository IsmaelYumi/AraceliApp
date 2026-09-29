import React from 'react';
import { Home } from 'lucide-react';
import { Button } from '../../components/common/Button';

export interface NotFoundPageProps {
  onGoHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <span className="text-6xl font-black text-brand-500 tracking-wider mb-2">404</span>
      <h2 className="text-xl font-bold text-slate-100">Página no encontrada</h2>
      <p className="text-sm text-slate-400 mt-2 max-w-md">
        La ruta a la que intentas acceder no existe o fue trasladada a otra ubicación.
      </p>
      <div className="mt-6">
        <Button variant="primary" onClick={onGoHome} leftIcon={<Home className="w-4 h-4" />}>
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
