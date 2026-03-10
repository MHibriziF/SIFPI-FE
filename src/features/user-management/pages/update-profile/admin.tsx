import UpdateAdminProfileForm from '@/features/user-management/components/update-admin-profile-form';

export default function AdminUpdateProfilePage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* ── Page header banner (matches Figma grey banner) ── */}
      <div className="w-full bg-grey px-20 py-10">
        <div className="flex flex-col gap-2.5 max-w-[551px]">
          <h1 className="text-4xl font-normal text-primary leading-none">Update Profile</h1>
          <p className="text-xl font-normal text-foreground leading-none">Kelola profil Anda</p>
        </div>
      </div>

      {/* ── Form area ── */}
      <div className="flex-1 px-20 py-12">
        <UpdateAdminProfileForm />
      </div>
    </div>
  );
}
