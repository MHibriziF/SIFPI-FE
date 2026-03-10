import { notFound } from 'next/navigation';
import { withPermission, hasPermission } from '@/shared/lib/auth-guard';
import ProjectOwnerDetailView from '@/features/project/components/project-owner-detail-view';

type Props = { params: Promise<{ id: string }> };

export default withPermission('PROJECT', 'READ')(async ({ params }: Props, session) => {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isFinite(projectId) || projectId <= 0) notFound();

  const canEdit = hasPermission(session, 'PROJECT', 'UPDATE');

  return <ProjectOwnerDetailView projectId={projectId} canEdit={canEdit} />;
});
