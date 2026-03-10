import { notFound } from 'next/navigation';
import { withPermission } from '@/shared/lib/auth-guard';
import ProjectOwnerDetailView from '@/features/project/components/project-owner-detail-view';

export default withPermission('PROJECT', 'READ')(async ({ params }) => {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isFinite(projectId) || projectId <= 0) notFound();

  return <ProjectOwnerDetailView projectId={projectId} />;
});
