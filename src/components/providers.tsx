import { PrivyProvider, usePrivy } from '@/lib/local-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { ExternalLinkDialogProvider } from '@/components/shared/ExternalLinkDialogProvider';

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider session={session}>
      <PrivyProvider>
        <QueryClientProvider client={queryClient}>
          <ExternalLinkDialogProvider>
            <PrivyInitFlagBridge />
            {children}
          </ExternalLinkDialogProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </SessionProvider>
  );
}

function PrivyInitFlagBridge(): null {
  const { ready } = usePrivy();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__privyInitializing = !ready;
    }
  }, [ready]);
  return null;
}
