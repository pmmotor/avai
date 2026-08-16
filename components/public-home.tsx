"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import type { UploadedMovie } from "@/lib/public-movies";

type Movie = {
  title: string;
  genre: string;
  year: number;
  duration: string;
  rating: number;
  quality: "4K" | "HD";
  palette: string;
  mark: string;
};

const movies: Movie[] = [
  { title: "Midnight Signal", genre: "Sci-Fi", year: 2026, duration: "2:04:18", rating: 96, quality: "4K", palette: "from-indigo-950 via-violet-700 to-orange-400", mark: "MS" },
  { title: "The Last Current", genre: "Thriller", year: 2025, duration: "1:48:32", rating: 93, quality: "HD", palette: "from-slate-950 via-cyan-900 to-cyan-400", mark: "LC" },
  { title: "Paper Kingdom", genre: "Drama", year: 2026, duration: "1:56:07", rating: 91, quality: "4K", palette: "from-amber-950 via-red-900 to-amber-400", mark: "PK" },
  { title: "Neon Runner", genre: "Action", year: 2025, duration: "2:11:44", rating: 98, quality: "4K", palette: "from-fuchsia-950 via-purple-700 to-cyan-400", mark: "NR" },
  { title: "Small Hours", genre: "Comedy", year: 2024, duration: "1:32:15", rating: 88, quality: "HD", palette: "from-sky-950 via-blue-500 to-yellow-300", mark: "SH" },
  { title: "Red Horizon", genre: "Adventure", year: 2026, duration: "2:18:51", rating: 95, quality: "4K", palette: "from-stone-950 via-red-800 to-orange-300", mark: "RH" },
  { title: "After the Rain", genre: "Romance", year: 2025, duration: "1:44:28", rating: 89, quality: "HD", palette: "from-emerald-950 via-teal-600 to-sky-300", mark: "AR" },
  { title: "House of Echoes", genre: "Horror", year: 2025, duration: "1:39:06", rating: 92, quality: "HD", palette: "from-black via-zinc-800 to-red-950", mark: "HE" },
  { title: "The Fourth Shore", genre: "Mystery", year: 2024, duration: "1:51:40", rating: 87, quality: "HD", palette: "from-blue-950 via-slate-600 to-stone-300", mark: "FS" },
  { title: "Gold Standard", genre: "Documentary", year: 2026, duration: "1:22:19", rating: 94, quality: "4K", palette: "from-neutral-950 via-yellow-800 to-yellow-300", mark: "GS" },
  { title: "Velocity", genre: "Action", year: 2025, duration: "1:58:03", rating: 90, quality: "4K", palette: "from-zinc-950 via-orange-700 to-yellow-400", mark: "V" },
  { title: "Quiet Satellite", genre: "Sci-Fi", year: 2024, duration: "2:06:25", rating: 86, quality: "HD", palette: "from-slate-950 via-blue-800 to-slate-400", mark: "QS" },
];

const genres = ["All", "Action", "Drama", "Sci-Fi", "Thriller", "Comedy", "Horror", "Adventure", "Documentary"];

