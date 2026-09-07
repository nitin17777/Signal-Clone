'use client';
import React from 'react';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const styles = {
    info: 'bg-bg-panel border-neutral-700 text-text-primary',
    success: 'bg-bg-panel border-online-green text-online-green',
    error: 'bg-bg-panel border-red-500 text-red-400',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-panel border shadow-lg text-sm ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-xs ml-2">
          ✕
        </button>
      )}
    </div>
  );
};
