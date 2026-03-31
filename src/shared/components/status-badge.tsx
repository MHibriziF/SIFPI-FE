'use client';

import React from 'react';
import { Circle } from 'lucide-react';
import { ProjectStatus, PROJECT_STATUS_LABELS } from '@/shared/enums/project-status';

// Legacy frontend-only variants kept for backward compat (design-system page etc.)
type LegacyVariant = 'draft' | 'submitted' | 'in-review' | 'approved' | 'rejected';
type Variant = LegacyVariant | ProjectStatus;

interface StatusBadgeProps {
  variant: Variant;
  children?: React.ReactNode;
  className?: string;
}

const VARIANT_MAP: Record<Variant, { lightBg: string; color: string; defaultLabel: string }> = {
  // ── Legacy variants (design-system only) ──────────────────────────────────
  draft:      { lightBg: 'bg-draft-light',   color: 'text-draft',    defaultLabel: 'Draft' },
  submitted:  { lightBg: 'bg-info-light',    color: 'text-info',     defaultLabel: 'Submitted' },
  'in-review':{ lightBg: 'bg-warning-light', color: 'text-warning',  defaultLabel: 'In Review' },
  approved:   { lightBg: 'bg-success-light', color: 'text-success',  defaultLabel: 'Approved' },
  rejected:   { lightBg: 'bg-danger-light',  color: 'text-danger',   defaultLabel: 'Rejected' },

  // ── Backend enum variants (canonical labels from PROJECT_STATUS_LABELS) ───
  [ProjectStatus.DRAFT]:          { lightBg: 'bg-draft-light',   color: 'text-draft',       defaultLabel: PROJECT_STATUS_LABELS[ProjectStatus.DRAFT] },
  [ProjectStatus.DIAJUKAN]:       { lightBg: 'bg-info-light',    color: 'text-info',        defaultLabel: PROJECT_STATUS_LABELS[ProjectStatus.DIAJUKAN] },
  [ProjectStatus.IN_REVIEW]:      { lightBg: 'bg-warning-light', color: 'text-warning',     defaultLabel: PROJECT_STATUS_LABELS[ProjectStatus.IN_REVIEW] },
  [ProjectStatus.PERBAIKAN_DATA]: { lightBg: 'bg-yellow-100',    color: 'text-yellow-700',  defaultLabel: PROJECT_STATUS_LABELS[ProjectStatus.PERBAIKAN_DATA] },
  [ProjectStatus.TERVERIFIKASI]:  { lightBg: 'bg-success-light', color: 'text-success',     defaultLabel: PROJECT_STATUS_LABELS[ProjectStatus.TERVERIFIKASI] },
  [ProjectStatus.TERPUBLIKASI]:   { lightBg: 'bg-success-light', color: 'text-success',     defaultLabel: PROJECT_STATUS_LABELS[ProjectStatus.TERPUBLIKASI] },
};

export function StatusBadge({ variant, children, className = '' }: Readonly<StatusBadgeProps>) {
  const classes = VARIANT_MAP[variant] ?? VARIANT_MAP.draft;

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${classes.lightBg} ${className}`.trim()}
    >
      <Circle className={`size-3 ${classes.color}`} strokeWidth={8} fill="currentColor" />
      <span className={`text-xs font-medium ${classes.color}`}>
        {children || classes.defaultLabel}
      </span>
    </span>
  );
}

export default StatusBadge;
