# Shana Site

Static portfolio site deployed on Vercel with a serverless contact endpoint at `/api/contact`.

## Contact Form Setup

The contact endpoint saves messages to MongoDB in a `messages` collection.

Required Vercel runtime environment variables:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

Optional:

```env
MONGODB_DB=gowsik_portfolio
MONGODB_COLLECTION=messages
RESEND_API_KEY=re_...
CONTACT_EMAIL_TO=gowsikbabubabu@gmail.com
```

For MongoDB Atlas, create a database user, allow Vercel outbound access in
Network Access, and copy the connection string into `MONGODB_URI`.

## CI/CD

The GitHub Actions workflow is in `.github/workflows/ci-cd.yml`.

It runs on pushes to `main` and manual dispatch:

1. Installs dependencies and checks JavaScript syntax.
2. Deploys to Vercel.

Required GitHub repository secrets for the full pipeline:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=gowsik_portfolio
MONGODB_COLLECTION=messages
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
RESEND_API_KEY=...
CONTACT_EMAIL_TO=...
```

During deployment the workflow syncs `MONGODB_URI`, optional `MONGODB_DB`, optional `MONGODB_COLLECTION`, optional `RESEND_API_KEY`, and optional `CONTACT_EMAIL_TO` into the Vercel production environment before deploying.

If required secrets are missing, the workflow validates the site and skips unavailable deployment steps with warnings.
