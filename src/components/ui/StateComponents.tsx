interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">{title}</h3>
            {description && <p className="text-slate-500 text-sm max-w-xs mb-6">{description}</p>}
            {action}
        </div>
    );
}

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({ message = "Xatolik yuz berdi", onRetry }: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Xatolik!</h3>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="btn-primary">Qayta urinish</button>
            )}
        </div>
    );
}
