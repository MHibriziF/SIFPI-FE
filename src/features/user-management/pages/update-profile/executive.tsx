import UpdateAdminProfileForm from '@/features/user-management/components/update-admin-profile-form';

/**
 * Server component — page content for the Executive Update Profile screen.
 * Layout (sidebar + footer) is provided by src/app/executive/layout.tsx.
 * Executive shares the same profile fields as admin (name, email, phone, jabatan).
 */
export default function ExecutiveUpdateProfilePage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* ── Page header banner ── */}
      <div className="w-full bg-grey px-20 py-10">
        <div className="flex flex-col gap-2.5 max-w-[551px]">
          <h1 className="text-4xl font-normal text-primary leading-none">Update Profile</h1>
          <p className="text-xl font-normal text-primary leading-none">Kelola profil Anda</p>
        </div>
      </div>

      {/* ── Form area ── */}
      <div className="flex-1 px-20 py-12">
        <UpdateAdminProfileForm />
      </div>
    </div>
  );
}
