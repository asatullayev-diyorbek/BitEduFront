import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface UIState {
    sidebarOpen: boolean;
    toasts: Toast[];
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    toasts: [],

    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

    addToast: (message, type = 'info') => {
        const id = Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000);
    },

    removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
