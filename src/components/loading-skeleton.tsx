/**
 * Reusable Loading Skeletons
 * 
 * Provides consistent loading states for lazy-loaded components
 * to improve perceived performance and reduce layout shift.
 */

export function PlansLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-6"></div>
          <div className="space-y-2 mb-6">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
          </div>
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function ComparisonTableLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-slate-700">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-full mr-3"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrustBadgesLoadingSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-8 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="h-16 w-16 bg-gray-200 dark:bg-slate-700 rounded-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
}

export function GenericLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[200px] animate-pulse">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-sky-200 dark:border-sky-800 border-t-sky-600 dark:border-t-sky-400 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32 mx-auto"></div>
      </div>
    </div>
  );
}
