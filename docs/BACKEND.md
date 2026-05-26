# Backend Documentation

## Overview

The Story Platform backend is built with Next.js API Routes, TypeScript, Prisma ORM, and Supabase. It follows a modular architecture with clear separation of concerns across controllers, services, repositories, validators, and cleanup modules.

## Tech Stack

- **Framework**: Next.js 16.2.0 (App Router API Routes)
- **Language**: TypeScript 5
- **ORM**: Prisma 5.22.0
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Zod 3.23.2
- **Password Hashing**: bcryptjs 3.0.3

## Project Structure

```
src/
├── app/api/                    # API Routes (Next.js App Router)
│   ├── auth/                   # Authentication endpoints
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   ├── register/route.ts
│   │   └── me/route.ts
│   ├── books/                  # Book endpoints
│   │   ├── route.ts            # GET (list), POST (create)
│   │   └── [bookId]/route.ts   # GET, PUT, DELETE
│   ├── chapters/               # Chapter endpoints
│   │   └── route.ts            # GET (list), POST (create)
│   └── user/                   # User endpoints
│       └── route.ts            # GET (current user)
├── server/                     # Backend modules
│   ├── controllers/            # Route handlers
│   ├── core/                   # Core utilities
│   │   └── errors/             # Custom error classes
│   ├── middlewares/            # Request middleware
│   ├── modules/                # Feature modules
│   │   ├── books/              # Book module
│   │   ├── chapters/           # Chapter module
│   │   └── limits/             # Limits module
│   ├── prisma.ts               # Prisma client singleton
│   ├── repositories/           # Data access layer
│   ├── services/               # Business logic layer
│   ├── utils/                  # Utility functions
│   └── jwt.ts                  # JWT utilities
├── lib/                        # Shared utilities
│   ├── auth.ts                 # Auth utilities (hash, verify, sign)
│   ├── getCurrentUser.ts       # Current user extraction
│   ├── supabase.ts             # Supabase client
│   └── upload.ts               # Upload utilities
└── prisma/
    └── schema.prisma           # Database schema
```

## Backend Architecture

### Modular Structure

The backend follows a layered modular architecture with clear separation of concerns:

```
API Route (app/api/*)
    ↓
Controller (server/controllers/*)
    ↓
Service (server/services/*)
    ↓
Repository (server/repositories/*)
    ↓
Prisma (Database)
```

**Alternative Flow (Feature Modules):**

```
API Route (app/api/*)
    ↓
Module Service (server/modules/*/module.service.ts)
    ↓
Module Parser (server/modules/*/module.parser.ts)
    ↓
Module Validator (server/modules/*/module.validator.ts)
    ↓
Module Permissions (server/modules/*/module.permissions.ts)
    ↓
Module Mapper (server/modules/*/module.mapper.ts)
    ↓
Repository (server/repositories/*)
    ↓
Prisma (Database)
```

### Architecture Decisions

**Why Modular Architecture?**
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Each layer can be tested independently
- **Maintainability**: Changes in one layer don't affect others
- **Reusability**: Services and repositories can be reused across routes
- **Scalability**: Easy to add new features following existing patterns

**Why Feature Modules?**
- **Coherence**: All book-related code is in one place
- **Discoverability**: Easy to find all code for a feature
- **Encapsulation**: Module-specific logic is isolated
- **Consistency**: Each module follows the same pattern

## Authentication

### JWT Authentication Flow

**Token Management:**
- JWT tokens stored in HTTP-only cookies
- Token expiration: 7 days
- Secret: `JWT_SECRET` environment variable

**Authentication Utilities**

**Location:** `src/lib/auth.ts`

```typescript
// Hash password
hashPassword(password: string): Promise<string>

// Verify password
comparePassword(password: string, hash: string): Promise<boolean>

// Sign JWT token
signToken(payload: JwtPayload): string

// Verify JWT token
verifyToken(token: string): JwtPayload | null
```

**Current User Extraction**

**Location:** `src/lib/getCurrentUser.ts`

```typescript
export async function getCurrentUser(req: NextRequest): Promise<CurrentUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return user;
}
```

**Token Extraction Middleware**

