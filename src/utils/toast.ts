// Simple toast notification system
// You can replace this with a proper toast library like sonner or react-hot-toast

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
  position: 'top' | 'bottom';
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Array<(toasts: Toast[]) => void> = [];

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private addToast(message: string, type: Toast['type'], options: ToastOptions = {}) {
    const toast: Toast = {
      id: this.generateId(),
      message,
      type,
      duration: options.duration || 5000,
      position: options.position || 'top'
    };

    this.toasts.push(toast);
    this.notify();

    // Auto remove after duration
    setTimeout(() => {
      this.removeToast(toast.id);
    }, toast.duration);

    return toast.id;
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  success(message: string, options?: ToastOptions) {
    return this.addToast(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    return this.addToast(message, 'error', options);
  }

  info(message: string, options?: ToastOptions) {
    return this.addToast(message, 'info', options);
  }

  warning(message: string, options?: ToastOptions) {
    return this.addToast(message, 'warning', options);
  }

  getToasts(): Toast[] {
    return [...this.toasts];
  }
}

export const toast = new ToastManager();
export type { Toast, ToastOptions };
