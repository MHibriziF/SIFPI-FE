import UpdateOwnerProfileForm from '@/features/user-management/components/update-owner-profile-form';

/**
 * Server component — page content for the Project Owner Update Profile screen.
 * The DashboardShell (Sidebar + Footer) is provided by
 * src/app/project-owner/layout.tsx and requires no duplication here.
 */
export default function OwnerUpdateProfilePage() {
  return (
    <div className="flex flex-col gap-0">
      {/* ── Page header banner ── */}
      <div className="w-full bg-grey px-20 py-10">
        <div className="flex flex-col gap-2 max-w-xl">
          <h1 className="text-4xl font-normal text-primary leading-none">Update Profile</h1>
          <p className="text-xl font-normal text-black leading-none">Kelola profil Anda</p>
        </div>
      </div>

      {/* ── Form area ── */}
      <div className="px-20 py-10">
        <UpdateOwnerProfileForm />
      </div>
    </div>
  );
}
