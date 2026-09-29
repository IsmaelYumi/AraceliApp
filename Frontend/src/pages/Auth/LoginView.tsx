import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import type { UserRoleType } from '../../components/layout/Navbar';

export interface LoginViewProps {
  onLoginSuccess: (role: UserRoleType) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { success } = useNotification();

  const handleLogin = (e?: React.FormEvent, forcedRole?: UserRoleType) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    const role = forcedRole || (email.includes('admin') ? 'ADMINISTRADOR' : 'TERAPEUTA');

    setTimeout(() => {
      setIsLoading(false);
      success('Sesión Iniciada', `Bienvenido al Centro de Estimulación Temprana (${role}).`);
      onLoginSuccess(role);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6 text-on-surface select-none">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Brand / Header matching main_html.html */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[28px]">spa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2 tracking-tight">
            Centro de Estimulación Temprana
          </h1>
          <p className="text-sm text-on-surface-variant">
            Gestión terapéutica y cuidado infantil
          </p>
        </div>

        {/* Login Glass Card from main_html.html */}
        <div className="glass-card rounded-xl p-8 flex flex-col gap-4 w-full border border-surface-container-highest shadow-sm">
          <form onSubmit={(e) => handleLogin(e)} className="flex flex-col gap-4">
            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="ejemplo@serenity.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="soft-input w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container text-sm text-on-surface placeholder:text-outline-variant focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="soft-input w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container text-sm text-on-surface placeholder:text-outline-variant focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs font-medium text-primary hover:text-on-primary-container transition-colors underline-offset-2 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 bg-primary-container text-on-primary-container font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex justify-center items-center gap-2 text-sm cursor-pointer"
            >
              <span>{isLoading ? 'Verificando...' : 'Iniciar Sesión'}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-4 pt-4 border-t border-surface-variant">
            <p className="text-center text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2.5">
              Acceso Rápido de Prueba
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLogin(undefined, 'TERAPEUTA')}
                className="py-2 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs text-primary font-semibold transition-colors text-center cursor-pointer"
              >
                Como Terapeuta
              </button>
              <button
                type="button"
                onClick={() => handleLogin(undefined, 'ADMINISTRADOR')}
                className="py-2 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs text-secondary font-semibold transition-colors text-center cursor-pointer"
              >
                Como Administrador
              </button>
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-xs text-on-surface-variant">
              ¿Eres nuevo terapeuta?{' '}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="font-medium text-primary hover:text-on-primary-container transition-colors underline-offset-2 hover:underline ml-1"
              >
                Solicitar acceso
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
