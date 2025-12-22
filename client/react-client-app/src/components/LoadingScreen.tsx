export function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-base-100 z-50">
            <div className="flex flex-col items-center gap-4">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <p className="text-xl font-medium animate-pulse">Loading...</p>
            </div>
        </div>
    );
}
