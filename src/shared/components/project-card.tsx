import React from 'react';
import Link from 'next/link';
import { Building2, MapPin, Landmark, ImageIcon, CalendarDays, Layers } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { StatusBadge } from '@/shared/components/status-badge';
import { cn } from '@/shared/lib/utils';
import { ProjectStatus, SECTOR_LABELS, type Sector } from '@/shared/enums';

export interface ProjectCardData {
  id: number;
  name: string;
  sector: string;
  status: ProjectStatus;
  location?: string;
  description?: string;
  isSubmitted?: boolean;
  createdAt?: string;
  ownerName?: string;
  ownerInstitution?: string;
  locationImageUrl?: string;
}

interface ProjectCardProps {
  project: ProjectCardData;
  viewDetailHref?: string;
  className?: string;
  hideStatusBadge?: boolean;
  showSubmittedDate?: boolean;
}

export function ProjectCard({ project, viewDetailHref, className, hideStatusBadge, showSubmittedDate }: ProjectCardProps) {
  const detailLink = viewDetailHref || `/project-owner/projects/${project.id}`;
  
  // Check if image URL is valid (not null, not empty, not starting with "null/")
  const hasValidImage = project.locationImageUrl && 
                        project.locationImageUrl.trim() !== '' && 
                        !project.locationImageUrl.startsWith('null/');

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden', className)}>
      {/* Location Image */}
      <div className="relative w-full h-48 bg-gray-100">
        {hasValidImage ? (
          <img
            src={project.locationImageUrl!}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="size-16 text-gray-300" />
          </div>
        )}
        {/* Status Badge Overlay */}
        {!hideStatusBadge && (
          <div className="absolute top-3 right-3">
            <StatusBadge variant={project.status} />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-4">
          {project.name}
        </h3>

        {/* Metadata */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          {project.sector && (
            <div className="flex items-start gap-2">
              <Layers className="size-4 shrink-0 mt-0.5" />
              <span>{SECTOR_LABELS[project.sector as Sector] ?? project.sector}</span>
            </div>
          )}
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
          {project.ownerInstitution && (
            <div className="flex items-start gap-2">
              <Landmark className="size-4 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{project.ownerInstitution}</span>
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

        {/* Submitted date — small footer text */}
        {showSubmittedDate && project.createdAt && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
            <CalendarDays className="size-3.5" />
            Dibuat pada {new Date(project.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
}
