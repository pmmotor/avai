import Link from "next/link";

type MoviePageProps = {
  params: Promise<{ slug: string }>;
};

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { slug } = await params;
  const title = titleFromSlug(slug);

  return (
    <main className="relative flex min-h-screen items-end overflow-hidden bg-[#090a0d] px-5 py-10 text-white sm:px-10 sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#7c3aed_0%,#1e1b4b_28%,#090a0d_67%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090a0d] via-transparent to-black/30" />
      <Link href="/" className="absolute left-5 top-5 z-10 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm font-semibold backdrop-blur-md transition hover:bg-white/10 sm:left-10 sm:top-8">
        ← Browse movies
      </Link>
      <section className="relative z-10 max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">AVAI original</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-300">
          <span className="font-bold text-emerald-400">96% match</span><span>2026</span><span>4K</span><span>2h 4m</span>
        </div>
        <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
          Movie details and real catalogue data will be connected to Supabase in the next step. This page keeps the public browsing flow complete while the player is being prepared.
        </p>
        <button disabled className="mt-7 flex cursor-not-allowed items-center gap-2 rounded-lg bg-white/60 px-6 py-3 font-bold text-black/70">
          ▶ Playback coming in Phase 2
        </button>
      </section>
    </main>
  );
}
