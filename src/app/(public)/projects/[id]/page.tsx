import { getSession } from '@/shared/lib/session';
import PublicProjectDetailView from '@/features/project/components/public-project-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = Number(id);

  // Public page — no requireRole; getSession returns null for unauthenticated visitors.
  const session = await getSession();
  const isLoggedIn = session !== null;

  return <PublicProjectDetailView projectId={projectId} isLoggedIn={isLoggedIn} />;
}
