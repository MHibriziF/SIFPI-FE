import { Metadata } from 'next';
import ExecutiveUpdateProfilePage from '@/features/user-management/pages/update-profile/executive';

export const metadata: Metadata = {
  title: 'Update Profile | SIFPI Executive',
};

export default function ExecutiveProfilePage() {
  return <ExecutiveUpdateProfilePage />;
}
