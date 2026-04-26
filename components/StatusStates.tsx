import React from 'react';
import { Loader2, PackageOpen, AlertCircle } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading data...' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export const EmptyState: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <PackageOpen className="w-14 h-14 text-gray-200 mb-4" />
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    {subtitle && <p className="text-sm text-gray-400 mt-1 max-w-md">{subtitle}</p>}
  </div>
);

export const ErrorBanner: React.FC<{ message: string; onDismiss?: () => void }> = ({
  message,
  onDismiss,
}) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm text-red-700">{message}</p>
    </div>
    {onDismiss && (
      <button onClick={onDismiss} className="text-red-400 hover:text-red-600 text-xs font-medium">
        Dismiss
      </button>
    )}
  </div>
);
