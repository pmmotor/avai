# AVAI Phase 1A

This project contains a basic Next.js admin login and a test upload flow for Supabase Storage.

## Setup

1. Open `supabase/setup.sql` and run it manually in the Supabase SQL Editor.
2. Confirm the existing `.env` contains valid values for the variables shown in `.env.example`.
3. Install dependencies with `npm install`.
4. Start the development server with `npm run dev`.
5. Open `http://localhost:3000/admin` and sign in with `ADMIN_PASSWORD`.

The test endpoint accepts files up to 100 MB, uploads them to the private `avai-uploads` bucket, and records their metadata in `public.avai`.

This upload route passes the file through Next.js and is intended only as a connection test. Production movie ingestion should upload to Cloudflare R2 directly using short-lived signed upload URLs.
