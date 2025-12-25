'use client';

import React, { useEffect, useState, useCallback, memo } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastMessage, ToastType } from '@/context/ToastContext';

// ============================================
// Toast Config - Memoized Outside Component
// ============================================
const TOAST_DURATION = 5000;
const PROGRESS_INTERVAL = 50;

const getToastConfig = (type: ToastType) => {
  const configs = {
    success: {
      icon: CheckCircle,
      gradient: 'from-orange-500 to-red-500',
      bg: 'from-orange-50 to-red-50',
      border: 'border-orange-200',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-900',
      progressBg: 'bg-gradient-to-r from-orange-500 to-red-500',
      shadow: 'shadow-orange-200',
    },
    error: {
      icon: AlertCircle,
      gradient: 'from-red-500 to-rose-500',
      bg: 'from-red-50 to-rose-50',
      border: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      progressBg: 'bg-gradient-to-r from-red-500 to-rose-500',
      shadow: 'shadow-red-200',
    },
    warning: {
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900',
      progressBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      shadow: 'shadow-amber-200',
    },
    info: {
      icon: Info,
      gradient: 'from-sky-500 to-blue-500',
      bg: 'from-sky-50 to-blue-50',
      border: 'border-sky-200',
      iconColor: 'text-sky-600',
      textColor: 'text-sky-900',
      progressBg: 'bg-gradient-to-r from-sky-500 to-blue-500',
      shadow: 'shadow-sky-200',
    },
  };

  return configs[type] || configs.info;
};

// ============================================
// Toast Component - Memoized
// ============================================
interface ToastProps {
  toast: ToastMessage;
  removeToast: (id: number) => void;
}

const Toast = memo<ToastProps>(({ toast, removeToast }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  }, [toast.id, removeToast]);

  useEffect(() => {
    const decrement = (PROGRESS_INTERVAL / TOAST_DURATION) * 100;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        if (next <= 0) {
          clearInterval(progressInterval);
          handleRemove();
          return 0;
        }
        return next;
      });
    }, PROGRESS_INTERVAL);

    return () => clearInterval(progressInterval);
  }, [handleRemove]);

  const config = React.useMemo(() => getToastConfig(toast.type), [toast.type]);
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto bg-white rounded-xl sm:rounded-2xl shadow-xl ${config.shadow} border ${config.border} overflow-hidden min-w-[280px] sm:min-w-[320px] transform transition-all duration-300 ${isExiting
          ? 'opacity-0 translate-x-full scale-95'
          : 'opacity-100 translate-x-0 scale-100'
        }`}
      role="alert"
      aria-live="polite"
    >
      {/* Main Content */}
      <div className="flex items-start gap-3 p-3 sm:p-4 relative">
        {/* Icon with Gradient Background */}
        <div className="relative flex-shrink-0 mt-0.5">
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-xl blur-md opacity-30 animate-pulse`} />
          <div className={`relative p-2 sm:p-2.5 bg-gradient-to-br ${config.bg} rounded-xl border ${config.border}`}>
            <Icon size={18} className={config.iconColor} strokeWidth={2.5} />
          </div>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0 pt-1">
          <p className={`text-sm sm:text-base font-semibold ${config.textColor} leading-snug`}>
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200 active:scale-90"
          aria-label="Close notification"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-100 relative overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${config.progressBg} transition-all duration-100 ease-linear will-change-transform`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if toast id changes
  return prevProps.toast.id === nextProps.toast.id;
});

Toast.displayName = 'Toast';

// ============================================
// Toast Container Component
// ============================================
interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

const ToastContainer = memo<ToastContainerProps>(({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 sm:top-24 right-2 sm:right-4 z-[60] flex flex-col gap-2 sm:gap-3 pointer-events-none max-w-[calc(100vw-16px)] sm:max-w-md"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} removeToast={removeToast} />
      ))}

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if toasts array length or ids change
  if (prevProps.toasts.length !== nextProps.toasts.length) return false;

  return prevProps.toasts.every((toast, index) =>
    toast.id === nextProps.toasts[index]?.id
  );
});

ToastContainer.displayName = 'ToastContainer';

export default ToastContainer;
