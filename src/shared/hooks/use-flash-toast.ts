'use client';

import { useEffect } from 'react';
import { showToast } from '@/shared/components/toast';

const FLASH_KEY = 'flash_toast';

export type FlashToast = {
  type: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  description: string;
};

export function setFlashToast(flash: FlashToast) {
  sessionStorage.setItem(FLASH_KEY, JSON.stringify(flash));
}

export function useFlashToast() {
  useEffect(() => {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (!raw) return;
    sessionStorage.removeItem(FLASH_KEY);
    try {
      const { type, title, description } = JSON.parse(raw) as FlashToast;
      showToast(type, title, description);
    } catch {}
  }, []);
}

export function FlashToast() {
  useFlashToast();
  return null;
}