const collections = [
  { name: "New releases", count: 28, color: "from-red-600 to-orange-400" },
  { name: "Award winners", count: 46, color: "from-amber-600 to-yellow-300" },
  { name: "Edge of your seat", count: 39, color: "from-purple-700 to-fuchsia-400" },
  { name: "Future worlds", count: 31, color: "from-blue-700 to-cyan-300" },
  { name: "True stories", count: 22, color: "from-emerald-700 to-lime-300" },
  { name: "Late-night comedy", count: 17, color: "from-pink-700 to-rose-300" },
];

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M12 16V4m0 0L7 9m5-5 5 5M4 15v5h16v-5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6" />
    </svg>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movie/${movie.title.toLowerCase().replaceAll(" ", "-")}`} className="group block min-w-0">
      <div className={`relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br ${movie.palette} shadow-lg shadow-black/20`}>
        <div className="absolute -right-4 -top-8 h-32 w-32 rounded-full border-[18px] border-white/10" />
        <div className="absolute -bottom-14 left-1/3 h-32 w-48 rotate-12 rounded-[50%] bg-black/25 blur-sm" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-4xl font-black tracking-tighter text-white/85 transition group-hover:opacity-0 sm:text-5xl">{movie.mark}</span>
        <span className="absolute left-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black tracking-wide text-white">{movie.quality}</span>
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">{movie.duration}</span>
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-xl transition duration-200 group-hover:scale-100 group-hover:opacity-100">
          <PlayIcon />
        </span>
      </div>
      <div className="pt-3">
        <h3 className="truncate text-xs font-semibold text-zinc-100 transition group-hover:text-red-400 sm:text-[15px]">{movie.title}</h3>
        <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[10px] text-zinc-500 sm:gap-2 sm:text-xs">
          <span className="shrink-0 font-semibold text-emerald-500">{movie.rating}%</span>
          <span>•</span>
          <span>{movie.year}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden truncate sm:inline">{movie.genre}</span>
        </div>
      </div>
    </Link>
  );
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function UploadedMovieCard({ movie }: { movie: UploadedMovie }) {
  const isVideo = movie.mimeType?.startsWith("video/") ?? false;

  return (
    <article className="min-w-0">
      <div className="aspect-video overflow-hidden rounded-lg border border-white/10 bg-black shadow-lg shadow-black/30">
        {isVideo ? (
          <video
            className="h-full w-full bg-black object-cover"
            controls
            preload="metadata"
            playsInline
          >
            <source src={movie.playbackUrl} type={movie.mimeType ?? "video/mp4"} />
            Your browser does not support HTML video.
          </video>
        ) : (
          <a className="flex h-full items-center justify-center text-sm font-semibold text-zinc-400 hover:text-white" href={movie.playbackUrl}>
            Open uploaded file
          </a>
        )}
      </div>
      <h3 className="mt-3 truncate text-sm font-semibold text-zinc-100 sm:text-[15px]">{movie.title}</h3>
      <div className="mt-1.5 flex min-w-0 items-center gap-2 text-xs text-zinc-500">
        <span className="shrink-0 rounded bg-red-600/15 px-1.5 py-0.5 font-bold text-red-400">Uploaded</span>
        <span className="truncate">{movie.fileName}</span>
        <span className="shrink-0">•</span>
        <span className="shrink-0">{formatFileSize(movie.fileSize)}</span>
      </div>
    </article>
  );
}

function UploadedMoviesSection({
  movies,
  id,
  className = "py-9",
}: {
  movies: UploadedMovie[];
  id: string;
  className?: string;
}) {
  if (!movies.length) {
    return null;
  }

  return (
    <section id={id} className={`scroll-mt-36 border-b border-white/10 ${className}`}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">From your library</p>
          <h2 className="mt-1 text-xl font-bold sm:text-2xl">Uploaded movies</h2>
        </div>
        <span className="text-xs text-zinc-600">{movies.length} available</span>
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {movies.map((movie) => <UploadedMovieCard key={movie.id} movie={movie} />)}
      </div>
    </section>
  );
}

export default function PublicHome({ uploadedMovies }: { uploadedMovies: UploadedMovie[] }) {
  const [query, setQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notified, setNotified] = useState(false);

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return movies.filter((movie) => {
      const matchesGenre = activeGenre === "All" || movie.genre === activeGenre;
      const matchesSearch = !normalizedQuery || `${movie.title} ${movie.genre}`.toLowerCase().includes(normalizedQuery);
      return matchesGenre && matchesSearch;
    });
  }, [activeGenre, query]);

  const visibleUploads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return uploadedMovies.filter((movie) =>
      !normalizedQuery || `${movie.title} ${movie.fileName}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query, uploadedMovies]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="min-h-screen bg-[#090a0d] pb-20 text-white md:pb-0">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090a0d]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 sm:px-6">
          <button
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            className="rounded-full p-2 text-zinc-300 transition hover:bg-white/10 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon />
          </button>
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="AVAI home">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 shadow-lg shadow-red-950/40"><PlayIcon /></span>
            <span className="text-xl font-black tracking-[-0.04em]">AVAI</span>
          </Link>

          <nav className="ml-5 hidden items-center gap-6 text-sm font-medium text-zinc-400 lg:flex">
            <Link className="text-white" href="/">Discover</Link>
            <Link className="transition hover:text-white" href="#latest">Latest</Link>
            <Link className="transition hover:text-white" href="#trending">Trending</Link>
          </nav>

          <form onSubmit={handleSearch} className="mx-auto hidden w-full max-w-xl items-center overflow-hidden rounded-full border border-white/15 bg-white/[0.04] focus-within:border-zinc-500 sm:flex">
            <label className="sr-only" htmlFor="movie-search-desktop">Search movies</label>
            <input
              id="movie-search-desktop"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
              placeholder="Search movies and genres"
            />
            <button aria-label="Search" className="border-l border-white/10 bg-white/[0.05] px-4 py-2.5 text-zinc-400 transition hover:text-white" type="submit">
              <SearchIcon />
            </button>
          </form>

          <Link href="/admin" className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:border-white/30 hover:bg-white/5 sm:text-sm">
            Admin
          </Link>
        </div>
        <form onSubmit={handleSearch} className="mx-4 mb-3 flex items-center overflow-hidden rounded-full border border-white/15 bg-white/[0.04] focus-within:border-zinc-500 sm:hidden">
          <label className="sr-only" htmlFor="movie-search-mobile">Search movies</label>
          <input
            id="movie-search-mobile"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
            placeholder="Search movies and genres"
          />
          <button aria-label="Search" className="border-l border-white/10 bg-white/[0.05] px-4 py-2.5 text-zinc-400" type="submit">
            <SearchIcon />
          </button>
        </form>
        {menuOpen ? (
          <nav className="flex gap-5 border-t border-white/10 px-5 py-3 text-sm text-zinc-300 lg:hidden">
            <Link href="/">Discover</Link><Link href="#latest">Latest</Link><Link href="#trending">Trending</Link>
          </nav>
        ) : null}
      </header>

      <main className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6">
        <UploadedMoviesSection movies={visibleUploads} id="uploads" className="py-6 md:hidden" />

        <section className="py-8 sm:py-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-500">Explore AVAI</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Find your next story</h1>
            </div>
            <span className="hidden text-sm text-zinc-500 sm:block">Fresh picks, every week</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {collections.map((collection) => (
              <button
                key={collection.name}
                onClick={() => document.getElementById("latest")?.scrollIntoView({ behavior: "smooth" })}
                className={`group relative h-28 overflow-hidden rounded-xl bg-gradient-to-br ${collection.color} p-4 text-left shadow-lg shadow-black/20 transition hover:-translate-y-1`}
              >
                <span className="absolute -right-7 -top-8 h-24 w-24 rounded-full border-[15px] border-white/15 transition group-hover:scale-110" />
                <span className="relative block text-sm font-extrabold leading-tight">{collection.name}</span>
                <span className="relative mt-2 block text-xs text-white/70">{collection.count} movies</span>
              </button>
            ))}
          </div>
        </section>

        <div className="sticky top-[7.25rem] z-40 -mx-4 overflow-x-auto border-y border-white/[0.07] bg-[#090a0d]/95 px-4 py-3 backdrop-blur-xl [scrollbar-width:none] sm:-mx-6 sm:top-16 sm:px-6">
          <div className="flex w-max gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeGenre === genre ? "bg-white text-black" : "bg-white/[0.08] text-zinc-300 hover:bg-white/[0.14]"}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <UploadedMoviesSection movies={visibleUploads} id="uploads-desktop" className="hidden py-9 md:block" />

        <section id="latest" className="scroll-mt-36 py-9">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold sm:text-2xl">Latest movies</h2>
            <button
              onClick={() => { setQuery(""); setActiveGenre("All"); }}
              className="text-sm font-semibold text-zinc-500 transition hover:text-white"
            >
              View all →
            </button>
          </div>
          {visibleMovies.length ? (
            <div className="grid grid-cols-1 gap-x-3 gap-y-7 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {visibleMovies.map((movie) => <MovieCard key={movie.title} movie={movie} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 py-16 text-center">
              <p className="font-semibold">No movies found</p>
              <button onClick={() => { setQuery(""); setActiveGenre("All"); }} className="mt-2 text-sm text-red-400 hover:text-red-300">Clear filters</button>
            </div>
          )}
        </section>

        <section id="trending" className="scroll-mt-36 border-t border-white/10 py-9">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-black">↗</span>
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">Trending now</h2>
              <p className="mt-0.5 text-xs text-zinc-500">What viewers are watching today</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-3 gap-y-7 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {[movies[3], movies[0], movies[7], movies[5], movies[1]].map((movie) => <MovieCard key={`trending-${movie.title}`} movie={movie} />)}
          </div>
        </section>

        <section className="mt-3 rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-950 px-6 py-8 sm:flex sm:items-center sm:justify-between sm:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">AVAI weekly</p>
            <h2 className="mt-2 text-xl font-bold">New movies, without the noise.</h2>
            <p className="mt-1 text-sm text-zinc-500">Get a short weekly roundup of fresh releases.</p>
          </div>
          <button
            onClick={() => setNotified(true)}
            className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 sm:mt-0"
          >
            {notified ? "You’re on the list ✓" : "Notify me"}
          </button>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-zinc-600">
        <p>© 2026 AVAI · Movies for every mood</p>
      </footer>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-4 border-t border-white/10 bg-[#0c0d11]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <Link href="/" className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-white">
          <HomeIcon />
          <span>Home</span>
        </Link>
        <Link href="#latest" className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-500 transition active:text-white">
          <GridIcon />
          <span>Latest</span>
        </Link>
        <Link href="#uploads" className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-500 transition active:text-white">
          <UploadIcon />
          <span>Uploads</span>
        </Link>
        <Link href="/admin" className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-500 transition active:text-white">
          <UserIcon />
          <span>Admin</span>
        </Link>
      </nav>
    </div>
  );
}
