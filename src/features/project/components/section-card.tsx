import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface SectionCardRootProps {
  children: React.ReactNode;
  className?: string;
}

function Root({ children, className }: SectionCardRootProps) {
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

interface SectionCardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function Header({ title, description, action }: SectionCardHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3 bg-primary px-6 py-3.5 text-white">
      <div>
        <h2 className="text-base font-bold leading-tight">{title}</h2>
        {description ? <p className="mt-1 text-xs text-white/80">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

interface SectionCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

function Body({ children, className }: SectionCardBodyProps) {
  return <div className={cn('border-t border-gray-200 bg-white px-6 py-6', className)}>{children}</div>;
}

export const SectionCard = Object.assign(Root, {
  Header,
  Body,
});
