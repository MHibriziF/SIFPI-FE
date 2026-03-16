import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { withPermission, hasPermission } from '@/shared/lib/auth-guard';
import { serverGetAdminUserDetail } from '@/features/access/services';
import { UserDetailView } from '@/features/access/components/user-detail';

type PageProps = { params: Promise<{ email: string }> };

export default withPermission('USER', 'READ')(async (props: PageProps, session) => {
  const { email } = await props.params;
  const decodedEmail = decodeURIComponent(email);

  const cookieStore = await cookies();
  const token = cookieStore.get('SIFPI_TOKEN')?.value ?? '';

  const user = await serverGetAdminUserDetail(decodedEmail, token);

  if (!user) notFound();

  return (
    <UserDetailView
      user={user}
      canUpdate={hasPermission(session, 'USER', 'UPDATE')}
      canDelete={hasPermission(session, 'USER', 'DELETE')}
    />
  );
});
