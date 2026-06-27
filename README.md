# Blog project

This app runs in local-first mode by default, so you can test it immediately without setting up MySQL or the API.

## Env files

- `.env.local` for local testing
- `.env.production` for Supabase deployment

## Local run

1. Create a `.env.local` file from `.env.local.example`.
2. Leave `VITE_BLOG_DATA_MODE=local`.
3. Run:

```bash
npm run dev
```

That uses the browser local store/sample data path.

## Supabase run

1. Create a Supabase project.
2. Create at least one user from the app or the Supabase Auth panel.
3. In the Supabase SQL editor, run [supabase-schema.sql](/E:/Capstone%20Project/blog/database/supabase-schema.sql) and then [supabase-seed.sql](/E:/Capstone%20Project/blog/database/supabase-seed.sql).
4. Create `.env.local` or `.env.production` from `.env.production.example`.
5. Set `VITE_BLOG_DATA_MODE=supabase`.
6. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
7. Start the frontend:

```bash
npm run dev
```

This mode talks directly to Supabase from the frontend.
Posts stay publicly readable, but create/edit/delete is now limited to the signed-in author who owns the row.

## Deployment

### Static frontend on shared hosting

This project can be deployed as a static SPA if you keep `VITE_BLOG_DATA_MODE=local`.

1. Run `npm run build`.
2. Upload the contents of `dist/` to `public_html/`.
3. Keep `public/.htaccess` in place so React Router routes like `/post/:id` reload correctly.

That mode is the simplest way to ship the project on Hosting without a Node backend.

### Full blog with Supabase

If you want the Supabase-backed version in production:

1. Create your Supabase project and at least one auth user.
2. Run [supabase-schema.sql](/E:/Capstone%20Project/blog/database/supabase-schema.sql).
3. Optionally run [supabase-seed.sql](/E:/Capstone%20Project/blog/database/supabase-seed.sql) for starter content owned by the first user in `auth.users`.
4. Set `VITE_BLOG_DATA_MODE=supabase`.
5. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.production`.
6. Build and deploy the frontend with `npm run build`.

Supabase removes the need for a separate Node backend for this project.

## Scripts

- `npm run dev` - frontend only
- `npm run build` - production frontend build
- `npm run lint` - ESLint
