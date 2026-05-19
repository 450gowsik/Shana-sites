# Shana Site

Static portfolio site deployed on Vercel with a serverless contact endpoint at `/api/contact`.

## Contact Form Setup

The contact endpoint saves messages to Supabase table `public.messages`.

Required Vercel runtime environment variables:

```env
SUPABASE_URL=https://duhlujhobxktldjgkwom.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

`SUPABASE_ANON_KEY` is also supported for legacy Supabase projects.

Optional:

```env
RESEND_API_KEY=re_...
CONTACT_EMAIL_TO=gowsikbabubabu@gmail.com
```

## CI/CD

The GitHub Actions workflow is in `.github/workflows/ci-cd.yml`.

It runs on pushes to `main` and manual dispatch:

1. Installs dependencies and checks JavaScript syntax.
2. Applies Supabase migrations from `supabase/migrations`.
3. Deploys to Vercel.

Required GitHub repository secrets for the full pipeline:

```env
SUPABASE_DB_URL=postgresql://postgres:<password>@db.duhlujhobxktldjgkwom.supabase.co:5432/postgres
SUPABASE_URL=https://duhlujhobxktldjgkwom.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
RESEND_API_KEY=...
CONTACT_EMAIL_TO=...
```

During deployment the workflow syncs `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ANON_KEY`, optional `RESEND_API_KEY`, and optional `CONTACT_EMAIL_TO` into the Vercel production environment before deploying.

If required secrets are missing, the workflow validates the site and skips the unavailable migration or deployment steps with warnings.
