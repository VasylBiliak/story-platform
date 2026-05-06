This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Supabase Setup

Authentication and session management are handled by **Supabase Auth**.

### Auth Flow

- **Register** — `POST` to `supabase.auth.signUp({ email, password, options: { data: { name } } })`
- **Login** — `POST` to `supabase.auth.signInWithPassword({ email, password })`
- **Logout** — `POST` to `supabase.auth.signOut()`
- **Session** — automatically persisted via `onAuthStateChange` listener in `AuthProvider`

### Project Structure

- `src/lib/supabaseClient.ts` — Supabase browser client initialization
- `src/services/supabase.ts` — re-export of the Supabase client (mirrors reference project)
- `src/components/auth/AuthProvider.tsx` — React context provider wrapping the app with session state
- `src/contexts/AuthContext.tsx`, `src/contexts/useAuth.ts`, `src/contexts/AuthTypes.ts` — context/hooks/types aligned with reference project

### Run Locally

```bash
npm install
npm run dev
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
