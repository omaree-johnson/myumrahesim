export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-sky-200 dark:border-sky-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-sky-600 dark:border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Loading...
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait a moment
          </p>
        </div>
      </div>
    </div>
  );
}
