import { notFound } from 'next/navigation';
import { withPermission } from '@/shared/lib/auth-guard';
import EditProjectPage from '@/features/project/pages/edit-project';

type Props = { params: Promise<{ id: string }> };

export default withPermission('PROJECT', 'UPDATE')(async ({ params }: Props) => {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isFinite(projectId) || projectId <= 0) notFound();

  return <EditProjectPage projectId={projectId} />;
});