**Location:** `src/server/middlewares/authMiddleware.ts`

```typescript
export function getTokenFromRequest(req: NextRequest): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const tokenCookie = cookies.find((c) => c.startsWith("token="));

  if (!tokenCookie) return null;

  return tokenCookie.substring("token=".length);
}
```

### Auth Endpoints

#### POST /api/auth/register

**Location:** `src/app/api/auth/register/route.ts`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

**Flow:**
1. Validate input (name, email, password)
2. Check if email already exists
3. Hash password with bcrypt
4. Create user in database
5. Sign JWT token
6. Set HTTP-only cookie
7. Return user data

#### POST /api/auth/login

**Location:** `src/app/api/auth/login/route.ts`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Flow:**
1. Validate input (email, password)
2. Find user by email
3. Compare password hash
4. Sign JWT token
5. Set HTTP-only cookie
6. Return user data

#### POST /api/auth/logout

**Location:** `src/app/api/auth/logout/route.ts`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Flow:**
1. Clear HTTP-only cookie
2. Return success message

#### GET /api/auth/me

**Location:** `src/app/api/auth/me/route.ts`

**Response (Authenticated):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "success": false,
  "error": "Not authenticated"
}
```

**Flow:**
1. Extract token from cookie
2. Verify token
3. Fetch user from database
4. Return user data

### Protected Routes

**Middleware Pattern:**
```typescript
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return unauthorizedResponse();
  }
  // Proceed with authenticated logic
}
```

**Response Helper:**
```typescript
import { unauthorizedResponse } from "@/lib/api-response";

return unauthorizedResponse(); // Returns 401 with error message
```

## Prisma Models

### Schema Overview

**Location:** `prisma/schema.prisma`

**Database:** PostgreSQL (Supabase)

### User Model

```prisma
model User {
  id        String     @id @default(uuid())
  email     String     @unique
  name      String
  password  String     
  createdAt DateTime   @default(now())

  Book      Book[]
  Purchase  Purchase[]
}
```

**Fields:**
- `id` - UUID primary key
- `email` - Unique email address
- `name` - User display name
- `password` - Bcrypt hashed password
- `createdAt` - Account creation timestamp

**Relationships:**
- `Book[]` - Books owned by user
- `Purchase[]` - Purchases made by user

**Indexes:**
- Unique index on `email`

### Book Model

```prisma
model Book {
  id          String     @id @default(cuid())
  title       String
  author      String
  description String
  cover       String
  price       Float      @default(0)
  createdAt   DateTime   @default(now())
  ownerId     String?
  User        User?      @relation(fields: [ownerId], references: [id])
  chapters    Chapter[]
  Purchase    Purchase[]

  @@index([ownerId])
}
```

**Fields:**
- `id` - CUID primary key
- `title` - Book title
- `author` - Author name
- `description` - Book description
- `cover` - Cover image URL (Supabase Storage)
- `price` - Book price (default: 0)
- `createdAt` - Creation timestamp
- `ownerId` - Foreign key to User (nullable for public books)

**Relationships:**
- `User?` - Owner of the book (optional)
- `chapters[]` - Chapters in the book
- `Purchase[]` - Purchases of this book

**Indexes:**
- Index on `ownerId` for efficient user book queries

**Cascade Behavior:**
- Chapters cascade delete when book deleted
- Purchases cascade delete when book deleted

### Chapter Model

```prisma
model Chapter {
  id          String   @id @default(cuid())
  title       String
  content     String
  slug        String
  createdAt   DateTime @default(now())
  price       Float    @default(0)
  discount    Float?   @default(0)
  bookId      String
  book        Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  images      ChapterImage[]

  @@index([bookId])
}
```

**Fields:**
- `id` - CUID primary key
- `title` - Chapter title
- `content` - Chapter content (text)
- `slug` - URL-friendly slug
- `createdAt` - Creation timestamp
- `price` - Chapter price (default: 0)
- `discount` - Discount percentage (0-100, nullable)
- `bookId` - Foreign key to Book

**Relationships:**
- `book` - Parent book
- `images[]` - Images in the chapter

**Indexes:**
- Index on `bookId` for efficient chapter queries

**Cascade Behavior:**
- Images cascade delete when chapter deleted
- Chapter cascade delete when parent book deleted

### ChapterImage Model

```prisma
model ChapterImage {
  id        String   @id @default(cuid())
  url       String?
  caption   String?
  chapterId String
  chapter   Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)

  @@index([chapterId])
}
```

**Fields:**
- `id` - CUID primary key
- `url` - Image URL (Supabase Storage)
- `caption` - Image caption (nullable)
- `chapterId` - Foreign key to Chapter

**Relationships:**
- `chapter` - Parent chapter

**Indexes:**
- Index on `chapterId` for efficient image queries

**Cascade Behavior:**
- Image cascade delete when parent chapter deleted

### Purchase Model

```prisma
model Purchase {
  id        String   @id
  createdAt DateTime @default(now())
  userId    String
  bookId    String
  Book      Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  User      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, bookId])
  @@index([bookId])
  @@index([userId])
}
```

**Fields:**
- `id` - Composite key (userId_bookId)
- `createdAt` - Purchase timestamp
- `userId` - Foreign key to User
- `bookId` - Foreign key to Book

**Relationships:**
- `Book` - Purchased book
- `User` - Purchasing user

**Indexes:**
- Unique constraint on `[userId, bookId]` - prevents duplicate purchases
- Index on `bookId` for efficient purchase queries
- Index on `userId` for efficient user purchase queries

**Cascade Behavior:**
- Purchase cascade delete when user deleted
- Purchase cascade delete when book deleted

## API Routes

### Books API

#### GET /api/books

**Location:** `src/app/api/books/route.ts`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 8)
- `ownerId` - Filter by owner ID
- `search` - Search query (searches title and author)
- `sort` - Sort order ('newest' | 'oldest')

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "title": "Book Title",
      "author": "Author Name",
      "description": "Description",
      "cover": "https://...",
      "price": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "ownerId": "uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 25,
    "hasMore": true
  }
}
```

