'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface PaginationProps {
  /** 0-based current page index */
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  className = '',
}: Readonly<PaginationProps>) {
  const start = totalElements === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className={`flex items-center justify-between text-sm text-gray-500 ${className}`}>
      <span>
        {totalElements === 0
          ? 'Tidak ada data'
          : `Showing ${start}-${end} of ${totalElements} entries`}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant={page === i ? 'filled' : 'ghost'}
            size="icon-sm"
            onClick={() => onPageChange(i)}
            className="text-xs"
          >
            {i + 1}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
