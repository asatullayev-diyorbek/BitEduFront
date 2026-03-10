import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const icons = {
    success: <FiCheckCircle className="text-green-500" size={20} />,
    error: <FiAlertCircle className="text-red-500" size={20} />,
    info: <FiInfo className="text-blue-500" size={20} />,
    warning: <FiAlertTriangle className="text-amber-500" size={20} />,
};

const colors = {
    success: 'border-l-green-500 bg-green-50',
    error: 'border-l-red-500 bg-red-50',
    info: 'border-l-blue-500 bg-blue-50',
    warning: 'border-l-amber-500 bg-amber-50',
};

export default function ToastContainer() {
    const { toasts, removeToast } = useUIStore();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-lg animate-slide-up ${colors[toast.type]}`}
                >
                    <span className="shrink-0 mt-0.5">{icons[toast.type]}</span>
                    <p className="text-sm text-slate-700 flex-1">{toast.message}</p>
                    <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 ml-1">
                        <FiX size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}