**Flow:**
1. Extract query parameters
2. Build Prisma query with filters and pagination
3. Execute query
4. Return paginated results

#### POST /api/books

**Location:** `src/app/api/books/route.ts`

**Request:** Multipart/form-data

```typescript
FormData {
  book: JSON.stringify({
    title: string,
    description: string,
    cover: string (base64),
    author: string,
    chapters: [
      {
        title: string,
        slug: string,
        content: string,
        isFree: boolean,
        price: number,
        discount: number,
        images: [
          {
            url: string (base64),
            caption: string
          }
        ]
      }
    ]
  }),
  chapterImages_0_0: File,  // Chapter 0, Image 0
  chapterImages_0_1: File,  // Chapter 0, Image 1
  // ...
  replaceBookId?: string    // Optional: Book to replace
}
```

**Response (Success):**
```json
{
  "message": "Book created successfully.",
  "maxBooks": 3,
  "createdBook": {
    "id": "cuid",
    "title": "Book Title",
    // ... book fields
  }
}
```

**Response (Limit Reached - Requires Replacement):**
```json
{
  "error": "Book limit reached",
  "message": "You already reached the maximum of 3 books available in the demo version.",
  "requiresReplacement": true,
  "maxBooks": 3,
  "books": [
    {
      "id": "cuid",
      "title": "Book Title",
      "cover": "https://...",
      "author": "Author Name",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```
**Status:** 409 Conflict

**Response (With Replacement):**
```json
{
  "message": "Book created successfully.",
  "maxBooks": 3,
  "createdBook": { /* ... */ }
}
```

**Flow:**
1. Authenticate user
2. Validate content-type (multipart/form-data)
3. Parse and validate form data
4. Validate book schema with Zod
5. Enforce chapter limit (max 5)
6. Enforce image limit (max 3 per chapter)
7. Check if `replaceBookId` provided:
   - If yes: Verify ownership, delete book with cleanup
   - If no: Check book limit, return 409 if reached
8. Upload chapter images to Supabase Storage
9. Create book with chapters in database
10. Return created book

#### GET /api/books/[bookId]

