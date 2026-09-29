import React from 'react';
import { Menu } from 'lucide-react';

export type UserRoleType = 'TERAPEUTA' | 'ADMINISTRADOR';

export interface NavbarProps {
  onMenuToggle?: () => void;
  currentUser?: { nombre: string; email: string; rol?: string };
  currentRole: UserRoleType;
  onRoleChange: (role: UserRoleType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuToggle,
  currentRole,
  onRoleChange,
}) => {
  return (
    <header className="sticky top-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 flex items-center justify-between px-6 sm:px-8 border-b border-surface-container select-none">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          aria-label="Abrir menú"
          className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px] text-primary">clinical_notes</span>
          <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant hidden sm:inline">
            Clínica Serenity - Atención Temprana
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role toggle badge pill */}
        <div className="flex items-center bg-surface-container p-1 rounded-xl text-xs">
          <button
            onClick={() => onRoleChange('TERAPEUTA')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              currentRole === 'TERAPEUTA'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Terapeuta
          </button>
          <button
            onClick={() => onRoleChange('ADMINISTRADOR')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              currentRole === 'ADMINISTRADOR'
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Administrador
          </button>
        </div>

        <button
          aria-label="Ayuda"
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </button>

        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
