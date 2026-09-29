import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'border-brand-500 border-t-transparent',
}) => {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${color} ${className}`}
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

export default Spinner;
