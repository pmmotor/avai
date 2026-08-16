"use client";

import { FormEvent, useState } from "react";

type UploadResult = {
  message?: string;
  path?: string;
  error?: string;
};

export default function AdminUploader() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setResult(null);

    const form = event.currentTarget;

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: new FormData(form),
      });
      const data = (await response.json()) as UploadResult;
      setResult(data);

      if (response.ok) {
        form.reset();
      }
    } catch {
      setResult({ error: "The upload request could not be completed." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-8">
      <h2 className="text-xl font-semibold">Upload a test file</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Choose a title and a file to verify the Supabase Storage connection.
      </p>

      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="title">Movie title</label>
          <input
            className="w-full rounded-lg border border-[var(--border)] bg-black/30 px-4 py-3 outline-none focus:border-red-500"
            id="title"
            name="title"
            type="text"
            maxLength={200}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="file">File</label>
          <input
            className="block w-full rounded-lg border border-dashed border-[var(--border)] bg-black/20 px-4 py-5 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-2 file:text-white"
            id="file"
            name="file"
            type="file"
            required
          />
        </div>
        <button
          className="rounded-lg bg-red-600 px-5 py-3 font-semibold transition enabled:hover:bg-red-500 disabled:cursor-wait disabled:opacity-60"
          type="submit"
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Upload to Supabase"}
        </button>
      </form>

      {result ? (
        <div
          role="status"
          className={`mt-6 rounded-lg border px-4 py-3 text-sm ${result.error ? "border-red-900 bg-red-950/50 text-red-200" : "border-emerald-900 bg-emerald-950/40 text-emerald-200"}`}
        >
          <p>{result.error ?? result.message}</p>
          {result.path ? <p className="mt-2 break-all font-mono text-xs opacity-80">{result.path}</p> : null}
        </div>
      ) : null}
    </section>
  );
}

