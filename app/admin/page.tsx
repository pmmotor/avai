import AdminUploader from "@/components/admin-uploader";
import { hasAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 sm:px-8">
      <header className="flex items-center justify-between border-b border-[var(--border)] pb-6">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] text-red-500">AVAI</p>
          <h1 className="mt-1 text-2xl font-semibold">Upload administration</h1>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5" type="submit">
            Sign out
          </button>
        </form>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-[1fr_0.7fr]">
        <AdminUploader />
        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
          <h2 className="font-semibold">Test upload notes</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-[var(--muted)]">
            <li>Maximum file size is 100 MB.</li>
            <li>Files are stored in the private Supabase bucket.</li>
            <li>Upload metadata is recorded in the <code className="text-zinc-200">avai</code> table.</li>
            <li>This is a connectivity test; production movies will later use Cloudflare R2.</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}

