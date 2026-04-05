export default function DashboardLoading() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6 animate-pulse">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="h-12 w-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                        <div className="h-4 w-60 bg-slate-100 dark:bg-slate-800/50 rounded-lg" />
                    </div>
                    <div className="h-16 w-48 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-slate-50 dark:bg-slate-900 border border-default rounded-3xl" />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 bg-slate-50 dark:bg-slate-900 border border-default rounded-2xl" />
                            ))}
                        </div>
                    </div>
                    <div className="h-[400px] bg-slate-50 dark:bg-slate-900 border border-default rounded-3xl" />
                </div>
            </div>
        </div>
    );
}
