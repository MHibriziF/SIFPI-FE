import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import UpdateInvestorProfileForm from '@/features/user-management/components/update-investor-profile-form';

export default function InvestorUpdateProfilePage() {
  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[249px] overflow-hidden">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-primary/90" />
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center text-white px-10">
          <h1 className="m-0 font-bold text-4xl leading-none">UPDATE PROFILE</h1>
          <p className="m-0 font-normal text-xl leading-none">Kelola profil Anda</p>
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="px-20 pt-12 pb-0 flex flex-col gap-3">
        <h1 className="font-bold text-5xl text-primary">Kelola Profile</h1>
        <Link
          href="/catalogue"
          className="flex items-center gap-2 text-primary text-xl hover:underline w-fit"
        >
          <ChevronLeft className="size-6" />
          Kembali ke dashboard
        </Link>
      </div>

      {/* ── Form Layout ── */}
      <div className="px-20 py-12">
        <UpdateInvestorProfileForm />
      </div>
    </div>
  );
}
