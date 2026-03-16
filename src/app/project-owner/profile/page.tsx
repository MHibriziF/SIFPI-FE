import { Metadata } from 'next';
import OwnerUpdateProfilePage from '@/features/user-management/pages/update-profile/owner';

export const metadata: Metadata = {
  title: 'Update Profile | SIFPI Project Owner',
};

export default function ProjectOwnerProfilePage() {
  return <OwnerUpdateProfilePage />;
}
