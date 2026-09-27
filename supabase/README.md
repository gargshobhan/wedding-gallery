# Yaadein backend setup

1. Create a Supabase project.
2. Run migrations in `supabase/migrations` in order using the Supabase SQL editor or CLI.
3. Create a **private** Storage bucket named `wedding-photos`.
4. Copy `.env.example` to `.env.local` and fill in the project URL, publishable key and secret key.
5. Never expose `SUPABASE_SECRET_KEY` to client-side code.

The upload flow is direct browser -> Supabase Storage using a short-lived signed upload token. The Next.js API only signs the destination; it does not proxy image bytes.
