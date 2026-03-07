'use client';

import { FolderCheck, LucideIcon } from 'lucide-react';
import { Button } from '@/shared/components/button';
import Link from 'next/link';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  actionText?: string;
  actionHref?: string;
  icon?: LucideIcon;
  onClose?: () => void;
}

export default function SuccessModal({
  isOpen,
  title,
  message,
  actionText = 'OK',
  actionHref = '/login',
  icon: Icon = FolderCheck,
  onClose,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/50">
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ animation: 'fade-in-up 0.4s ease-out' }}
      >
        {/* Header */}
        <div className="bg-primary px-6 py-5">
          <h2 className="text-base font-semibold text-white">{title}</h2>
        </div>

        {/* Content — row layout: icon kiri, teks kanan */}
        <div className="px-6 py-8 flex items-center gap-5">
          {/* Icon */}
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <Icon className="w-8 h-8 text-green-600 stroke-[1.5]" />
          </div>

          {/* Text + Button */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-700 leading-snug">{message}</p>
            <div>
              <Link href={actionHref}>
                <Button 
                  variant="outlined" 
                  size="sm" 
                  className="px-6 border-2"
                  onClick={onClose}
                >
                  {actionText}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
