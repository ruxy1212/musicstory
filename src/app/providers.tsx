'use client';

import { type ReactNode } from 'react';
import { ProgressProvider } from '@bprogress/next/app';
import { KeysProvider } from '@/components/config/keys-context';

interface ProviderProps {
  children: ReactNode;
}

export function Providers({ children }: ProviderProps) {
  return (
    <ProgressProvider
      height="3px"
      color="var(--primary)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      <KeysProvider>
        {children}
      </KeysProvider>
    </ProgressProvider>
  )
}