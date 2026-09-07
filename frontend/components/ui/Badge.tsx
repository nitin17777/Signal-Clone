import React from 'react';

export interface BadgeProps {
  count?: number;
  variant?: 'unread' | 'neutral' | 'success';
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ count, variant = 'unread', className = '', children }) => {
  const variants = {
    unread: 'bg-unread-badge text-white font-bold',
    neutral: 'bg-bg-panel text-text-secondary border border-neutral-700',
    success: 'bg-online-green text-black font-semibold',
  };
  const content = children !== undefined ? children : count !== undefined ? (count > 99 ? '99+' : count) : null;
  if (!content) return null;

  return (
    <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs rounded-full ${variants[variant]} ${className}`}>
      {content}
    </span>
  );
};
