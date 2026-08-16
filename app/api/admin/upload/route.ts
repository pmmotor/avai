import { randomUUID } from "node:crypto";
import { hasAdminSession } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "avai-uploads";

function safeFileName(name: string) {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-160);

  return cleaned || "upload.bin";
}

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const titleValue = formData.get("title");
    const fileValue = formData.get("file");
    const title = typeof titleValue === "string" ? titleValue.trim() : "";

    if (!title || title.length > 200) {
      return NextResponse.json({ error: "Enter a movie title of 200 characters or fewer." }, { status: 400 });
    }

    if (!(fileValue instanceof File) || fileValue.size === 0) {
      return NextResponse.json({ error: "Choose a non-empty file." }, { status: 400 });
    }

    if (fileValue.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "The test upload limit is 100 MB." }, { status: 413 });
    }

    const supabase = createSupabaseAdminClient();
    const uploadId = randomUUID();
    const storagePath = `incoming/${uploadId}/${safeFileName(fileValue.name)}`;
    const fileBytes = Buffer.from(await fileValue.arrayBuffer());
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, fileBytes, {
      contentType: fileValue.type || "application/octet-stream",
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 502 });
    }

    const { error: databaseError } = await supabase.from("avai").insert({
      id: uploadId,
      title,
      bucket: BUCKET,
      storage_path: storagePath,
      file_name: fileValue.name,
      file_size: fileValue.size,
      mime_type: fileValue.type || null,
    });

    if (databaseError) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json({ error: `Metadata insert failed: ${databaseError.message}` }, { status: 502 });
    }

    return NextResponse.json({ message: "Upload completed successfully.", path: `${BUCKET}/${storagePath}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected upload error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

