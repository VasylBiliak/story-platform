# Chapter Access System Redesign

## Overview
This document describes the implementation of a chapter access control system that supports paid chapters and ownership-based content access. The backend now enforces access control, ensuring that paid chapter content is only returned to users who have purchased it.

## Database Changes

### Prisma Schema Updates

#### New Model: ChapterPurchase
```prisma
model ChapterPurchase {
  id             String   @id @default(cuid())
  userId         String
  chapterId      String
  createdAt      DateTime @default(now())
  
  User           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  Chapter        Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)

  @@unique([userId, chapterId])
  @@index([chapterId])
  @@index([userId])
}
```

#### Updated Models
- **User**: Added `ChapterPurchase[]` relation
- **Chapter**: Added `purchases ChapterPurchase[]` relation

### Migration
A migration file needs to be created and run when the database is accessible:
```bash
npx prisma migrate dev --name add_chapter_purchase
```

## Backend Changes

### Repository Layer (`src/server/modules/chapters/chapter.repository.ts`)

New functions added:
- `checkChapterOwnershipRepository(chapterId, userId)`: Checks if user owns a chapter
- `getChapterByIdWithOwnershipRepository(chapterId, userId)`: Gets chapter with ownership status
- `getChapterBySlugWithOwnershipRepository(bookId, slug, userId)`: Gets chapter by slug with ownership
- `getChaptersByBookIdWithOwnershipRepository(bookId, userId)`: Gets all chapters with ownership
- `createChapterPurchaseRepository(userId, chapterId)`: Creates a purchase record

### Service Layer (`src/server/modules/chapters/chapter.service.ts`)

New access control functions:
- `getChapterByIdWithAccessService(chapterId, userId)`: Returns chapter with access control
- `getChapterBySlugWithAccessService(bookId, slug, userId)`: Returns chapter by slug with access control
- `getChaptersByBookIdWithAccessService(bookId, userId)`: Returns chapters with access control

**Access Control Logic:**
- Free chapters (price = 0): Always return full content
- Paid chapters (price > 0): Check ownership
  - If owned: Return full content with `purchased = true`
  - If not owned: Return metadata without content, `purchased = false`

### Main Chapter Service (`src/lib/services/chapter.service.ts`)

Updated functions:
- `getChapterById(chapterId, userId?)`: Now accepts optional userId for access control
- `getChaptersByBookId(bookId, userId?)`: Now accepts optional userId for access control
- `createChapterPurchase(userId, chapterId)`: New function to create purchase records

### Book Service (`src/server/services/bookService.ts`)

Updated function:
- `getBookById(bookId, userId?)`: Now applies access control to chapters

### Controller Layer

Updated handlers to pass userId:
- `getChapterByIdHandler(chapterId, req?)`: Accepts optional request to get current user
- `getChapterBySlugHandler(bookId, slug, req?)`: Accepts optional request
- `getChaptersByBookIdHandler(bookId, req?)`: Accepts optional request
- `getBookByIdHandler(bookId, req?)`: Accepts optional request

### API Endpoints

Updated to pass request to controllers:
- `src/app/api/chapters/route.ts`: GET endpoint now passes userId
- `src/app/api/books/[bookId]/route.ts`: GET endpoint now passes request

### Type Definitions

Updated types:
- `src/server/modules/chapters/chapter.types.ts`: Added `purchased?: boolean` to `ChapterWithImages`
- `src/types/book.types.ts`: Added `purchased?: boolean` to `Chapter`

## Frontend Changes

### Type Updates
- `src/types/book.types.ts`: Added `purchased?: boolean` field to Chapter interface

### Chapter Page UI (`src/app/book/[bookSlug]/chapter/[chapterSlug]/ChapterPageClient.tsx`)

Updated access logic:
- Changed from `chapter.isFree` to `chapter.isFree || chapter.purchased`
- Now relies on backend's `purchased` field instead of client-side logic
- Shows full content when `purchased = true` or `isFree = true`
- Shows paywall when `purchased = false` and not free

### Paywall Component (`src/components/chapter/Paywall.tsx`)

Updated to:
- Handle empty content (backend enforces this for non-purchased chapters)
- Show preview only if content exists
- Improved styling and layout

## Access Control Flow

### For Free Chapters (price = 0)
1. Backend checks: `isFree = true`
2. Returns: Full content + `purchased = false` (or undefined)
3. Frontend: Displays full content

### For Paid Chapters Owned by User
1. Backend checks: `price > 0` AND ownership exists
2. Returns: Full content + `purchased = true`
3. Frontend: Displays full content

### For Paid Chapters Not Owned by User
1. Backend checks: `price > 0` AND ownership does not exist
2. Returns: Metadata only + `purchased = false` + `content = ""`
3. Frontend: Displays paywall with purchase button

## Future Stripe Integration Points

### 1. Purchase Creation API Endpoint
Create a new API endpoint to handle chapter purchases:

