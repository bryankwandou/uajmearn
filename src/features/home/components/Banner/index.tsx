import Link from 'next/link';

// Plain hero in place of the rotating promo carousel.
export function BannerCarousel({
  totalUsers,
}: {
  totalUsers?: number | null;
  totalSponsors?: number | null;
}) {
  return (
    <section className="flex flex-col gap-5 border-b border-slate-100 py-8 md:flex-row md:items-center md:justify-between md:py-10">
      <div className="max-w-xl">
        <img
          src="/assets/brand/scc-black.png"
          alt="Superteam Campus Club"
          className="mb-5 h-12 w-auto md:h-14"
        />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Find your next bounty, project, and hackathon
        </h1>
        <p className="mt-2 text-slate-500 md:text-lg">
          Internal opportunities from Superteam Campus Club UAJM and UKM
          Esports. Build, compete, and earn with one profile.
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 md:items-end">
        <Link
          href="/earn/signup"
          className="bg-brand-purple hover:bg-brand-purple-dark rounded-lg px-6 py-3 text-sm font-semibold text-white"
        >
          Join Superteam Campus Club
        </Link>
        {!!totalUsers && totalUsers > 0 && (
          <span className="text-xs text-slate-400">
            {totalUsers.toLocaleString()}+ members
          </span>
        )}
      </div>
    </section>
  );
}
