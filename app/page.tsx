import PublicHome from "@/components/public-home";
import { getUploadedMovies } from "@/lib/public-movies";

export const dynamic = "force-dynamic";

export default async function Home() {
  const uploadedMovies = await getUploadedMovies();

  return <PublicHome uploadedMovies={uploadedMovies} />;
}
