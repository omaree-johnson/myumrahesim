'use client';

import { cn } from '@/lib/utils';

interface UsageMeterProps {
  usage: number;
  limit: number;
  className?: string;
  title?: string;
  description?: string;
  variant?: 'linear' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  progressColor?: 'default' | 'usage';
}

export function UsageMeter({
  usage,
  limit,
  className,
  title,
  description,
  variant = 'circle',
  size = 'md',
  progressColor = 'default'
}: UsageMeterProps) {
  const percentage = Math.min((usage / limit) * 100, 100);
  
  // Size configurations
  const sizeConfig = {
    sm: { circle: 80, stroke: 6, text: 'text-lg' },
    md: { circle: 120, stroke: 8, text: 'text-2xl' },
    lg: { circle: 160, stroke: 10, text: 'text-3xl' }
  };

  const config = sizeConfig[size];
  const radius = (config.circle - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on usage percentage
  const getColor = () => {
    if (progressColor === 'usage') {
      if (percentage >= 90) return 'text-red-500 dark:text-red-400';
      if (percentage >= 75) return 'text-yellow-500 dark:text-yellow-400';
      return 'text-green-500 dark:text-green-400';
    }
    return 'text-sky-500 dark:text-sky-400';
  };

  const getStrokeColor = () => {
    if (progressColor === 'usage') {
      if (percentage >= 90) return 'stroke-red-500 dark:stroke-red-400';
      if (percentage >= 75) return 'stroke-yellow-500 dark:stroke-yellow-400';
      return 'stroke-green-500 dark:stroke-green-400';
    }
    return 'stroke-sky-500 dark:stroke-sky-400';
  };

  if (variant === 'circle') {
    return (
      <div className={cn('flex flex-col items-center', className)}>
        <div className="relative" style={{ width: config.circle, height: config.circle }}>
          <svg
            className="transform -rotate-90"
            width={config.circle}
            height={config.circle}
          >
            {/* Background circle */}
            <circle
              cx={config.circle / 2}
              cy={config.circle / 2}
              r={radius}
              className="stroke-gray-200 dark:stroke-slate-700"
              strokeWidth={config.stroke}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx={config.circle / 2}
              cy={config.circle / 2}
              r={radius}
              className={cn('transition-all duration-500 ease-out', getStrokeColor())}
              strokeWidth={config.stroke}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-bold', config.text, getColor())}>
              {percentage.toFixed(0)}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {usage}/{limit}
            </span>
          </div>
        </div>
        {(title || description) && (
          <div className="mt-3 text-center">
            {title && (
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {title}
              </h4>
            )}
            {description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Linear variant
  return (
    <div className={cn('w-full', className)}>
      {(title || description) && (
        <div className="mb-2">
          {title && (
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="relative h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            progressColor === 'usage'
              ? percentage >= 90
                ? 'bg-red-500 dark:bg-red-400'
                : percentage >= 75
                ? 'bg-yellow-500 dark:bg-yellow-400'
                : 'bg-green-500 dark:bg-green-400'
              : 'bg-sky-500 dark:bg-sky-400'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>{usage} used</span>
        <span>{limit} total</span>
      </div>
    </div>
  );
}
