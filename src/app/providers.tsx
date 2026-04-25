'use client';

import { type ReactNode } from 'react';
import { ProgressProvider } from '@bprogress/next/app';

interface ProviderProps {
  children: ReactNode;
}

export function Providers({ children }: ProviderProps) {
  return (
    <ProgressProvider
      height="3px"
      color="var(--color-base-content)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  )
}