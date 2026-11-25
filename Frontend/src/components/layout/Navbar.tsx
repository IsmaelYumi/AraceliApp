import React from 'react';
import { Menu } from 'lucide-react';
import { Avatar } from '../common/Avatar';

export type UserRoleType = 'TERAPEUTA' | 'ADMINISTRADOR';

export interface NavbarProps {
  onMenuToggle?: () => void;
  currentUser?: { nombre: string; email: string; rol?: string; avatarUrl?: string };
  currentRole: UserRoleType;
  onRoleChange?: (role: UserRoleType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuToggle,
  currentUser,
  currentRole,
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
            Centro de Estimulación Temprana
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role indicator badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-xs font-semibold text-primary">
          <span className="material-symbols-outlined text-[16px]">
            {currentRole === 'ADMINISTRADOR' ? 'admin_panel_settings' : 'medical_services'}
          </span>
          <span>{currentRole === 'ADMINISTRADOR' ? 'Administrador' : 'Terapeuta'}</span>
        </div>

        <button
          aria-label="Ayuda"
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </button>

        <Avatar
          src={currentUser?.avatarUrl}
          alt={currentUser?.nombre || 'Usuario'}
          size="xs"
          rounded="full"
          className="w-8 h-8 rounded-full border border-surface-container shadow-sm"
        />
      </div>
    </header>
  );
};

export default Navbar;
