import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import type { UserRoleType } from '../../components/layout/Navbar';

export interface LoginViewProps {
  onLoginSuccess: (role: UserRoleType) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { success, error: notifyError } = useNotification();
  const { login: authLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authLogin({ email, password });
      setIsLoading(false);

      // Verificación estricta de la respuesta enviada por el backend
      const serverRole = response.user.rol;
      const isAdmin = serverRole === 'ADMIN';
      const appRole: UserRoleType = isAdmin ? 'ADMINISTRADOR' : 'TERAPEUTA';

      success(
        '¡Bienvenido!',
        `Sesión iniciada como ${response.user.nombre} (${isAdmin ? 'Administrador' : 'Terapeuta'}).`,
      );

      // Redirigir según si es terapeuta o admin
      onLoginSuccess(appRole);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg =
        err instanceof Error
          ? err.message
          : 'Credenciales inválidas. Por favor verifica tu correo y contraseña.';
      notifyError('Error de Autenticación', msg);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 sm:p-6 text-on-surface select-none">
      <div className="w-full max-w-md transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Brand / Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-3 shadow-sm">
            <span className="material-symbols-outlined text-[28px]">spa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1 tracking-tight">
            Centro de Estimulación Temprana
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Plataforma integral de gestión terapéutica y cuidado infantil
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col gap-5 w-full border border-surface-container-highest shadow-sm bg-surface-container-lowest/90 backdrop-blur-md">
          {/* Card Header */}
          <div className="flex flex-col gap-1 pb-1 border-b border-surface-container">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">login</span>
              Iniciar Sesión
            </h2>
            <p className="text-xs text-on-surface-variant">
              Ingresa tus credenciales profesionales para acceder
            </p>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={(e) => handleLogin(e)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
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
                  placeholder="ejemplo@estimulaciontemprana.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="soft-input w-full pl-10 pr-4 py-3 rounded-xl border border-surface-container text-sm text-on-surface placeholder:text-outline-variant focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="soft-input w-full pl-10 pr-10 py-3 rounded-xl border border-surface-container text-sm text-on-surface placeholder:text-outline-variant focus:border-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs font-medium text-primary hover:text-on-primary-container transition-colors underline-offset-2 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 bg-primary text-white font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex justify-center items-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Verificando...' : 'Iniciar Sesión'}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>

            {/* Restricted Access Badge / Notice */}
            <div className="p-3 bg-surface-container-low/70 border border-surface-container rounded-xl flex items-center gap-2.5 text-[11px] text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                admin_panel_settings
              </span>
              <span>
                Acceso restringido. Las cuentas y permisos son gestionados exclusivamente por la administración del centro.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
