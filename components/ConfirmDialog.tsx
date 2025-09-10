import React, { useEffect, useRef } from 'react';
import { WarningIcon } from './Icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      dialogRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const confirmButtonClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 p-6 border border-slate-700 animate-[fadeInUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <WarningIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-semibold leading-6 text-white" id="dialog-title">
                    {title}
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-slate-400">
                        {message}
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-colors sm:w-auto ${confirmButtonClasses[confirmVariant]}`}
          >
            {confirmText}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 inline-flex w-full justify-center rounded-md bg-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 transition-colors sm:mt-0 sm:w-auto"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
