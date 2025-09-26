import React, { useEffect, useState } from 'react';
import { toast, Toast as ToastType } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastItem: React.FC<{ toast: ToastType; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`w-full max-w-sm ${getBackgroundColor()} shadow-lg`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(toast.id)}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const topToasts = toasts.filter(t => t.position === 'top');
  const bottomToasts = toasts.filter(t => t.position === 'bottom');

  return (
    <>
      {/* Top toasts */}
      {topToasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {topToasts.map(toastItem => (
            <ToastItem
              key={toastItem.id}
              toast={toastItem}
              onRemove={(id) => toast.removeToast(id)}
            />
          ))}
        </div>
      )}

      {/* Bottom toasts */}
      {bottomToasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {bottomToasts.map(toastItem => (
            <ToastItem
              key={toastItem.id}
              toast={toastItem}
              onRemove={(id) => toast.removeToast(id)}
            />
          ))}
        </div>
      )}
    </>
  );
};
