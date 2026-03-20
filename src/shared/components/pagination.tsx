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

function getPageNumbers(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | '...')[] = [];

  // Always show first page
  pages.push(0);

  if (page <= 3) {
    // Near start: show 1 2 3 4 5 ... last
    pages.push(1, 2, 3, 4, '...', totalPages - 1);
  } else if (page >= totalPages - 4) {
    // Near end: show first ... last-4 last-3 last-2 last-1 last
    pages.push('...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
  } else {
    // Middle: show first ... page-1 page page+1 ... last
    pages.push('...', page - 1, page, page + 1, '...', totalPages - 1);
  }

  return pages;
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
  const pageNumbers = getPageNumbers(page, totalPages);

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
        {pageNumbers.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 select-none">…</span>
          ) : (
            <Button
              key={p}
              variant={page === p ? 'filled' : 'ghost'}
              size="icon-sm"
              onClick={() => onPageChange(p)}
              className="text-xs"
            >
              {p + 1}
            </Button>
          )
        )}
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
