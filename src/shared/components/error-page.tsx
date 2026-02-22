'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ERROR_CONTENT: Record<number, { title: string; message: string }> = {
  404: {
    title: 'Halaman Tidak Ditemukan',
    message:
      'Maaf, tautan yang anda tuju mungkin sudah dipindahkan atau tidak tersedia dalam sistem kami.',
  },
  403: {
    title: 'Akses Ditolak',
    message: 'Maaf, anda tidak memiliki izin untuk mengakses halaman ini.',
  },
  500: {
    title: 'Terjadi Kesalahan',
    message: 'Maaf, terjadi kesalahan pada server kami. Silakan coba beberapa saat lagi.',
  },
};

export default function ErrorPage({ code }: { code: 404 | 403 | 500 }) {
  const router = useRouter();
  const { title, message } = ERROR_CONTENT[code];

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: 'calc(100dvh - 60px)' }}
    >
      {/* Background */}
      <Image
        src="/png/home-bg-banner.jpeg"
        alt=""
        fill
        priority
        className="object-cover object-top"
        sizes="100vw"
      />
      {/* Uniform black overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-4 px-6 py-16">
        {/* Logo + name */}
        <div className="flex flex-col items-center gap-4 mb-4">
          <Image src="/png/ipfo-logo.png" alt="IPFO Logo" width={128} height={128} />
          <p className="text-white text-xl font-medium leading-snug">
            Infrastructure Project Facilitation Office
          </p>
        </div>

        {/* Error code — huge gradient text */}
        <h1
          className="font-bold leading-none bg-linear-to-l from-white to-primary bg-clip-text text-transparent select-none"
          style={{ fontSize: 'clamp(8rem, 25vw, 18rem)' }}
        >
          {code}
        </h1>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>

        {/* Description */}
        <p className="text-white/65 max-w-md text-sm md:text-base leading-relaxed">{message}</p>

        {/* Buttons */}
        <div className="flex flex-col justify-center gap-3 mt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/85 transition-all duration-200 active:scale-[0.97]"
          >
            Kembali ke halaman utama
          </Link>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-medium bg-white text-primary hover:bg-white/90 transition-all duration-200 active:scale-[0.97]"
          >
            Kembali ke halaman sebelumnya
          </button>
        </div>
      </div>
    </section>
  );
}
