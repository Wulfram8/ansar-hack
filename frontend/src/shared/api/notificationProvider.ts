import type { NotificationProvider } from "@refinedev/core";
import { toastStore, type ToastType } from "@/shared/ui";

const typeMap: Record<string, ToastType> = {
  success: "success",
  error: "error",
  progress: "progress",
};

/** Мост refine notificationProvider → внутренний toast-стор. */
export const notificationProvider: NotificationProvider = {
  open: ({ key, message, description, type }) => {
    toastStore.push({
      id: key,
      message,
      description,
      type: typeMap[type] ?? "default",
    });
  },
  close: (key) => toastStore.dismiss(key),
};
