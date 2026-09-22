import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Default } from '@/layouts/Default';
import { Meta } from '@/layouts/Meta';
import { useUser } from '@/store/user';

export default function Blocked() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !user?.isBlocked) {
      router.push('/earn');
    }
  }, [user]);

  return (
    <Default
      meta={
        <>
          <Meta
            title="Blocked | UAJM Earn"
            description="Explore the latest bounties on UAJM Earn, offering opportunities in the crypto space across Design, Development, and Content."
          />
          <Head>
            <meta name="robots" content="noindex, nofollow" />
          </Head>
        </>
      }
    >
      <div className="mx-auto mt-10 max-w-[800px] px-4">
        <p className="text-center text-3xl font-medium text-slate-600">
          Your access to Earn has been restricted.
        </p>
      </div>
    </Default>
  );
}
