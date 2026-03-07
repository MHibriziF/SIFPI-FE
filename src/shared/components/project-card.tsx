import React from 'react';
import Link from 'next/link';
import { Building2, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { StatusBadge } from '@/shared/components/status-badge';
import { cn } from '@/shared/lib/utils';

export interface ProjectCardData {
  id: number;
  name: string;
  sector: string;
  status: 'DRAFT' | 'DIAJUKAN' | 'IN_REVIEW' | 'PERBAIKAN_DATA' | 'TERVERIFIKASI' | 'TERPUBLIKASI';
  location?: string;
  description?: string;
  isSubmitted?: boolean;
  createdAt?: string;
  ownerName?: string;
  budget?: string;
}

interface ProjectCardProps {
  project: ProjectCardData;
  viewDetailHref?: string;
  className?: string;
}

export function ProjectCard({ project, viewDetailHref, className }: ProjectCardProps) {
  const detailLink = viewDetailHref || `/project-owner/projects/${project.id}`;

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6', className)}>
      {/* Header: Title + Status Badge */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
          {project.name}
        </h3>
        <StatusBadge variant={project.status} />
      </div>

      {/* Metadata */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        {project.ownerName && (
          <div className="flex items-start gap-2">
            <Building2 className="size-4 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{project.ownerName}</span>
          </div>
        )}
        {project.location && (
          <div className="flex items-start gap-2">
            <MapPin className="size-4 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{project.location}</span>
          </div>
        )}
        {project.budget && (
          <div className="flex items-start gap-2">
            <DollarSign className="size-4 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{project.budget}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3">
          {project.description}
        </p>
      )}

      {/* View Detail Button */}
      <Button
        asChild
        variant="outlined"
        className="w-full border-primary text-primary hover:bg-primary/5"
      >
        <Link href={detailLink}>View Detail</Link>
      </Button>
    </div>
  );
}
