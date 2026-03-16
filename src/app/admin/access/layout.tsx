export default function AccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-grey px-6 py-6">
        <h1 className="text-4xl font-normal text-primary">Manajemen Pengguna & Akses</h1>
        <p className="text-m text-gray-500 mt-1">
          Kelola verifikasi Project Owner dan akses Investor
        </p>
      </div>
      {children}
    </div>
  );
}
