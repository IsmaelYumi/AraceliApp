import React, { useState } from 'react';
import { Navbar, type UserRoleType } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export interface MainLayoutProps {
  children: React.ReactNode;
  activeNavId: string;
  onNavigate: (id: string) => void;
  currentUser?: { nombre: string; email: string; rol?: string };
  currentRole: UserRoleType;
  onRoleChange: (role: UserRoleType) => void;
  onLogout?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeNavId,
  onNavigate,
  currentUser,
  currentRole,
  onRoleChange,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Sidebar navigation */}
      <Sidebar
        activeId={activeNavId}
        onSelect={onNavigate}
        currentRole={currentRole}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Navbar
          onMenuToggle={() => setIsMobileMenuOpen(true)}
          currentUser={currentUser}
          currentRole={currentRole}
          onRoleChange={onRoleChange}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