**Location:** `src/app/api/books/[bookId]/route.ts`

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "title": "Book Title",
    "author": "Author Name",
    "description": "Description",
    "cover": "https://...",
    "price": 0,
    "createdAt": "2024-01-01T00:00:00Z",
    "ownerId": "uuid",
    "chapters": [
      {
        "id": "cuid",
        "title": "Chapter Title",
        "content": "Chapter content",
        "slug": "chapter-slug",
        "isFree": true,
        "price": 0,
        "discount": 0,
        "images": [
          {
            "id": "cuid",
            "url": "https://...",
            "caption": "Caption"
          }
        ]
      }
    ]
  }
}
```

**Flow:**
1. Parse bookId from URL
2. Fetch book with chapters and images
3. Return book data

#### PUT /api/books/[bookId]

**Location:** `src/app/api/books/[bookId]/route.ts`

**Request:** Same format as POST

**Response (Success):**
```json
{
  "success": true,
  "data": {
    // Updated book data
  }
}
```

**Flow:**
1. Authenticate user
2. Verify book ownership
3. Parse and validate form data
4. Upload new images
5. Update book in database
6. Return updated book

#### DELETE /api/books/[bookId]

**Location:** `src/app/api/books/[bookId]/route.ts`

**Response (Success):**
```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

**Flow:**
1. Authenticate user
2. Verify book ownership
3. Delete book relations (chapters, images, storage)
4. Delete book from database
5. Return success message

### Chapters API

#### GET /api/chapters

**Location:** `src/app/api/chapters/route.ts`

**Query Parameters:**
- `bookId` - Filter by book ID

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "title": "Chapter Title",
      "content": "Content",
      "slug": "slug",
      "isFree": true,
      "price": 0,
      "discount": 0,
      "bookId": "cuid"
    }
  ]
}
```

**Flow:**
1. Extract query parameters
2. Build Prisma query
3. Execute query
4. Return chapters

#### POST /api/chapters

**Location:** `src/app/api/chapters/route.ts`

**Request:**
```json
{
  "title": "Chapter Title",
  "content": "Chapter content",
  "slug": "chapter-slug",
  "isFree": true,
  "price": 0,
  "discount": 0,
  "bookId": "cuid"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    // ... chapter fields
  }
}
```

**Flow:**
1. Authenticate user
2. Validate input
3. Verify book ownership
4. Create chapter in database
5. Return created chapter

### User API

#### GET /api/user/me

**Location:** `src/app/api/user/route.ts`

**Response (Authenticated):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "success": false,
  "error": "Not authenticated"
}
```

**Flow:**
1. Extract token from cookie
2. Verify token
3. Fetch user from database
4. Return user data

## Upload System

### Supabase Storage Integration

**Location:** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Upload Utilities

**Location:** `src/lib/upload.ts`

**Configuration:**
```typescript
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const BUCKET_NAME = "book-images";
```

**Functions:**

**validateFile(file: File)**
- Validates file type (JPEG, PNG, WebP)
- Validates file size (max 2MB)
- Returns validation result

**generateUniqueFilename(originalName: string)**
- Generates UUID-based filename
- Preserves original extension

**uploadFile(file: File)**
- Validates file
- Uploads to Supabase Storage
- Returns public URL

**uploadMultipleFiles(files: File[])**
- Uploads multiple files in parallel
- Returns array of uploaded file data

### Upload Service

**Location:** `src/lib/services/upload.service.ts`

**Methods:**

**uploadSingle(file: File)**
- Wraps uploadFile with error handling

**uploadMultiple(files: File[])**
- Wraps uploadMultipleFiles with error handling

**uploadChapterImages(chapterImages: File[][])**
- Uploads images for multiple chapters
- Returns 2D array of uploaded files

**validateFiles(files: File[])**
- Validates multiple files
- Returns aggregated errors

**validateChapterImages(chapterImages: File[][])**
- Validates chapter images
- Returns errors with chapter/image indices

### Upload Flow

**Book Cover Upload:**
1. User selects image file
2. Frontend validates (type, size)
3. Converts to base64 for preview
4. On form submit, converts back to File
5. Backend validates again
6. Uploads to Supabase Storage
7. Stores public URL in database

