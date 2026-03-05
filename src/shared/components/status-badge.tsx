'use client';

import React from 'react';
import { Circle } from 'lucide-react';

type Variant = 'draft' | 'submitted' | 'in-review' | 'approved' | 'rejected';

interface StatusBadgeProps {
  variant: Variant;
  children?: React.ReactNode;
  className?: string;
}

const VARIANT_MAP: Record<Variant, { lightBg: string; color: string }> = {
  draft: { lightBg: 'bg-draft-light', color: 'text-draft' },
  submitted: { lightBg: 'bg-info-light', color: 'text-info' },
  'in-review': { lightBg: 'bg-warning-light', color: 'text-warning' },
  approved: { lightBg: 'bg-success-light', color: 'text-success' },
  rejected: { lightBg: 'bg-danger-light', color: 'text-danger' },
};

export function StatusBadge({ variant, children, className = '' }: StatusBadgeProps) {
  const classes = VARIANT_MAP[variant];

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-3 px-3 py-1 rounded-full ${classes.lightBg} ${className}`.trim()}
    >
      <Circle className={`size-4 ${classes.color}`} strokeWidth={4} />
      <span className={`text-sm font-medium ${classes.color}`}>{children}</span>
    </span>
  );
}

export default StatusBadge;
