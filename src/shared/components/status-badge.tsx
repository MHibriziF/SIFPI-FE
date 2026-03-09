'use client';

import React from 'react';
import { Circle } from 'lucide-react';

type Variant = 
  | 'draft' 
  | 'submitted' 
  | 'in-review' 
  | 'approved' 
  | 'rejected'
  | 'DRAFT'
  | 'DIAJUKAN'
  | 'IN_REVIEW'
  | 'PERBAIKAN_DATA'
  | 'TERVERIFIKASI'
  | 'TERPUBLIKASI';

interface StatusBadgeProps {
  variant: Variant;
  children?: React.ReactNode;
  className?: string;
}

const VARIANT_MAP: Record<Variant, { lightBg: string; color: string; defaultLabel?: string }> = {
  draft: { lightBg: 'bg-draft-light', color: 'text-draft', defaultLabel: 'Draft' },
  submitted: { lightBg: 'bg-info-light', color: 'text-info', defaultLabel: 'Submitted' },
  'in-review': { lightBg: 'bg-warning-light', color: 'text-warning', defaultLabel: 'In Review' },
  approved: { lightBg: 'bg-success-light', color: 'text-success', defaultLabel: 'Approved' },
  rejected: { lightBg: 'bg-danger-light', color: 'text-danger', defaultLabel: 'Rejected' },
  // Backend status mapping
  DRAFT: { lightBg: 'bg-draft-light', color: 'text-draft', defaultLabel: 'Draft Proyek' },
  DIAJUKAN: { lightBg: 'bg-info-light', color: 'text-info', defaultLabel: 'Sedang Direview' },
  IN_REVIEW: { lightBg: 'bg-warning-light', color: 'text-warning', defaultLabel: 'Sedang Direview' },
  PERBAIKAN_DATA: { lightBg: 'bg-yellow-100', color: 'text-yellow-700', defaultLabel: 'Butuh Revisi' },
  TERVERIFIKASI: { lightBg: 'bg-success-light', color: 'text-success', defaultLabel: 'Telah Disetujui' },
  TERPUBLIKASI: { lightBg: 'bg-success-light', color: 'text-success', defaultLabel: 'Telah Disetujui' },
};

export function StatusBadge({ variant, children, className = '' }: StatusBadgeProps) {
  const classes = VARIANT_MAP[variant] || VARIANT_MAP.draft;

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
