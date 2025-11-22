import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from './Icons';

interface ToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ show, message, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation to finish before unmounting logic
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !visible) return null;

  return (
    <div 
      className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
        visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
      }`}
    >
      <CheckCircleIcon className="w-5 h-5 text-emerald-400 dark:text-emerald-500" />
      <span className="text-xs font-bold uppercase tracking-widest">{message}</span>
    </div>
  );
};