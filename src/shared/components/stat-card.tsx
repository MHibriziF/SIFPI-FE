'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface StatCardProps {
  /** Icon displayed in the card */
  icon: LucideIcon;
  /** Title label (e.g. "Draft Proyek") */
  title: string;
  /** Numeric value displayed (e.g. count) */
  value: number | string;
  /** Subtitle below the title */
  subtitle?: string;
  /** Whether this card is currently active/selected */
  isActive?: boolean;
  /** Color variant */
  variant?: 'draft' | 'info' | 'success' | 'warning' | 'danger';
  /** Click handler */
  onClick?: () => void;
  className?: string;
}

const VARIANT_MAP: Record<
  string,
  { border: string; bg: string; iconBg: string; iconColor: string }
> = {
  draft: {
    border: 'border-draft',
    bg: 'bg-draft-light',
    iconBg: 'bg-draft-light',
    iconColor: 'text-draft',
  },
  info: {
    border: 'border-info',
    bg: 'bg-info-light',
    iconBg: 'bg-info-light',
    iconColor: 'text-info',
  },
  success: {
    border: 'border-success',
    bg: 'bg-success-light',
    iconBg: 'bg-success-light',
    iconColor: 'text-success',
  },
  warning: {
    border: 'border-warning',
    bg: 'bg-warning-light',
    iconBg: 'bg-warning-light',
    iconColor: 'text-warning',
  },
  danger: {
    border: 'border-danger',
    bg: 'bg-danger-light',
    iconBg: 'bg-danger-light',
    iconColor: 'text-danger',
  },
};

export function StatCard({
  icon: Icon,
  title,
  value,
  subtitle = 'Number',
  isActive = false,
  variant = 'draft',
  onClick,
  className,
}: StatCardProps) {
  const colors = VARIANT_MAP[variant] || VARIANT_MAP.draft;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border-2 text-left transition-all w-full',
        isActive ? `${colors.border} ${colors.bg}` : `border-gray-200 bg-white hover:${colors.border}`,
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={cn(
            'size-10 rounded-lg flex items-center justify-center',
            colors.iconBg
          )}
        >
          <Icon className={cn('size-5', colors.iconColor)} />
        </div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </button>
  );
}

export default StatCard;
