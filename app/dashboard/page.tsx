'use client';
export default function DashboardRoot() {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <div className="flex flex-col items-center space-y-4">
                {/* A simple loading indicator using your law firm colors */}
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin"></div>
                <p className="text-blue-900 font-medium font-serif animate-pulse">
                    Routing to your workspace...
                </p>
            </div>
        </div>
    );
}