**Chapter Images Upload:**
1. User selects multiple images per chapter
2. Frontend validates (max 3 per chapter)
3. Converts to base64 for preview
4. On form submit, converts back to File objects
5. Backend validates again
6. Uploads to Supabase Storage in parallel
7. Stores public URLs in database

**Storage Path:**
- Bucket: `book-images`
- Filename: `{uuid}.{extension}`
- Public URL: `https://{project}.supabase.co/storage/v1/object/public/book-images/{filename}`

## Limits System

### Configuration

**Location:** `src/server/modules/limits/limits.config.ts`

```typescript
export const LIMITS: LimitsConfig = {
  FREE: {
    user: {
      maxBooks: 3,
    },
    chapter: {
      maxChaptersPerBook: 5,
      maxImagesPerChapter: 3,
    },
  },
  PRO: {
    user: {
      maxBooks: 100,
    },
    chapter: {
      maxChaptersPerBook: 100,
      maxImagesPerChapter: 20,
    },
  },
};
```

### Limits Service

**Location:** `src/server/modules/limits/limits.service.ts`

**Methods:**

**getPlan(userPlan: PlanType)**
- Returns limit configuration for plan

**countBooksByUser(userId: string)**
- Counts books owned by user

**getOldestBookByUser(userId: string)**
- Gets oldest book for user (by createdAt)

**deleteBookById(bookId: string)**
- Deletes book with full cleanup
- Uses book.cleanup module

**countChaptersByBook(bookId: string)**
- Counts chapters in a book

**getOldestChapterByBook(bookId: string)**
- Gets oldest chapter in a book

**deleteChapterById(chapterId: string)**
- Deletes chapter with full cleanup
- Uses chapter.cleanup module

**countImagesByChapter(chapterId: string)**
- Counts images in a chapter

**getOldestImageByChapter(chapterId: string)**
- Gets oldest image in a chapter

**deleteImageById(imageId: string)**
- Deletes image with storage cleanup
- Uses chapter.cleanup module

### Limits Guard

**Location:** `src/server/modules/limits/limits.guard.ts`

**Functions:**

**checkBookLimit(userId: string, plan: PlanType = 'FREE')**
- Checks if user has reached book limit
- Does NOT delete any books
- Returns user's books if limit reached
- Used for replacement flow

```typescript
const limitCheck = await checkBookLimit(user.id);
if (limitCheck.limitReached) {
  return {
    limitReached: true,
    maxBooks: limitCheck.maxBooks,
    books: limitCheck.books,  // User's existing books
  };
}
```

**handleBookLimit(userId: string, plan: Type = 'FREE')**
- Checks if user has reached book limit
- Automatically deletes oldest book if limit reached
- Returns metadata about deleted book
- Used for automatic cleanup (legacy)

```typescript
const limitResult = await handleBookLimit(user.id);
if (limitResult) {
  return {
    message: 'Book limit reached. Oldest book was removed.',
    replacedBook: limitResult.replacedBook,
  };
}
```

### Backend Validation Logic

**Book Limit (3 books):**
```typescript
// Check limit without deletion
const limitCheck = await checkBookLimit(user.id);
if (limitCheck.limitReached) {
  return new Response(
    JSON.stringify({
      error: "Book limit reached",
      message: "You already reached the maximum of 3 books available in the demo version.",
      requiresReplacement: true,
      maxBooks: limitCheck.maxBooks,
      books: limitCheck.books,
    }),
    { status: 409, headers: { 'Content-Type': 'application/json' } }
  );
}
```

**Chapter Limit (5 per book):**
```typescript
if (chapters.length > 5) {
  return errorResponse("Maximum number of chapters per book is 5.", 400);
}
```

**Image Limit (3 per chapter):**
```typescript
if (chapters.some((c: any) => c.images && c.images.length > 3)) {
  return errorResponse("Maximum number of images per chapter is 3.", 400);
}
```

**Replacement Validation:**
```typescript
if (replaceBookId) {
  const bookToDelete = await prisma.book.findUnique({
    where: { id: replaceBookId },
    select: { ownerId: true },
  });

  if (!bookToDelete) {
    return errorResponse("Book to replace not found", 404);
  }

  if (bookToDelete.ownerId !== user.id) {
    return errorResponse("You can only replace your own books", 403);
  }

  await deleteBookRelations(replaceBookId);
  await prisma.book.delete({ where: { id: replaceBookId } });
}
```

