This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Structure

The project uses a modular Next.js App Router architecture with separated layers for 
UI, API routes, services, validation, and database access. Business logic is extracted 
into reusable service modules, while components are organized by feature for 
scalability and maintainability.
- `src/app` — routes and API endpoints
- `src/components` — reusable UI and feature components
- `src/lib` — services, validators, auth, uploads, helpers
- `src/types` — shared TypeScript types
- `src/server` — server-side services, controllers, repositories
- `prisma` — database schema and migrations

The project follows a clean layered architecture with clear separation of concerns: **controllers** handle HTTP requests, **services** contain business logic, **repositories** interact with the database, **validators** ensure input correctness, and **components** render the UI.

```
src/
├── app/              # Next.js App Router pages and API route handlers
├── components/       # Reusable UI components organized by feature
├── lib/              # Shared utilities, client-side services, and helpers
├── server/           # Server-side business logic (services, controllers, repositories)
└── types/            # Shared TypeScript type definitions
prisma/
└── schema.prisma     # Single source of truth for database structure (DO NOT MODIFY)
```

## Architecture Layers

- **Controllers** (`src/server/controllers/`) — Handle HTTP requests/responses and delegate to services
- **Services** (`src/server/services/`) — Contain business logic and orchestrate operations
- **Repositories** (`src/server/repositories/`) — Handle direct database operations via Prisma
- **Validators** (`src/lib/validators/`) — Validate input data using Zod schemas
- **Components** (`src/components/`) — Render UI with reusable building blocks

### Important Files

- `prisma/schema.prisma` — Database schema definition (single source of truth, never modify)
- `src/server/prisma.ts` — Prisma client singleton instance
- `src/server/middlewares/authMiddleware.ts` — Authentication middleware for protected routes
- `src/server/services/bookService.ts` — Business logic for book CRUD operations
- `src/server/services/pricingService.ts` — Price calculation and discount logic
- `src/server/utils/api-response.ts` — Standardized API response helpers
- `src/lib/validators/book.ts` — Book and chapter validation schemas
- `src/app/api/**/route.ts` — API route handlers that call controllers

src/server/
├── core/errors/
│   └── AppError.ts                    # Custom error classes
└── modules/books/
    ├── book.controller.ts              # Thin HTTP request/response layer
    ├── book.service.ts                 # Orchestration layer
    ├── book.parser.ts                  # Request parsing logic
    ├── book.validator.ts               # Schema validation
    ├── book.permissions.ts             # Authorization checks
    ├── book.mapper.ts                  # Data transformation
    └── utils/
        ├── parseMultipartBook.ts       # FormData parsing
        └── extractChapterImages.ts    # Image extraction

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

### Run Locally

```bash
npm install
npm run dev
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
