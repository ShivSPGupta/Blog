# Blog project

This project is a Vite React blog app with two runtime modes:

- `local` mode for quick UI testing with sample data and browser storage
- `supabase` mode for real auth, profiles, posts, ownership, and admin control

The production architecture is:

- frontend: `Vite + React`
- backend services: `Supabase Auth + Postgres`
- hosting: `Vercel`

No custom Node backend is required for the current app.

## Current features

- blog home, category pages, and single post pages
- create, edit, and delete posts
- draft and published post status
- autosaved post form drafts in the browser
- Supabase email/password auth
- signup with email confirmation support
- forgot-password and reset-password flow
- author-owned posts
- admin role that can manage all posts
- author display names backed by profiles
- Vercel SPA rewrite support through [vercel.json](/E:/Capstone%20Project/blog/vercel.json)

## Important files

- frontend auth client: [src/lib/supabase-client.js](/E:/Capstone%20Project/blog/src/lib/supabase-client.js)
- auth logic: [src/hooks/useAuth.js](/E:/Capstone%20Project/blog/src/hooks/useAuth.js)
- auth page UI: [src/pages/AuthPage.jsx](/E:/Capstone%20Project/blog/src/pages/AuthPage.jsx)
- Supabase schema: [database/supabase-schema.sql](/E:/Capstone%20Project/blog/database/supabase-schema.sql)
- sample seed data: [database/supabase-seed.sql](/E:/Capstone%20Project/blog/database/supabase-seed.sql)
- promote admin user: [database/promote-admin.sql](/E:/Capstone%20Project/blog/database/promote-admin.sql)

## Environment files

- `.env` or `.env.local` for local development
- `.env.production` for production builds
- `.env.example` and `.env.production.example` as templates

## Environment variables

### Local sample-data mode

```env
VITE_BLOG_DATA_MODE=local
```

### Local Supabase mode

```env
VITE_BLOG_DATA_MODE=supabase
VITE_APP_URL=http://localhost:5173
VITE_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
```

### Production Supabase mode

```env
VITE_BLOG_DATA_MODE=supabase
VITE_APP_URL=https://your-app.vercel.app
VITE_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
```

Notes:

- `VITE_BLOG_DATA_MODE` controls the data source, not whether the app is production
- `VITE_APP_URL` is used for auth email redirects
- `VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_ANON_KEY` are safe browser values
- never expose `SUPABASE_SECRET_KEY` or Postgres credentials in frontend env files

## Local run

### Option 1: local mode

1. Create `.env.local` or `.env` from [.env.example](/E:/Capstone%20Project/blog/.env.example)
2. Keep `VITE_BLOG_DATA_MODE=local`
3. Run:

```bash
npm run dev
```

This uses sample data and local browser storage.

### Option 2: local app connected to Supabase

1. Create `.env.local`
2. Use the local Supabase env values shown above
3. Run:

```bash
npm run dev
```

This still runs locally, but it uses your real Supabase backend.

## Supabase setup

1. Create a Supabase project
2. Open `Authentication` and create at least one user through the app or the dashboard
3. Open `SQL Editor`
4. Run [database/supabase-schema.sql](/E:/Capstone%20Project/blog/database/supabase-schema.sql)
5. Optionally run [database/supabase-seed.sql](/E:/Capstone%20Project/blog/database/supabase-seed.sql)

Seed behavior:

- the seed script uses the first row in `auth.users`
- the seeded user owns the sample posts
- the seeded user is promoted to `admin`
- re-running the seed will not duplicate the same starter posts because it uses conflict handling

## Admin role

The app has two roles in the `profiles` table:

- `author`
- `admin`

Current admin behavior:

- authors can create posts
- authors can edit and delete only their own posts
- admins can edit and delete any post

To promote a user manually:

1. sign up the target user
2. edit the email in [database/promote-admin.sql](/E:/Capstone%20Project/blog/database/promote-admin.sql)
3. run that SQL in the Supabase SQL editor

## Auth behavior

### Sign up

- signup supports display names
- if email confirmation is enabled in Supabase, the UI shows a confirmation message instead of treating signup as an error
- after confirmation, the user signs in normally

### Sign in

- registered user + correct password -> signs in
- unregistered email or wrong password -> generic auth error from Supabase

### Forgot password

- the UI sends a reset request
- it shows a generic safe message:
  `If an account exists for this email, a reset link has been sent.`
- this avoids exposing whether the email is registered

### Reset password

- the email link returns the user to `/auth?mode=reset-password`
- the user sets a new password and then signs in normally

## Supabase auth URL configuration

In the Supabase dashboard, open:

- `Authentication -> URL Configuration`

Set:

- `Site URL` to your production domain
- add redirect URLs for both local and production

Recommended values:

- `http://localhost:5173/auth`
- `http://localhost:5173/auth?mode=reset-password`
- `https://your-app.vercel.app/auth`
- `https://your-app.vercel.app/auth?mode=reset-password`

Important:

- signup confirmation emails depend on Supabase auth URL settings and the explicit redirect passed from the app
- password reset links use `VITE_APP_URL` with fallback to the current browser origin

## Deployment

### Vercel frontend + Supabase backend

1. Push the repo to GitHub
2. Import it into Vercel
3. Set Vercel environment variables:

```env
VITE_BLOG_DATA_MODE=supabase
VITE_APP_URL=https://your-app.vercel.app
VITE_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
```

4. Deploy

This project already includes [vercel.json](/E:/Capstone%20Project/blog/vercel.json) so React Router routes reload correctly on Vercel.

### Shared hosting static build

If you keep `VITE_BLOG_DATA_MODE=local`, you can deploy as a static SPA:

1. Run:

```bash
npm run build
```

2. Upload `dist/`
3. Make sure your host supports SPA rewrites

For the full Supabase-backed version, Vercel is the simpler deployment path.

## Production notes

- this app talks directly to Supabase from the browser
- security is enforced with Supabase Auth and RLS, not by hiding frontend logic
- the database owns author email and author display metadata through triggers in the schema
- auth sessions persist in the browser
- Supabase mode no longer falls back silently to local storage on failed writes

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - build production frontend
- `npm run preview` - preview build locally
- `npm run lint` - run ESLint
