import React, { useState } from 'react';

/**
 * Avatar en blanco neutro SVG (Data URL) de alta calidad.
 * Se muestra cuando el usuario o terapeuta no tiene foto de perfil cargada.
 */
export const DEFAULT_BLANK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23f1f5f9"/><circle cx="64" cy="46" r="22" fill="%23cbd5e1"/><path d="M26 112c0-20.987 17.013-38 38-38s38 17.013 38 38" fill="%23cbd5e1"/></svg>';

export interface AvatarProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  rounded?: 'full' | 'xl' | '2xl';
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20 sm:w-24 sm:h-24',
  custom: '',
};

const ROUNDED_CLASSES = {
  full: 'rounded-full',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  rounded = '2xl',
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  // Si no hay src o si falló la carga de la imagen (error 404/red), usar el avatar en blanco
  const imageSrc = !src || !src.trim() || hasError ? DEFAULT_BLANK_AVATAR : src;

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={() => setHasError(true)}
      className={`${SIZE_CLASSES[size]} ${ROUNDED_CLASSES[rounded]} object-cover border border-slate-200/80 shadow-soft-sm bg-slate-100 shrink-0 ${className}`}
      {...props}
    />
  );
};

export default Avatar;
