'use client';

import { type ReactNode } from 'react';
import { ProgressProvider } from '@bprogress/next/app';
import { KeysProvider } from '@/components/config/keys-context';
import { Toaster } from 'sonner';

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
        <Toaster position="bottom-right" richColors />
      </KeysProvider>
    </ProgressProvider>
  );
}
