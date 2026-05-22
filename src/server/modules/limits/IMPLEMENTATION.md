# User Limits System - Implementation Guide

## Overview

This demo platform enforces automatic cleanup limits to manage resource usage:

- **3 books per user** - oldest book auto-deletes on 4th book
- **3 users per IP** - blocks registration on 4th account from same IP
- **5 chapters per book** - cannot add more chapters
- **3 images per chapter** - cannot add more images

## Architecture

### Limits Module Structure

```
src/server/modules/limits/
├── limits.config.ts         # Centralized config (FREE/PRO plans)
├── limits.types.ts          # TypeScript types
├── limits.service.ts        # Prisma queries & orchestration
├── limits.guard.ts          # Reusable guard functions
├── limits.responses.ts      # Frontend-friendly response builders
└── API_RESPONSES.md         # Response examples
```

### Modules Using Limits

```
src/app/api/books/route.ts           # Book creation with limit enforcement
src/app/api/chapters/route.ts        # Chapter creation with limit enforcement
src/components/books/BookForm.tsx    # Frontend UX with warnings
src/app/dashboard/books/             # Dashboard with limit indicators
```

## Frontend Implementation

### Book Limit Warning

When user has 3 or more books, the dashboard shows:

```
⚠️ Demo Limit Reached

You already have 3 books (maximum 3 in demo). Creating a new book 
will replace your oldest book.
```

This warning appears:
- In `BooksDashboard` component
- Before the book form
- Updates in real-time as books are added/removed

### Chapter Limit UI

The "Add Chapter" button is:
- **Disabled** when 5 chapters already exist
- **Shows explanation text**: "Maximum number of chapters reached (5)."
- In both `BookForm` and `CreateBookWithChaptersForm`

## Backend Implementation

### Book Creation Flow

```
1. User submits book form
   ↓
2. Controller calls createBookService()
   ↓
3. Service checks chapter limit (max 5 per book)
   ↓
4. Service checks image limit (max 3 per chapter)
   ↓
5. Guard function handleBookLimit() checks user's book count
   ↓
6. If count >= 3:
   - Find oldest book
   - Delete oldest book (cascades to chapters → images)
   - Create new book
   ↓
7. Return response with replacedBookId or createdBook
```

### API Response Examples

**Book Created Successfully:**
```json
{
  "message": "Book created successfully.",
  "maxBooks": 3,
  "createdBook": { ... }
}
```

**Book Limit Reached (Oldest Replaced):**
```json
{
  "message": "Book limit reached. Your oldest book was replaced because this is a demo environment.",
  "maxBooks": 3,
  "replacedBookId": "old-book-id",
  "createdBook": { ... }
}
```

**Chapter Limit Error:**
```json
{
  "error": "Chapter limit reached",
  "message": "Maximum number of chapters per book is 5."
}
```

**Image Limit Error:**
```json
{
  "error": "Image limit reached",
  "message": "Maximum number of images per chapter is 3."
}
```

## Cleanup Behavior

### Book Deletion Cascade

When oldest book is deleted:

```
1. deleteBookById(bookId)
   ↓
2. Get all chapters for book
   ↓
3. For each chapter:
   - Call deleteChapterImages() (removes from Supabase Storage)
   - Delete chapter from DB
   ↓
4. Delete book from DB
```

### Image Cleanup

When deleting a chapter image:

```
1. Get image record with URL
   ↓
2. Extract storage path from Supabase public URL
   ↓
3. Call supabase.storage.from('book-images').remove([path])
   ↓
4. Delete image record from DB
```

No orphaned files remain in Supabase Storage.

## Configuration (Scalable for Future Plans)

### Current Configuration

```typescript
export const LIMITS: LimitsConfig = {
  FREE: {
    user: { maxBooks: 3 },
    ip: { maxUsersPerIp: 3 },
    chapter: {
      maxChaptersPerBook: 5,
      maxImagesPerChapter: 3,
    },
  },
  PRO: {
    user: { maxBooks: 100 },
    ip: { maxUsersPerIp: 100 },
    chapter: {
      maxChaptersPerBook: 100,
      maxImagesPerChapter: 20,
    },
  },
};
```

### Future Extensibility

To add PRO plan support:

1. Add `plan: 'FREE' | 'PRO'` to User model (Prisma)
2. Pass plan to guard functions: `handleBookLimit(userId, userPlan)`
3. PRO users get higher limits automatically

## Vercel Serverless Compatibility

All limits operations are:
- ✅ Database-only (no filesystem)
- ✅ Transaction-safe (Prisma $transaction)
- ✅ Stateless (no in-memory state)
- ✅ Timeout-safe (completes in <1s)
- ✅ Environment-agnostic (works on Vercel, local, etc.)

## Testing Scenarios

### Scenario 1: Book Limit
1. Create Book 1
2. Create Book 2
3. Create Book 3
4. Create Book 4
   → Book 1 auto-deletes
   → Book 4 created
   → Response includes `replacedBookId`

### Scenario 2: Chapter Limit
1. Create book with 5 chapters
2. Try to add 6th chapter
   → Error: "Maximum number of chapters per book is 5."
   → UI button disabled

### Scenario 3: Image Limit
1. Add 3 images to chapter
2. Try to add 4th image
   → Error: "Maximum number of images per chapter is 3."

### Scenario 4: IP Limit
1. User 1 registers from IP 192.168.1.1
2. User 2 registers from IP 192.168.1.1
3. User 3 registers from IP 192.168.1.1
4. User 4 tries to register from IP 192.168.1.1
   → Error: "This demo allows only 3 accounts per IP address."

## Files Modified

### Backend
- `src/server/modules/limits/limits.config.ts` ✅ Created
- `src/server/modules/limits/limits.types.ts` ✅ Created
- `src/server/modules/limits/limits.service.ts` ✅ Created
- `src/server/modules/limits/limits.guard.ts` ✅ Created
- `src/server/modules/limits/limits.responses.ts` ✅ Created
- `src/server/modules/books/book.service.ts` ✅ Updated
- `src/server/modules/books/book.controller.ts` ✅ Updated
- `src/server/modules/books/book.cleanup.ts` ✅ Updated
- `src/server/modules/chapters/chapter.cleanup.ts` ✅ Updated
- `src/app/api/chapters/route.ts` ✅ Updated
- `prisma/schema.prisma` ✅ Updated (added `ip` field)

### Frontend
- `src/app/dashboard/books/BooksDashboard.tsx` ✅ Updated
- `src/components/books/BookForm.tsx` ✅ Updated
- `src/components/forms/CreateBookWithChaptersForm.tsx` ✅ Updated

## Next Steps

1. **Run Prisma Migration**: `npx prisma migrate dev --name add-user-ip`
2. **Test Book Limit**: Create 4 books and verify oldest deletes
3. **Test Chapter Limit**: Create 6 chapters and verify error
4. **Test Image Limit**: Add 4 images and verify error
5. **Test IP Limit**: Register 4 accounts from same IP
6. **Verify Supabase Cleanup**: Confirm no orphaned images

## Questions?

Refer to the `API_RESPONSES.md` file for exact response structures.
