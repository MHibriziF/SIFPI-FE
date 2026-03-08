"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type VerificationStatus = "loading" | "success" | "error" | "no-token";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("no-token");
      return;
    }

    const verifyEmail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(
          `${apiUrl}/api/auth/register/verify-email?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Email berhasil diverifikasi!");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setStatus("error");
          setMessage(
            data.message ||
              "Verifikasi gagal. Token tidak valid atau sudah kadaluarsa."
          );
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          "Terjadi kesalahan saat memverifikasi email. Silakan coba lagi."
        );
        console.error("Verification error:", error);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          {status === "loading" && (
            <Loader2 className="size-12 text-blue-600 animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle className="size-12 text-success" />
          )}
          {(status === "error" || status === "no-token") && (
            <XCircle className="size-12 text-danger" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === "loading" && "Memverifikasi Email"}
          {status === "success" && "Email Terverifikasi!"}
          {status === "error" && "Verifikasi Gagal"}
          {status === "no-token" && "Token Tidak Ditemukan"}
        </h1>

        <p className="text-gray-600 mb-6 mt-4">
          {status === "loading" &&
            "Mohon tunggu, kami sedang memverifikasi email Anda..."}
          {status === "success" &&
            "Email Anda berhasil diverifikasi. Mengalihkan ke halaman login..."}
          {status === "error" && message}
          {status === "no-token" &&
            "Token verifikasi tidak ditemukan di URL. Periksa kembali link yang Anda terima."}
        </p>

        {(status === "error" || status === "no-token") && (
          <div className="space-y-3">
            <Link
              href="/login"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Kembali ke Login
            </Link>
            <Link
              href="/register"
              className="inline-block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
            >
              Daftar Ulang
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}