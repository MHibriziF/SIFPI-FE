'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProjectDetailView } from '@/features/project/components/project-detail-view';
import { AdminProjectDetailDTO } from '@/features/project/types/admin-detail';
import {
  getProjectDetail,
  approveProject,
  rejectProject,
} from '@/features/project/services';

export default function AdminProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params.id);

  const [project, setProject] = useState<AdminProjectDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getProjectDetail(projectId);
        setProject(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch project details');
        console.error('Error fetching project:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleVerify = async (id: number) => {
    try {
      const response = await approveProject(id);
      // Update project status
      setProject((prev) => (prev ? { ...prev, status: 'TERVERIFIKASI' } : null));
      // Show success toast
      console.log('Project verified successfully');
    } catch (err) {
      console.error('Error verifying project:', err);
      throw err;
    }
  };

  const handleReject = async (id: number, notes: string) => {
    try {
      const response = await rejectProject(id, notes);
      // Update project status
      setProject((prev) => (prev ? { ...prev, status: 'PERBAIKAN_DATA' } : null));
      // Show success toast
      console.log('Project rejected successfully');
    } catch (err) {
      console.error('Error rejecting project:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="font-bold text-red-900">Error</h2>
          <p className="mt-2 text-red-700">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectDetailView
        project={project}
        onVerify={handleVerify}
        onReject={handleReject}
        isLoading={isLoading}
      />
    </div>
  );
}
