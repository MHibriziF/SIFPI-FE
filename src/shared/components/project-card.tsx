import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, MapPin, DollarSign, ImageIcon } from 'lucide-react';
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
  locationImageUrl?: string;
}

interface ProjectCardProps {
  project: ProjectCardData;
  viewDetailHref?: string;
  className?: string;
}

export function ProjectCard({ project, viewDetailHref, className }: ProjectCardProps) {
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
          <Image
            src={project.locationImageUrl!}
            alt={project.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="size-16 text-gray-300" />
          </div>
        )}
        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3">
          <StatusBadge variant={project.status} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-4">
          {project.name}
        </h3>

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
    </div>
  );
}
