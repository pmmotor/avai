import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type UploadedMovie = {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string | null;
  createdAt: string;
  playbackUrl: string;
};

type AvaiRow = {
  id: string;
  title: string;
  bucket: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string | null;
  created_at: string;
};

export async function getUploadedMovies(): Promise<UploadedMovie[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("avai")
      .select("id,title,bucket,storage_path,file_name,file_size,mime_type,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load uploaded movies:", error.message);
      return [];
    }

    const rows = (data ?? []) as AvaiRow[];
    const movies = await Promise.all(
      rows.map(async (row) => {
        const { data: signedData, error: signedError } = await supabase.storage
          .from(row.bucket)
          .createSignedUrl(row.storage_path, 60 * 60);

        if (signedError) {
          console.error(`Could not sign ${row.storage_path}:`, signedError.message);
          return null;
        }

        return {
          id: row.id,
          title: row.title,
          fileName: row.file_name,
          fileSize: row.file_size,
          mimeType: row.mime_type,
          createdAt: row.created_at,
          playbackUrl: signedData.signedUrl,
        } satisfies UploadedMovie;
      }),
    );

    return movies.filter((movie): movie is UploadedMovie => movie !== null);
  } catch (error) {
    console.error("Could not connect to Supabase:", error);
    return [];
  }
}
