# Architecture Documentation

## Overview

The Story Platform follows a modern full-stack architecture with clear separation between frontend and backend. The system uses Next.js App Router for both frontend rendering and API routes, Prisma ORM for database operations, and Supabase for database hosting and file storage.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  LocalBooks  │  │  AuthContext │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Frontend (App Router)                     │   │
│  │  • Pages (book, chapter, dashboard, auth)            │   │
│  │  • Components (BookForm, BookCard, etc.)              │   │
│  │  • Hooks (useBooksPagination, useAuth, etc.)         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Backend (API Routes)                     │   │
│  │  • /api/auth/* (authentication)                      │   │
│  │  • /api/books/* (book CRUD)                          │   │
│  │  • /api/chapters/* (chapter CRUD)                    │   │
│  │  • /api/user/* (user data)                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  Supabase DB    │  │ Supabase Storage│  │  HTTP-only      │
│  (PostgreSQL)   │  │  (File Storage) │  │  Cookies        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 16.2.0 (App Router)
- React 19.2.4
- TypeScript 5
- Framer Motion 12.38.0 (animations)
- Tailwind CSS 4.2.2 (styling)

**Backend:**
- Next.js API Routes
- Prisma 5.22.0 (ORM)
- PostgreSQL (Supabase)
- JWT (authentication)
- bcryptjs (password hashing)
- Zod 3.23.2 (validation)

**Infrastructure:**
- Vercel (hosting)
- Supabase (database & storage)
- HTTP-only cookies (session management)

## Frontend/Backend Interaction

### Request Flow

```
User Action
    ↓
React Component
    ↓
useAuth Hook / API Client
    ↓
fetch() with HTTP-only cookie
    ↓
Next.js API Route
    ↓
Authentication Middleware
    ↓
Business Logic (Service Layer)
    ↓
Database (Prisma)
    ↓
Response
    ↓
React State Update
    ↓
UI Re-render
```

### Authentication Flow

```
1. User submits login form
   ↓
2. Frontend calls POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend hashes password comparison
   ↓
5. Backend signs JWT token
   ↓
6. Backend sets HTTP-only cookie
   ↓
7. Backend returns user data
   ↓
8. Frontend updates AuthContext
   ↓
9. UI re-renders with authenticated state
```

### Protected Route Flow

```
1. User navigates to protected route
   ↓
2. Frontend checks AuthContext
   ↓
3. If not authenticated, redirect to login
   ↓
4. If authenticated, render protected component
   ↓
5. Component makes API call
   ↓
6. Backend extracts JWT from cookie
   ↓
7. Backend verifies JWT
   ↓
8. Backend fetches user from database
   ↓
9. Backend processes request
   ↓
10. Backend returns response
```

## Request Lifecycle

### Book Creation Request

```
1. User fills BookForm
   ↓
2. User clicks "Create Book"
   ↓
3. Frontend validates form data
   ↓
4. Frontend creates FormData
   - Append book data as JSON
   - Convert base64 images to File objects
   - Append images to FormData
   ↓
5. Frontend sends POST /api/books
   ↓
6. Backend extracts JWT from cookie
   ↓
7. Backend verifies JWT
   ↓
8. Backend fetches current user
   ↓
9. Backend validates content-type
   ↓
10. Backend parses FormData
   ↓
11. Backend validates book schema (Zod)
   ↓
12. Backend enforces chapter limit (max 5)
   ↓
13. Backend enforces image limit (max 3 per chapter)
   ↓
14. Backend checks if replaceBookId provided
   - If yes: Verify ownership, delete book
   - If no: Check book limit
   ↓
15. Backend uploads images to Supabase Storage
   ↓
16. Backend creates book in database
   ↓
17. Backend creates chapters in database
   ↓
18. Backend creates chapter images in database
   ↓
19. Backend returns created book
   ↓
20. Frontend updates state
   ↓
21. Frontend redirects to book page
```

### Book Replacement Request

```
1. User attempts to create 4th book
   ↓
2. Backend checks book limit (3 max)
   ↓
3. Backend returns 409 Conflict
   - error: "Book limit reached"
   - requiresReplacement: true
   - books: [user's existing books]
   ↓
4. Frontend opens BookReplacementModal
   ↓
5. User selects book to replace
   ↓
6. User clicks "Replace Selected Book"
   ↓
7. Frontend appends replaceBookId to FormData
   ↓
8. Frontend resubmits POST /api/books
   ↓
9. Backend verifies replaceBookId ownership
   ↓
10. Backend deletes selected book
   - Calls deleteBookRelations()
   - Deletes chapters
   - Deletes chapter images
   - Cleans up Supabase Storage
   ↓
11. Backend creates new book
   ↓
12. Backend returns created book
   ↓
13. Frontend redirects to new book
```

## Upload Lifecycle

### Image Upload Flow

```
1. User selects image file
   ↓
2. Frontend validates file (type, size)
   - Allowed: JPEG, PNG, WebP
   - Max size: 2MB
   ↓
3. Frontend converts to base64 for preview
   ↓
4. User submits form
   ↓
5. Frontend converts base64 back to File object
   - atob() to decode base64
   - Uint8Array to create buffer
   - Blob to create File
   ↓
6. Frontend appends to FormData
   ↓
7. Backend receives FormData
   ↓
8. Backend validates again (type, size)
   ↓
9. Backend generates unique filename (UUID)
   ↓
10. Backend uploads to Supabase Storage
   - Bucket: book-images
   - Path: {uuid}.{extension}
   ↓
11. Backend gets public URL
   ↓
12. Backend stores URL in database
   ↓
13. Frontend displays image from public URL
```

### Storage Cleanup Flow

```
1. User deletes book/chapter
   ↓
2. Backend calls cleanup module
   ↓
3. Cleanup module fetches related records
   - Book → Chapters → Images
   ↓
4. For each image:
   - Extract path from public URL
   - Delete from Supabase Storage
   - Delete from database
   ↓
5. For each chapter:
   - Delete from database (cascade handles images)
   ↓
6. For book:
   - Delete from database (cascade handles chapters)
   ↓
7. Orphan prevention:
   - Database cascade ensures no orphan records
   - Explicit storage cleanup prevents orphan files
```

## Database Lifecycle

### Prisma ORM Flow

```
1. Application code calls Prisma client
   ↓
2. Prisma generates SQL query
   ↓
3. Prisma sends query to PostgreSQL
   ↓
4. PostgreSQL executes query
   ↓
5. PostgreSQL returns results
   ↓
6. Prisma transforms to TypeScript objects
   ↓
7. Application receives typed data
```

### Connection Management

```
1. Prisma client singleton (server/prisma.ts)
   ↓
2. Connection pool management
   ↓
3. Query execution
   ↓
4. Connection release back to pool
```

### Transaction Safety

```
1. Prisma transactions for complex operations
   - $transaction() API
   ↓
2. Atomic operations
   - All queries succeed or all fail
   ↓
3. Rollback on error
   - Automatic rollback on failure
```

### Cascade Behavior

```
Database-level cascades (Prisma schema):

Book deleted
  ↓
Chapters cascade delete (onDelete: Cascade)
  ↓
ChapterImages cascade delete (onDelete: Cascade)
  ↓
Purchases cascade delete (onDelete: Cascade)

User deleted
  ↓
Books cascade delete (onDelete: Cascade)
  ↓
Purchases cascade delete (onDelete: Cascade)
```

## Cleanup Lifecycle

### Book Cleanup Flow

```
1. Delete request received
   ↓
2. Verify book ownership
   ↓
3. Call deleteBookRelations(bookId)
   ↓
4. Fetch all chapters for book
   ↓
5. For each chapter:
   - Call deleteChapterImages(chapterId)
   ↓
6. For each chapter image:
   - Extract path from URL
   - Delete from Supabase Storage
   - Delete from database
   ↓
7. Delete chapters from database
   ↓
8. Delete book from database
   ↓
9. Return success
```

### Chapter Cleanup Flow

```
1. Delete request received
   ↓
2. Verify chapter ownership
   ↓
3. Call deleteChapterImages(chapterId)
   ↓
4. Fetch all images for chapter
   ↓
5. For each image:
   - Extract path from URL
   - Delete from Supabase Storage
   - Delete from database
   ↓
6. Delete chapter from database
   ↓
7. Return success
```

### Storage Cleanup Flow

```
1. Image URL: https://.../book-images/{uuid}.jpg
   ↓
2. Extract path: {uuid}.jpg
   ↓
3. Supabase Storage API call:
   supabase.storage.from('book-images').remove([path])
   ↓
4. File deleted from storage
   ↓
5. Database record deleted
   ↓
6. Cleanup complete
```

## Authentication Lifecycle

### Registration Flow

```
1. User submits registration form
   ↓
2. Frontend validates input
   ↓
3. Frontend sends POST /api/auth/register
   ↓
4. Backend validates input
   ↓
5. Backend checks if email exists
   ↓
6. Backend hashes password (bcrypt, 10 rounds)
   ↓
7. Backend creates user in database
   ↓
8. Backend signs JWT token
   - Payload: { userId, email }
   - Secret: JWT_SECRET
   - Expiration: 7 days
   ↓
9. Backend sets HTTP-only cookie
   - Name: token
   - Value: JWT string
   - HttpOnly: true
   - Secure: true (production)
   - SameSite: strict
   ↓
10. Backend returns user data
   ↓
11. Frontend updates AuthContext
   ↓
12. Frontend redirects to dashboard
```

### Login Flow

```
1. User submits login form
   ↓
2. Frontend validates input
   ↓
3. Frontend sends POST /api/auth/login
   ↓
4. Backend validates input
   ↓
5. Backend finds user by email
   ↓
6. Backend compares password hash
   - bcrypt.compare(password, hash)
   ↓
7. If match:
   - Sign JWT token
   - Set HTTP-only cookie
   - Return user data
   ↓
8. If no match:
   - Return 401 Unauthorized
   ↓
9. Frontend updates AuthContext
   ↓
10. Frontend redirects to dashboard
```

### Token Verification Flow

```
1. Protected API request received
   ↓
2. Backend extracts token from cookie
   - getTokenFromRequest()
   ↓
3. Backend verifies token
   - jwt.verify(token, JWT_SECRET)
   ↓
4. If valid:
   - Extract userId from payload
   - Fetch user from database
   - Return user data
   ↓
5. If invalid:
   - Return 401 Unauthorized
   ↓
6. Proceed with request
```

### Logout Flow

```
1. User clicks logout
   ↓
2. Frontend calls POST /api/auth/logout
   ↓
3. Backend clears HTTP-only cookie
   - Set cookie with expired date
   ↓
4. Backend returns success
   ↓
5. Frontend clears AuthContext
   ↓
6. Frontend redirects to home
```

## Modular Architecture

### Module Pattern

Each feature (books, chapters, limits) follows a consistent module pattern:

```
module/
├── module.service.ts      # Business logic orchestration
├── module.controller.ts   # Route handlers
├── module.parser.ts       # Request parsing
├── module.validator.ts    # Data validation
├── module.permissions.ts  # Permission checks
├── module.mapper.ts       # Data mapping
├── module.cleanup.ts      # Cleanup operations
├── module.types.ts        # TypeScript types
└── utils/                 # Module-specific utilities
```

### Module Responsibilities

**Service Layer:**
- Orchestrates business logic
- Coordinates between layers
- Handles complex operations

**Controller Layer:**
- Handles HTTP requests/responses
- Calls service layer
- Returns formatted responses

**Parser Layer:**
- Extracts data from requests
- Handles multipart parsing
- Validates request structure

**Validator Layer:**
- Validates business rules
- Enforces constraints
- Returns validated data

**Permissions Layer:**
- Checks ownership
- Verifies authorization
- Throws errors if unauthorized

**Mapper Layer:**
- Transforms data between layers
- Maps DTOs to entities
- Handles data formatting

**Cleanup Layer:**
- Handles deletion operations
- Cleans up related data
- Manages storage cleanup

### Data Flow Through Modules

```
API Route
  ↓
Controller
  ↓
Parser (extract data)
  ↓
Validator (validate data)
  ↓
Permissions (check ownership)
  ↓
Mapper (transform data)
  ↓
Service (business logic)
  ↓
Repository (database access)
  ↓
Prisma (SQL generation)
  ↓
Database (query execution)
```

## Local Books Architecture

### localStorage Architecture

```
Browser localStorage
  ↓
Key: "local_books"
  ↓
Value: JSON string
  {
    books: LocalBook[],
    chapters: LocalChapter[]
  }
  ↓
SSR-safe access checks
  ↓
React hooks (useLocalBooks)
  ↓
Component state
```

### Local Book Creation Flow

```
1. User fills BookForm
   ↓
2. User enables "Create locally" toggle
   ↓
3. User submits form
   ↓
4. Frontend validates form data
   ↓
5. Frontend maps form data to LocalBook
   - mapFormToLocalBook()
   ↓
6. Frontend generates UUID for localBookId
   ↓
7. Frontend saves to localStorage
   - saveLocalBook(book, chapters)
   ↓
8. Frontend updates useLocalBooks state
   ↓
9. Frontend redirects to local book page
```

### Local Book Storage Operations

```
SSR Check
  ↓
localStorage Available?
  ↓
Yes → Proceed with operations
  ↓
No → Return empty/default values
  ↓
JSON Parse/Serialize
  ↓
Error Handling
  ↓
Update React State
```

### Local Book Integration

```
useBooksPagination Hook
  ↓
Fetches remote books from API
  ↓
Fetches local books from localStorage
  ↓
Merges both arrays
  ↓
Returns allBooks = [...localBooks, ...remoteBooks]
  ↓
Component displays merged list
```

## Pagination Architecture

### Server-Side Pagination

```
Frontend Request
  ↓
Query Parameters: page, limit, ownerId, search, sort
  ↓
API Route
  ↓
Prisma Query
  - skip: (page - 1) * limit
  - take: limit
  - where: filters
  - orderBy: sort
  ↓
Database Query
  ↓
Paginated Results
  ↓
Response
  {
    data: Book[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      hasMore: boolean
    }
  }
  ↓
Frontend State Update
  ↓
Load More Button (if hasMore)
```

### Client-Side Merging

```
useBooksPagination Hook
  ↓
Fetches remote books (paginated)
  ↓
Fetches local books (all)
  ↓
Merges: [...localBooks, ...remoteBooks]
  ↓
Returns allBooks
  ↓
Component displays merged list
  ↓
Load More only affects remote books
```

## Limits Architecture

### Limit Checking Flow

```
User Action (create book)
  ↓
API Request
  ↓
checkBookLimit(userId)
  ↓
Count user's books
  ↓
Compare with maxBooks (3)
  ↓
If limit reached:
  - Return user's books
  - Return limitReached: true
  ↓
If not reached:
  - Return limitReached: false
  ↓
API Response
  - If limitReached: 409 Conflict
  - If not: Proceed with creation
```

### Limit Enforcement Flow

```
Request with replaceBookId
  ↓
Verify book exists
  ↓
Verify book ownership
  ↓
Delete book with cleanup
  ↓
Create new book
  ↓
Return success
```

### Limit Configuration

```
limits.config.ts
  ↓
LIMITS object
  {
    FREE: { maxBooks: 3, ... },
    PRO: { maxBooks: 100, ... }
  }
  ↓
LimitsService.getPlan(plan)
  ↓
Returns limit configuration
  ↓
Used for validation
```

## Error Handling Architecture

### Error Flow

```
Error Occurs
  ↓
Custom Error Class (AppError)
  ↓
Error Caught in try/catch
  ↓
Error Logged
  ↓
API Response Helper
  - errorResponse(message, status)
  ↓
HTTP Response
  - success: false
  - error: message
  ↓
Frontend Receives Error
  ↓
Frontend Displays Error
```

### Error Types

**AppError (Base):**
- statusCode: number
- isOperational: boolean
- message: string

**UnauthorizedError (401):**
- User not authenticated
- Invalid token

**NotFoundError (404):**
- Resource not found
- Invalid ID

**ValidationError (400):**
- Invalid input
- Validation failed

**Business Logic Errors:**
- Book limit reached (409)
- Ownership violation (403)
- Chapter limit exceeded (400)
- Image limit exceeded (400)

## Security Architecture

### Authentication Security

```
Password Storage:
  Plain text
    ↓
  bcrypt.hash(password, 10)
    ↓
  Hash stored in database
    ↓
  bcrypt.compare(input, hash)
    ↓
  Boolean result
```

### JWT Security

```
Token Generation:
  User data
    ↓
  jwt.sign(payload, secret, { expiresIn: '7d' })
    ↓
  JWT string
    ↓
  HTTP-only cookie
```

```
Token Verification:
  Cookie extraction
    ↓
  jwt.verify(token, secret)
    ↓
  Payload or null
    ↓
  User lookup
```

### Authorization Security

```
Request
  ↓
Authentication (JWT verification)
  ↓
Authorization (ownership check)
  ↓
ensureBookOwner(bookId, userId)
  ↓
Fetch book from database
  ↓
Compare ownerId
  ↓
If match: Proceed
  ↓
If no match: 403 Forbidden
```

### Input Validation Security

```
User Input
  ↓
Zod Schema Validation
  ↓
Type Checking
  ↓
Length Limits
  ↓
Format Validation
  ↓
Sanitization
  ↓
Safe to use
```

### SQL Injection Prevention

```
User Input
  ↓
Prisma ORM
  ↓
Parameterized Queries
  ↓
SQL Generation
  ↓
Database Execution
  ↓
Safe from SQL injection
```

## Performance Architecture

### Database Performance

```
Query Optimization:
  - Indexed fields (ownerId, bookId, etc.)
  - Selective field selection
  - Pagination to limit results
  - Efficient joins
```

### File Upload Performance

```
Image Upload:
  - Parallel uploads (Promise.all)
  - File size limits (2MB)
  - Supabase CDN for delivery
  - Unique filenames prevent conflicts
```

### Frontend Performance

```
Rendering:
  - React 19 with automatic optimizations
  - Framer Motion for smooth animations
  - Code splitting (Next.js)
  - Lazy loading for images
```

### API Performance

```
Response Optimization:
  - Selective field selection
  - Pagination
  - Compression (Next.js)
  - Caching (consider adding Redis)
```

## Scalability Architecture

### Horizontal Scaling

```
Next.js Application:
  - Stateless API routes
  - HTTP-only cookies (session)
  - Database connection pooling
  - Can scale horizontally
```

### Database Scaling

```
Supabase PostgreSQL:
  - Connection pooling
  - Read replicas (consider)
  - Index optimization
  - Query optimization
```

### Storage Scaling

```
Supabase Storage:
  - CDN delivery
  - Unlimited storage (with plan)
  - Automatic scaling
  - High availability
```

## Deployment Architecture

### Vercel Deployment

```
Git Repository
  ↓
Vercel Integration
  ↓
Automatic Deployment
  ↓
Build Process:
  - npm install
  - prisma generate
  - next build
  ↓
Edge Network Deployment
  ↓
Global CDN
  ↓
HTTPS (automatic)
```

### Environment Variables

```
Development (.env.local):
  - DATABASE_URL
  - DIRECT_URL
  - JWT_SECRET
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

```
Production (Vercel):
  - Environment variables configured
  - Encrypted at rest
  - Injected at build time
```

### Database Migrations

```
Development:
  npx prisma migrate dev
    ↓
  Local database
```

```
Production:
  npx prisma migrate deploy
    ↓
  Supabase database
```

## Monitoring & Observability

### Logging

```
Application Logging:
  - console.log() for development
  - Consider structured logging for production
  - Error tracking (consider Sentry)
```

### Performance Monitoring

```
Next.js Analytics:
  - Web Vitals
  - Route performance
  - Consider adding APM
```

### Error Tracking

```
Error Handling:
  - Try/catch blocks
  - Error responses
  - Consider error tracking service
```

## Architecture Decisions

### Why Next.js App Router?

- Unified frontend and backend
- Server components for performance
- API routes for backend logic
- Built-in routing
- Excellent TypeScript support
- Vercel integration

### Why Prisma?

- Type-safe database access
- Auto-generated TypeScript types
- Excellent migration system
- Great developer experience
- PostgreSQL support
- Connection pooling

### Why Supabase?

- Managed PostgreSQL
- Built-in authentication (optional)
- File storage (Supabase Storage)
- Real-time capabilities (optional)
- Generous free tier
- Easy setup

### Why JWT with HTTP-only Cookies?

- Stateless authentication
- Secure (HTTP-only prevents XSS)
- No localStorage vulnerabilities
- Automatic CSRF protection
- Easy to implement
- Industry standard

### Why Modular Architecture?

- Separation of concerns
- Easy to test
- Easy to maintain
- Easy to scale
- Consistent patterns
- Team collaboration

### Why Local Books?

- Offline capability
- No authentication required
- Instant feedback
- Lower barrier to entry
- Privacy (data stays local)
- Easy migration to remote

### Why Framer Motion?

- Smooth animations
- Easy to use
- Great performance
- TypeScript support
- Declarative API
- Community support

## Future Architecture Considerations

### Potential Improvements

**Caching:**
- Redis for session caching
- CDN caching for static assets
- Database query caching

**Rate Limiting:**
- API rate limiting
- IP-based limits
- User-based limits

**Real-time Features:**
- Supabase Realtime
- WebSocket connections
- Live collaboration

**Search:**
- Full-text search (PostgreSQL)
- Elasticsearch (optional)
- Search analytics

**Analytics:**
- User behavior tracking
- Book reading analytics
- Purchase analytics

**Testing:**
- Unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Playwright)

**Monitoring:**
- APM (Application Performance Monitoring)
- Error tracking (Sentry)
- Log aggregation (consider)

**CI/CD:**
- Automated testing
- Automated deployments
- Staging environment
- Rollback capabilities