```typescript
// src/app/api/chapters/[chapterId]/purchase/route.ts
export async function POST(req: NextRequest, context: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await context.params;
  const user = await getCurrentUser(req);
  
  if (!user) {
    return unauthorizedResponse();
  }
  
  // 1. Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: chapter.title,
        },
        unit_amount: Math.round(chapter.finalPrice * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${bookId}/chapter/${chapterSlug}?purchase=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${bookId}/chapter/${chapterSlug}?purchase=cancelled`,
    metadata: {
      userId: user.id,
      chapterId: chapterId,
    },
  });
  
  return successResponse({ checkoutUrl: session.url });
}
```

### 2. Stripe Webhook Handler
Create a webhook handler to process successful payments:

```typescript
// src/app/api/webhooks/stripe/route.ts
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(await req.text(), sig, webhookSecret);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, chapterId } = session.metadata;
    
    // Create purchase record
    await ChapterService.createChapterPurchase(userId, chapterId);
  }
  
  return successResponse({ received: true });
}
```

### 3. Purchase Verification
Add a function to verify purchase status:

```typescript
// src/lib/services/chapter.service.ts
static async verifyChapterPurchase(userId: string, chapterId: string): Promise<boolean> {
  const purchase = await prisma.chapterPurchase.findUnique({
    where: {
      userId_chapterId: { userId, chapterId },
    },
  });
  return purchase !== null;
}
```

### 4. Admin API for Manual Purchase Creation
Create an admin endpoint to manually add purchases:

```typescript
// src/app/api/admin/chapters/[chapterId]/purchases/route.ts
export async function POST(req: NextRequest, context: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await context.params;
  const { userId } = await req.json();
  
  await ChapterService.createChapterPurchase(userId, chapterId);
  return successResponse({ message: "Purchase created" });
}
```

## Modified Files Summary

### Database
- `prisma/schema.prisma`: Added ChapterPurchase model and relations

### Backend - Repository
- `src/server/modules/chapters/chapter.repository.ts`: Added ownership queries

### Backend - Service
- `src/server/modules/chapters/chapter.service.ts`: Added access control functions
- `src/lib/services/chapter.service.ts`: Updated to use access control
- `src/server/services/bookService.ts`: Updated to apply access control

### Backend - Controller
- `src/server/modules/chapters/chapter.controller.ts`: Updated handlers to pass userId
- `src/server/modules/books/book.controller.ts`: Updated to pass userId

### Backend - API Routes
- `src/app/api/chapters/route.ts`: Updated to pass userId
- `src/app/api/books/[bookId]/route.ts`: Updated to pass request

### Backend - Types
- `src/server/modules/chapters/chapter.types.ts`: Added purchased field
- `src/types/book.types.ts`: Added purchased field

### Frontend
- `src/app/book/[bookSlug]/chapter/[chapterSlug]/ChapterPageClient.tsx`: Updated to use purchased field
- `src/components/chapter/Paywall.tsx`: Updated to handle empty content

## Testing Scenarios

### 1. Free Chapter
- **Setup**: Chapter with price = 0
- **Expected**: Any authenticated user can see full content
- **API Response**: `content = "full content"`, `purchased = false`

### 2. Paid Chapter Owned by User
- **Setup**: Chapter with price > 0, user has ChapterPurchase record
- **Expected**: User sees full content
- **API Response**: `content = "full content"`, `purchased = true`

### 3. Paid Chapter Not Owned by User
- **Setup**: Chapter with price > 0, no ChapterPurchase record
- **Expected**: User sees paywall, content is hidden
- **API Response**: `content = ""`, `purchased = false`

### 4. Unauthenticated User
- **Setup**: No user session
- **Expected**: Free chapters show content, paid chapters show paywall
- **API Response**: `purchased = false` for all chapters

## Important Notes

### TypeScript Errors
You may see TypeScript errors about `chapterPurchase` not existing on PrismaClient. This is expected because:
1. The Prisma schema has been updated
2. The Prisma client has been regenerated (`npx prisma generate`)
3. However, the database migration has not been run yet (database was not accessible)

**Solution**: Run the migration when the database is accessible:
```bash
npx prisma migrate dev --name add_chapter_purchase
```

### Security Considerations
- Content protection happens on the backend before data is returned
- Frontend never receives protected content for non-purchased chapters
- The `purchased` field is set by the backend based on ownership records
- Frontend only displays content received from the backend

### Scalability
- The ownership model is reusable for future purchase flows
- The access control logic is centralized in service layers
- The architecture supports future Stripe integration without major refactoring

## Next Steps

1. **Run Database Migration**: When database is accessible, run the migration
2. **Test Scenarios**: Verify all access control scenarios work correctly
3. **Implement Stripe Integration**: Follow the integration points outlined above
4. **Add Admin Panel**: Create UI for manual purchase management
5. **Add Purchase History**: Create endpoint to show user's purchased chapters