## Cleanup System

### Book Cleanup

**Location:** `src/server/modules/books/book.cleanup.ts`

**Purpose:** Handles cleanup operations related to books

**Responsibilities:**
- Deletes all chapters related to a book
- Deletes all chapter images related to chapters
- Keeps delete logic isolated from controller/service layers

**Rules:**
- Do NOT handle HTTP responses here
- Do NOT validate requests here
- Do NOT implement business permissions here

**Function:**

**deleteBookRelations(bookId: string)**
```typescript
export async function deleteBookRelations(bookId: string): Promise<void> {
  // Get all chapters for the book
  const chapters = await prisma.chapter.findMany({
    where: { bookId },
    select: { id: true },
  });
  
  const chapterIds = chapters.map(({ id }) => id);
  
  // Delete images for each chapter
  for (const chapterId of chapterIds) {
    await deleteChapterImages(chapterId);
  }
  
  // Delete chapters
  if (chapterIds.length > 0) {
    await prisma.chapter.deleteMany({
      where: { id: { in: chapterIds } },
    });
  }
}
```

### Chapter Cleanup

**Location:** `src/server/modules/chapters/chapter.cleanup.ts`

**Purpose:** Handles cleanup operations related to chapters

**Responsibilities:**
- Deletes all images related to a chapter
- Cleans up Supabase Storage

**Rules:**
- Do NOT handle HTTP responses here
- Do NOT validate requests here
- Do NOT implement business permissions here

**Functions:**

**deleteChapterImageWithStorage(imageId: string)**
- Deletes single image from Supabase Storage
- Deletes image record from database

```typescript
export async function deleteChapterImageWithStorage(imageId: string): Promise<void> {
  const image = await prisma.chapterImage.findUnique({ where: { id: imageId } });
  
  if (image && image.url) {
    // Extract storage path from public URL
    const url = new URL(image.url);
    const path = url.pathname.replace(/^\/storage\/v1\/object\/public\/book-images\//, '');
    
    if (path) {
      await supabase.storage.from('book-images').remove([path]);
    }
  }
  
  await prisma.chapterImage.delete({ where: { id: imageId } });
}
```

**deleteChapterImages(chapterId: string)**
- Deletes all images for a chapter
- Cleans up Supabase Storage

```typescript
export async function deleteChapterImages(chapterId: string): Promise<void> {
  const images = await prisma.chapterImage.findMany({ where: { chapterId } });
  
  for (const image of images) {
    if (image.url) {
      const url = new URL(image.url);
      const path = url.pathname.replace(/^\/storage\/v1\/object\/public\/book-images\//, '');
      
      if (path) {
        await supabase.storage.from('book-images').remove([path]);
      }
    }
    
    await prisma.chapterImage.delete({ where: { id: image.id } });
  }
}
```

### Orphan Prevention

**Database Cascade:**
- Prisma schema uses `onDelete: Cascade` for relationships
- This ensures database-level orphan prevention

**Storage Cleanup:**
- Cleanup modules explicitly delete from Supabase Storage
- Prevents orphaned files in storage

**Transaction Safety:**
- Cleanup operations are atomic
- If database delete fails, storage cleanup is not attempted
- If storage cleanup fails, database record is still deleted (manual cleanup may be needed)

## Error Handling

### Custom Error Classes

