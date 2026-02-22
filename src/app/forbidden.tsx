'use client';

import ErrorPage from '@/shared/components/error-page';

export default function Forbidden() {
  return <ErrorPage code={403} />;
}
