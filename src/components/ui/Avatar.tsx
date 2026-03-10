interface AvatarProps {
    src?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
};

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className={`${sizes[size]} rounded-xl overflow-hidden flex items-center justify-center font-bold shrink-0 ${className}`}>
            {src ? (
                <img src={src} alt={name} className="w-full h-full object-cover" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                }} />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-700 text-white flex items-center justify-center">
                    {initials}
                </div>
            )}
        </div>
    );
}
