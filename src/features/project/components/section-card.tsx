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
        'overflow-hidden rounded-lg border border-primary/10 bg-white shadow-sm',
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
    <header className="relative bg-primary px-6 py-3.5 text-white">
      <div className="text-center">
        <h2 className="text-base font-bold leading-tight">{title}</h2>
        {description ? <p className="mt-1 text-xs text-white/80">{description}</p> : null}
      </div>
      {action ? (
        <div className="absolute right-6 top-1/2 -translate-y-1/2">{action}</div>
      ) : null}
    </header>
  );
}

interface SectionCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

function Body({ children, className }: SectionCardBodyProps) {
  return <div className={cn('border-t border-primary/10 bg-white px-6 py-5', className)}>{children}</div>;
}

export const SectionCard = Object.assign(Root, {
  Header,
  Body,
});