**Location:** `src/server/core/errors/AppError.ts`

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, 400);
  }
}
```

### API Response Helpers

**Location:** `src/lib/api-response.ts`

```typescript
export function successResponse<T>(data: T, status: number = 200): Response {
  return new Response(
    JSON.stringify({ success: true, data }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

export function errorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

export function unauthorizedResponse(): Response {
  return errorResponse("Unauthorized", 401);
}

export function serverErrorResponse(): Response {
  return errorResponse("Internal server error", 500);
}
```

### Validation Errors

**Zod Validation:**
```typescript
const parseResult = bookCreateSchema.safeParse(bookData);
if (!parseResult.success) {
  return errorResponse(
    parseResult.error.errors[0]?.message ?? "Invalid input",
    400
  );
}
```

**Custom Validation:**
```typescript
if (chapters.length > 5) {
  return errorResponse("Maximum number of chapters per book is 5.", 400);
}
```

### Demo Limit Responses

**409 Conflict (Book Limit):**
```typescript
return new Response(
  JSON.stringify({
    error: "Book limit reached",
    message: "You already reached the maximum of 3 books available in the demo version.",
    requiresReplacement: true,
    maxBooks: 3,
    books: userBooks,
  }),
  { status: 409, headers: { 'Content-Type': 'application/json' } }
);
```

**403 Forbidden (Ownership):**
```typescript
if (bookToDelete.ownerId !== user.id) {
  return errorResponse("You can only replace your own books", 403);
}
```

**404 Not Found:**
```typescript
if (!bookToDelete) {
  return errorResponse("Book to replace not found", 404);
}
```

## Module Structure

### Books Module

**Location:** `src/server/modules/books/`

**Files:**
- `book.service.ts` - Service layer orchestration
- `book.controller.ts` - Route handlers
- `book.parser.ts` - Request parsing
- `book.validator.ts` - Data validation
- `book.permissions.ts` - Permission checks
- `book.mapper.ts` - Data mapping
- `book.cleanup.ts` - Cleanup operations
- `utils/extractChapterImages.ts` - Image extraction utility
- `utils/parseMultipartBook.ts` - Multipart parsing utility

**Pattern:**
1. Controller receives request
2. Parser extracts data
3. Validator validates data
4. Permissions checks ownership
5. Mapper transforms data
6. Service calls repository
7. Cleanup handles deletion

### Chapters Module

**Location:** `src/server/modules/chapters/`

**Files:**
- `chapter.service.ts` - Service layer
- `chapter.controller.ts` - Route handlers
- `chapter.parser.ts` - Request parsing
- `chapter.validation.ts` - Data validation
- `chapter.permissions.ts` - Permission checks
- `chapter.mapper.ts` - Data mapping
- `chapter.repository.ts` - Data access
- `chapter.cleanup.ts` - Cleanup operations
- `chapter.types.ts` - TypeScript types

**Pattern:** Same as books module

### Limits Module

**Location:** `src/server/modules/limits/`

**Files:**
- `limits.config.ts` - Limit configuration
- `limits.service.ts` - Limit checking service
- `limits.guard.ts` - Limit enforcement
- `limits.types.ts` - TypeScript types
- `limits.responses.ts` - Response helpers

**Pattern:**
- Configuration defines limits
- Service checks limits
- Guard enforces limits
- Responses format limit errors

## Repository Layer

**Location:** `src/server/repositories/`

**Purpose:** Direct database access layer

**Files:**
- `bookRepository.ts` - Book data access
- `chapterRepository.ts` - Chapter data access
- `userRepository.ts` - User data access
- `purchaseRepository.ts` - Purchase data access

**Pattern:**
```typescript
export async function createBook(data: BookCreateInput) {
  return prisma.book.create({ data });
}

export async function getBookById(id: string) {
  return prisma.book.findUnique({ where: { id } });
}

export async function updateBook(id: string, data: BookUpdateInput) {
  return prisma.book.update({ where: { id }, data });
}

export async function deleteBook(id: string) {
  return prisma.book.delete({ where: { id } });
}
```

## Service Layer

**Location:** `src/server/services/`

**Purpose:** Business logic orchestration

**Files:**
- `bookService.ts` - Book business logic
- `chapterService.ts` - Chapter business logic
- `authService.ts` - Authentication business logic
- `uploadService.ts` - Upload business logic

**Pattern:**
```typescript
export async function createBook(data: BookCreateInput) {
  // Validate
  const validated = validateBookData(data);
  
  // Check permissions
  await ensureBookOwnership(data.ownerId);
  
  // Check limits
  await checkBookLimit(data.ownerId);
  
  // Create
  return bookRepository.create(validated);
}
```

## Validation Layer

### Zod Schemas

**Location:** `src/lib/validators/`

**book.ts**
```typescript
export const bookCreateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  cover: z.string().url(),
  author: z.string().min(1).max(100),
  chapters: z.array(chapterSchema).max(5),
});
```

**chapter.ts**
```typescript
export const chapterSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  isFree: z.boolean(),
  price: z.number().min(0),
  discount: z.number().min(0).max(100).optional(),
  images: z.array(imageSchema).max(3),
});
```

### Module Validators

**Location:** `src/server/modules/*/validator.ts`

**Pattern:**
```typescript
export function validateBookPayload(data: any): BookCreateInput {
  // Custom validation logic
  // Business rule enforcement
  // Data transformation
  return validatedData;
}
```

## Middleware

**Location:** `src/server/middlewares/`

**authMiddleware.ts**
- Extracts JWT token from cookie
- Verifies token
- Returns user ID or null

**Usage:**
```typescript
import { getTokenFromRequest } from "@/server/middlewares/authMiddleware";

const token = getTokenFromRequest(req);
if (!token) {
  return unauthorizedResponse();
}
```

## Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct PostgreSQL connection string (for migrations)
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional:**
- `NODE_ENV` - Environment (development/production)

## Security Considerations

### Password Security
- Passwords hashed with bcrypt (10 rounds)
- Never store plain text passwords
- Hash comparison uses bcrypt.compare()

### JWT Security
- JWT tokens stored in HTTP-only cookies
- Token expiration: 7 days
- Secret key from environment variable
- Token verification on every protected request

### Input Validation
- All inputs validated with Zod schemas
- Character limits enforced
- File type and size validation
- SQL injection prevention via Prisma ORM

### Authorization
- Ownership checks before modifications
- User can only modify their own books
- User can only replace their own books
- 403 Forbidden for unauthorized access

### CORS
- Next.js handles CORS automatically
- Same-origin policy enforced

### Rate Limiting
- Not currently implemented
- Consider adding for production

## Performance Considerations

### Database Queries
- Indexed fields for common queries
- Pagination to limit result sets
- Selective field selection to reduce data transfer

### File Uploads
- Parallel upload for multiple images
- File size limits (2MB)
- Supabase Storage CDN for fast delivery

### Caching
- Not currently implemented
- Consider adding Redis for session caching
- Consider adding CDN caching for static assets

### Connection Pooling
- Prisma manages connection pooling
- Configured via DATABASE_URL

## Testing

### Manual Testing

**Authentication:**
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Book Creation:**
```bash
# Create book (multipart)
curl -X POST http://localhost:3000/api/books \
  -F "book={\"title\":\"Test Book\",\"author\":\"Test\",\"cover\":\"data:image/jpeg;base64,...\"}" \
  -F "chapterImages_0_0=@image.jpg"
```

**Book Limits:**
```bash
# Create 4th book to trigger replacement flow
# Should return 409 with book list
```

### Unit Testing

Not currently implemented. Consider adding:
- Jest for unit tests
- Supertest for API tests
- Prisma test database

## Troubleshooting

### Common Issues

**Database Connection Failed:**
- Verify DATABASE_URL is correct
- Check Supabase project status
- Verify network connectivity

**JWT Verification Failed:**
- Verify JWT_SECRET is set
- Check token expiration
- Verify cookie is being sent

**File Upload Failed:**
- Verify Supabase credentials
- Check bucket exists
- Verify file size limits
- Check network connectivity

**Limit Check Failed:**
- Verify Prisma indexes are created
- Check database connection
- Verify user ID is correct

**Cleanup Failed:**
- Verify Supabase Storage credentials
- Check file paths in database
- Verify bucket permissions

## Development Notes

### Prisma Migrations

**Generate migration:**
```bash
npx prisma migrate dev --name migration_name
```

**Apply migration:**
```bash
npx prisma migrate deploy
```

**Generate client:**
```bash
npx prisma generate
```

**Reset database:**
```bash
npx prisma migrate reset
```

### Debugging

**Enable Prisma logging:**
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

**API logging:**
```typescript
console.log("[API] POST books error:", error);
```

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js rules
- Prettier for formatting (if configured)
