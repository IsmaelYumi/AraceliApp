import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const styles: Record<
  AlertType,
  { container: string; icon: string; iconComponent: React.ComponentType<{ className?: string }> }
> = {
  info: {
    container: 'bg-serenity-50/80 text-serenity-900 border-none',
    icon: 'text-serenity-600',
    iconComponent: Info,
  },
  success: {
    container: 'bg-mint-50/80 text-mint-900 border-none',
    icon: 'text-mint-600',
    iconComponent: CheckCircle2,
  },
  warning: {
    container: 'bg-amber-50/80 text-amber-900 border-none',
    icon: 'text-amber-600',
    iconComponent: AlertTriangle,
  },
  error: {
    container: 'bg-rose-50/80 text-rose-900 border-none',
    icon: 'text-rose-600',
    iconComponent: AlertCircle,
  },
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const current = styles[type];
  const Icon = current.iconComponent;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-2xl text-sm shadow-soft-sm ${current.container} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${current.icon}`} />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1 text-slate-800">{title}</h4>}
        <div className="text-xs sm:text-sm leading-relaxed text-slate-600">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Cerrar alerta"
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
