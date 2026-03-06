import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface SummaryCardRootProps {
  children: React.ReactNode;
  className?: string;
}

function Root({ children, className }: SummaryCardRootProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
        className
      )}
    >
      {children}
    </section>
  );
}

interface SummaryCardHeaderProps {
  title: string;
  onEdit?: () => void;
}

function Header({ title, onEdit }: SummaryCardHeaderProps) {
  return (
    <header className="flex items-center justify-between bg-primary px-6 py-3.5 text-white">
      <h3 className="text-base font-bold leading-tight">{title}</h3>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-white/90 underline-offset-2 hover:text-white hover:underline"
        >
          Edit
        </button>
      ) : null}
    </header>
  );
}

interface SummaryCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

function Body({ children, className }: SummaryCardBodyProps) {
  return <div className={cn('border-t border-gray-200 bg-white px-6 py-6', className)}>{children}</div>;
}

export const SummaryCard = Object.assign(Root, {
  Header,
  Body,
});
