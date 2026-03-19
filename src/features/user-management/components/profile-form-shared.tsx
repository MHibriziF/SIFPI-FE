import React from 'react';
import { ApiError } from '@/shared/types/api';
import { showToast } from '@/shared/components/toast';

// ─── Error handler ────────────────────────────────────────────────────────────

/**
 * Handles profile update API errors consistently across all profile forms.
 * @param onConflict - called with the error message when HTTP 409 (email conflict)
 */
export function handleProfileUpdateError(
  err: unknown,
  onConflict?: (message: string) => void
): void {
  if (err instanceof ApiError) {
    if (err.status === 409 && onConflict) {
      onConflict(err.message);
    }
    showToast('danger', 'Gagal memperbarui profil', err.message);
  } else {
    showToast('danger', 'Gagal memperbarui profil', 'Terjadi kesalahan. Silakan coba lagi.');
  }
}

// ─── Skeleton sub-components ──────────────────────────────────────────────────

/** Right-column skeleton — password card (identical across all profile forms) */
export function PasswordCardSkeleton() {
  return (
    <div className="w-[440px] shrink-0 border border-grey rounded-[20px] overflow-hidden animate-pulse">
      <div className="h-12 bg-primary" />
      <div className="p-8 space-y-4">
        {['skeleton-password-1', 'skeleton-password-2', 'skeleton-password-3'].map((id) => (
          <div key={id} className="h-10 rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

interface ProfileFormSkeletonProps {
  /** Number of input skeleton rows in the left card */
  inputCount?: number;
  /** Padding class for the card body (default: 'p-5') */
  padding?: string;
  /** Whether to show the save/cancel action buttons below the card */
  showActionButtons?: boolean;
}

/** Full two-column loading skeleton for profile edit pages */
export function ProfileFormSkeleton({
  inputCount = 3,
  padding = 'p-5',
  showActionButtons = true,
}: Readonly<ProfileFormSkeletonProps>) {
  return (
    <div className="flex gap-5 items-start">
      <div className="flex-1 flex flex-col gap-5">
        <div className="border border-grey rounded-[20px] overflow-hidden animate-pulse">
          <div className="h-12 bg-primary" />
          <div className={`${padding} space-y-4`}>
            {Array.from({ length: inputCount }, (_, i) => `skeleton-profile-${i + 1}`).map((id) => (
              <div key={id} className="h-10 rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
        {showActionButtons && (
          <div className="flex gap-5">
            <div className="h-10 w-36 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-10 w-52 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        )}
      </div>
      <PasswordCardSkeleton />
    </div>
  );
}
