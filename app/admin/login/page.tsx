import { hasAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (await hasAdminSession()) {
    redirect("/admin");
  }

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-7 shadow-2xl">
        <p className="mb-2 text-xs font-bold tracking-[0.3em] text-red-500">AVAI</p>
        <h1 className="text-2xl font-semibold">Admin access</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Enter the admin password configured on the server.
        </p>

        {error ? (
          <p role="alert" className="mt-5 rounded-lg border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-200">
            Incorrect password. Please try again.
          </p>
        ) : null}

        <form action="/api/admin/login" method="post" className="mt-6 space-y-4">
          <label className="block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            className="w-full rounded-lg border border-[var(--border)] bg-black/30 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            autoFocus
          />
          <button className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold transition hover:bg-red-500" type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}

