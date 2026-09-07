'use client';
import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-panel bg-bg-panel p-panel-padding shadow-xl border border-neutral-800">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          {title && <h2 className="text-base font-semibold text-text-primary">{title}</h2>}
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-lg ml-auto leading-none">✕</button>
        </div>
        <div className="pt-3 text-text-primary">{children}</div>
      </div>
    </div>
  );
};
