import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, { badge: string; dot: string }> = {
  success: {
    badge: 'bg-mint-50 text-mint-700 font-medium',
    dot: 'bg-mint-500',
  },
  warning: {
    badge: 'bg-amber-50 text-amber-700 font-medium',
    dot: 'bg-amber-500',
  },
  danger: {
    badge: 'bg-rose-50 text-rose-700 font-medium',
    dot: 'bg-rose-500',
  },
  info: {
    badge: 'bg-serenity-50 text-serenity-700 font-medium',
    dot: 'bg-serenity-500',
  },
  neutral: {
    badge: 'bg-slate-100 text-slate-600 font-medium',
    dot: 'bg-slate-400',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const styles = variantClasses[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none ${styles.badge} ${sizeClass} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      {children}
    </span>
  );
};

export default Badge;
