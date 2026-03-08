export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-grey px-6 py-6">
        <h1 className="text-4xl font-normal text-primary">Manajemen Proyek</h1>
        <p className="text-m text-gray-500 mt-1">
          Kelola verifikasi proyek
        </p>
      </div>
      {children}
    </div>
  );
}
