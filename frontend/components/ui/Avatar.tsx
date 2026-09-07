import React from 'react';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src, alt = '', name = '', size = 'md', isOnline, className = ''
}) => {
  const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };
  const badgeMap = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3.5 h-3.5' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {src ? (
        <img src={src} alt={alt || name} className={`${sizeMap[size]} rounded-full object-cover bg-bg-panel`} />
      ) : (
        <div className={`${sizeMap[size]} rounded-full bg-bg-panel text-text-primary flex items-center justify-center font-semibold border border-neutral-700`}>
          {initials}
        </div>
      )}
      {isOnline && (
        <span className={`absolute bottom-0 right-0 ${badgeMap[size]} rounded-full bg-online-green ring-2 ring-bg-dark`} />
      )}
    </div>
  );
};
