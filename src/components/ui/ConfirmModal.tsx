import React, { useEffect } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}

export default function ConfirmModal({
    isOpen, title, message, confirmLabel = "Tasdiqlash", cancelLabel = "Bekor qilish",
    onConfirm, onCancel, danger = false
}: ConfirmModalProps) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
                <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <FiX size={20} />
                </button>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <FiAlertTriangle size={24} className={danger ? 'text-red-500' : 'text-amber-500'} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-600 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 btn-secondary">{cancelLabel}</button>
                    <button onClick={onConfirm} className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}
