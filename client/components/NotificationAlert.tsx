import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  onClose: (id: string) => void;
}

const NotificationAlert = ({ id, type, title, message, onClose }: NotificationProps) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <Bell className="w-5 h-5 text-amber-400" />,
  };

  const borders = {
    success: 'border-emerald-500/20',
    error: 'border-red-500/20',
    info: 'border-blue-500/20',
    warning: 'border-amber-500/20',
  };

  const backgrounds = {
    success: 'bg-emerald-500/5',
    error: 'bg-red-500/5',
    info: 'bg-blue-500/5',
    warning: 'bg-amber-500/5',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden w-full max-w-[400px] pointer-events-auto",
        "bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl",
        "px-4 py-3 group mb-3"
      )}
    >
      {/* Dynamic Background Glow */}
      <div className={cn(
        "absolute inset-0 opacity-20 blur-xl -z-10",
        backgrounds[type]
      )} />
      
      {/* Decorative colored bar */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1",
        type === 'success' && 'bg-emerald-500',
        type === 'error' && 'bg-red-500',
        type === 'info' && 'bg-blue-500',
        type === 'warning' && 'bg-amber-500'
      )} />

      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {icons[type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">
            {title}
          </h4>
          {message && (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        <button
          onClick={() => onClose(id)}
          className="ml-2 text-slate-500 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress animation (Optional) */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        onAnimationComplete={() => onClose(id)}
        className={cn(
          "absolute bottom-0 left-0 h-[2px] opacity-30",
          type === 'success' && 'bg-emerald-500',
          type === 'error' && 'bg-red-500',
          type === 'info' && 'bg-blue-500',
          type === 'warning' && 'bg-amber-500'
        )}
      />
    </motion.div>
  );
};

export default NotificationAlert;
