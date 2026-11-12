"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastInput = { message: string; action?: { label: string; href: string } };
type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

// Confirmations discrètes, annoncées aux lecteurs d'écran (aria-live)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((toast: ToastInput) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-2), { ...toast, id }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 2800);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-4 bg-fg px-4 py-3 text-sm text-bg shadow-[0_20px_40px_-20px_rgb(23_23_23/0.5)]"
            >
              <span>{toast.message}</span>
              {toast.action && (
                <Link href={toast.action.href} className="font-medium text-accent underline-offset-4 hover:underline">
                  {toast.action.label}
                </Link>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
