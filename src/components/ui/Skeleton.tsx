interface SkeletonCardProps {
    count?: number;
}

function SkeletonItem() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-card">
            <div className="skeleton-shimmer h-44 rounded-none" />
            <div className="p-5 space-y-3">
                <div className="skeleton-shimmer h-5 rounded-lg w-3/4" />
                <div className="skeleton-shimmer h-4 rounded-lg w-full" />
                <div className="skeleton-shimmer h-4 rounded-lg w-2/3" />
                <div className="flex gap-2 pt-1">
                    <div className="skeleton-shimmer h-6 rounded-full w-16" />
                    <div className="skeleton-shimmer h-6 rounded-full w-20" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonCard({ count = 6 }: SkeletonCardProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: count }).map((_, i) => <SkeletonItem key={i} />)}
        </div>
    );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="skeleton-shimmer h-12 w-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="skeleton-shimmer h-4 rounded w-3/4" />
                        <div className="skeleton-shimmer h-3 rounded w-1/2" />
                    </div>
                    <div className="skeleton-shimmer h-8 w-20 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonStat() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-card space-y-3">
                    <div className="skeleton-shimmer h-10 w-10 rounded-xl" />
                    <div className="skeleton-shimmer h-7 w-20 rounded" />
                    <div className="skeleton-shimmer h-4 w-24 rounded" />
                </div>
            ))}
        </div>
    );
}
