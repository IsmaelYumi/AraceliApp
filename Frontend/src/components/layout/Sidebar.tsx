import React from 'react';
import { LogOut, X } from 'lucide-react';
import type { UserRoleType } from './Navbar';

export interface NavItem {
  id: string;
  label: string;
  iconName: string;
}

export interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
  currentRole: UserRoleType;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeId,
  onSelect,
  currentRole,
  isOpenMobile = false,
  onCloseMobile,
  onLogout,
}) => {
  const therapistItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', iconName: 'grid_view' },
    { id: 'pacientes', label: 'Pacientes', iconName: 'child_care' },
    { id: 'citas', label: 'Agendar Citas', iconName: 'calendar_today' },
    { id: 'configuracion', label: 'Configuración', iconName: 'settings' },
  ];

  const adminItems: NavItem[] = [
    { id: 'pacientes', label: 'Pacientes', iconName: 'child_care' },
    { id: 'terapeutas', label: 'Terapeutas', iconName: 'medical_services' },
    { id: 'citas', label: 'Agendar Citas', iconName: 'calendar_today' },
    { id: 'configuracion', label: 'Configuración', iconName: 'settings' },
  ];

  const currentNavItems = currentRole === 'TERAPEUTA' ? therapistItems : adminItems;

  const content = (
    <aside className="h-full w-72 bg-surface-container-lowest shadow-[0_4px_24px_rgba(28,100,142,0.04)] flex flex-col p-6 justify-between select-none">
      <div className="flex flex-col gap-8">
        {/* Logo / Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-on-primary-container text-[22px]">spa</span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant font-semibold block leading-tight">
                Centro de Estimulación
              </span>
              <span className="text-[11px] text-primary font-medium block">
                Childcare &amp; Therapy
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Specialist Profile Card from main_html.html */}
        <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(28,100,142,0.12)] text-on-primary font-bold text-base">
            <span className="material-symbols-outlined text-[24px]">person</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-on-surface truncate">
              {currentRole === 'TERAPEUTA' ? 'Dra. Sofía Mendoza' : 'Administración'}
            </div>
            <div className="text-xs text-secondary truncate font-medium">
              {currentRole === 'TERAPEUTA' ? 'Terapeuta Infantil' : 'Gestión y Registro'}
            </div>
          </div>
        </div>

        {/* Navigation items from main_html.html */}
        <nav className="flex flex-col gap-2">
          {currentNavItems.map((item) => {
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_2px_12px_rgba(124,185,232,0.2)]'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.iconName}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Info badge from main_html.html */}
      <div className="pt-4 border-t border-surface-container space-y-3">
        <div className="p-3 rounded-xl bg-tertiary-fixed/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-tertiary text-[20px]">psychology_alt</span>
          <div className="text-left">
            <p className="text-xs text-on-tertiary-fixed font-semibold">Centro de Estimulación</p>
            <p className="text-[11px] text-on-surface-variant">Nivel Clínico Integral</p>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-error hover:bg-error-container/40 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">{content}</div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
