import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-6 md:px-8 border-t border-slate-100 bg-white/70 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-700">Centro de Estimulación Temprana</span>
        <span>•</span>
        <span>Serenity Childcare v1.0</span>
      </div>
      <div>
        <span>Plataforma Web de Gestión Clínica y Terapéutica</span>
      </div>
    </footer>
  );
};

export default Footer;
