import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type ToastType = "success" | "error" | "progress" | "default";

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type?: ToastType;
}

type Listener = (toasts: ToastItem[]) => void;

/**
 * Минимальный toast-стор без внешних зависимостей.
 * Используется напрямую и как мост для refine notificationProvider.
 */
class ToastStore {
  private toasts: ToastItem[] = [];
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((l) => l([...this.toasts]));
  }

  push(toast: Omit<ToastItem, "id"> & { id?: string }) {
    const id = toast.id ?? Math.random().toString(36).slice(2);
    this.toasts = [...this.toasts.filter((t) => t.id !== id), { ...toast, id }];
    this.emit();
    if (toast.type !== "progress") {
      setTimeout(() => this.dismiss(id), 4000);
    }
    return id;
  }

  dismiss(id?: string) {
    this.toasts = id ? this.toasts.filter((t) => t.id !== id) : [];
    this.emit();
  }
}

export const toastStore = new ToastStore();

const typeStyles: Record<ToastType, string> = {
  success: "border-emerald-500/40 bg-emerald-50 text-emerald-900",
  error: "border-destructive/40 bg-red-50 text-red-900",
  progress: "border-blue-500/40 bg-blue-50 text-blue-900",
  default: "border-border bg-card text-card-foreground",
};

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  React.useEffect(() => {
    const unsubscribe = toastStore.subscribe(setToasts);
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-2 rounded-md border p-3 shadow-md",
            typeStyles[toast.type ?? "default"],
          )}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
            {toast.description && (
              <p className="mt-0.5 text-xs opacity-80">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => toastStore.dismiss(toast.id)}
            className="opacity-60 transition hover:opacity-100"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
