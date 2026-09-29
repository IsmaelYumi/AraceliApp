import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'mint' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-serenity-600 hover:bg-serenity-500 text-white shadow-soft-sm hover:shadow-soft-md active:scale-[0.98] border-none',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-[0.98] border-none',
  mint:
    'bg-mint-600 hover:bg-mint-500 text-white shadow-soft-sm hover:shadow-soft-md active:scale-[0.98] border-none',
  outline:
    'bg-white hover:bg-serenity-50/60 text-slate-700 border border-slate-200/80 shadow-soft-sm active:scale-[0.98]',
  danger:
    'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-none',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-xl gap-1.5',
  md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-2xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-serenity-400/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer font-sans';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" color="border-current border-t-transparent" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
