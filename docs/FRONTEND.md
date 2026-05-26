# Frontend Documentation

## Overview

The Story Platform frontend is built with Next.js App Router, TypeScript, and React. It provides a book creation and reading experience with support for both remote (server-stored) and local (browser-stored) books.

## Tech Stack

- **Framework**: Next.js 16.2.0 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.4
- **Animations**: Framer Motion 12.38.0
- **Styling**: Tailwind CSS 4.2.2
- **State Management**: React Context API + React hooks
- **HTTP Client**: Native fetch API

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (backend)
│   ├── auth/              # Authentication pages
│   ├── book/              # Book reading pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── book/              # Book-related components
│   ├── books/             # Book list components
│   ├── chapter/           # Chapter components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components (Header, Footer)
│   ├── modals/            # Modal components
│   ├── sections/          # Page sections
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── api/               # API client functions
│   ├── hooks/             # Custom React hooks
│   ├── local-books/       # Local book system
│   ├── services/          # Service layer
│   ├── validators/        # Client-side validation
│   └── utils/             # Utility functions
└── types/                 # TypeScript type definitions
```

## Frontend Architecture

### App Router Structure

The application uses Next.js App Router with the following page structure:

- **`/`** - Home page with hero section and library
- **`/auth/login`** - Login page
- **`/auth/register`** - Registration page
- **`/dashboard/books`** - Book management dashboard
- **`/book/[bookSlug]`** - Book detail page
- **`/book/[bookSlug]/chapter/[chapterSlug]`** - Chapter reading page
- **`/profile`** - User profile page
- **`/about`** - About page
- **`/faq`** - FAQ page

### Component Structure

Components are organized by feature and responsibility:

#### Authentication Components (`components/auth/`)
- **`AuthProvider.tsx`** - Context provider for authentication state
  - Manages user session
  - Provides login, register, logout functions
  - Fetches current user on mount

#### Book Components (`components/book/`)
- **`BookCard.tsx`** - Display component for individual books

#### Books Components (`components/books/`)
- **`BookForm.tsx`** - Form for creating/editing books with chapters
  - Handles multipart form data
  - Manages chapter images
  - Integrates with replacement modal
- **`BooksFilters.tsx`** - Filter controls for book list
- **`BooksSearchInput.tsx`** - Search input for books
- **`BooksSection.tsx`** - Section displaying book grid
- **`BooksSortRadio.tsx`** - Sort controls (newest/oldest)
- **`LocalBooksGrid.tsx`** - Grid display for local books
- **`RemotwBooksGrid.tsx`** - Grid display for remote books

#### Chapter Components (`components/chapter/`)
- **`ChapterListItem.tsx`** - List item for chapter navigation
- **`Paywall.tsx`** - Paywall component for locked chapters

#### Chapter Images Components (`components/chapterImages/`)
- **`ChapterImages.tsx`** - Display component for chapter images

#### Chapter Navigation Components (`components/chapterNavigation/`)
- **`ChapterNavigation.tsx`** - Navigation between chapters

#### Form Components (`components/forms/`)
- **`CreateBookWithChaptersForm.tsx`** - Alternative form for book creation

#### Layout Components (`components/layout/`)
- **`Header/Header.tsx`** - Application header with navigation
- **`Footer/Footer.tsx`** - Application footer

#### Modal Components (`components/modals/`)
- **`BookReplacementModal.tsx`** - Modal for selecting book to replace when limit reached
  - Displays user's books as selectable cards
  - Handles replacement confirmation

#### Section Components (`components/sections/`)
- **`Hero/Hero.tsx`** - Hero section for home page
- **`Library/Library.tsx`** - Library section displaying books

#### UI Components (`components/ui/`)
- **`Button/Button.tsx`** - Reusable button component
- **`ConfirmModal/ConfirmModal.tsx`** - Generic confirmation modal
- **`FileInput/FileInput.tsx`** - File input component
- **`Input/Input.tsx`** - Text input component
- **`LoadMoreButton/LoadMoreButton.tsx`** - Load more pagination button
- **`Textarea/Textarea.tsx`** - Textarea component
- **`BookOpenIcon.tsx`** - Book open icon
- **`LockIcon.tsx`** - Lock icon

### Hooks

#### Custom Hooks (`lib/hooks/`)

**`useBooksPagination.ts`**
- Manages paginated fetching of books
- Supports merging with local books
- Handles search, sort, and filter parameters
- Provides load more functionality

```typescript
const {
  books,           // Remote books
  localBooks,      // Local books
  allBooks,        // Merged books
  pagination,      // Pagination metadata
  isLoading,       // Loading state
  isLoadingMore,   // Load more loading state
  error,           // Error message
  hasMore,         // Whether more pages exist
  loadMore,        // Load more function
  refresh,         // Refresh function
} = useBooksPagination({
  initialLimit: 8,
  mergeWithLocal: true,
  ownerId: userId,
  search: query,
  sort: 'newest'
});
```

**`useUserBooksPagination.ts`**
- Specialized hook for user's own books
- Wraps useBooksPagination with ownerId

### Local State Management

#### Authentication State (`components/auth/AuthProvider.tsx`)

The application uses React Context API for authentication state:

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}
```

**Usage:**
```typescript
const { user, login, register, logout, isLoading } = useAuth();
```

**Flow:**
1. On mount, fetches current user from `/api/user/me`
2. Login sends credentials to `/api/auth/login`
3. Register sends user data to `/api/auth/register`
4. Logout calls `/api/auth/logout`
5. JWT token stored in HTTP-only cookie (managed by backend)

#### Modal State

Modals use local component state with boolean flags:

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [replacementModalOpen, setReplacementModalOpen] = useState(false);
```

#### Form State

Forms use controlled components with state objects:

```typescript
const [form, setForm] = useState<FormState>(INITIAL_STATE);
```

### Auth Provider

**Location:** `src/components/auth/AuthProvider.tsx`

The AuthProvider manages user authentication state across the application:

**Features:**
- Automatic user session restoration on mount
- JWT token management (via HTTP-only cookies)
- Login, register, logout functions
- Loading state during authentication

**API Endpoints Used:**
- `GET /api/user/me` - Get current user
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout

## Local Books System

The local books system allows users to create and store books entirely in the browser using localStorage. This enables offline book creation without requiring server authentication.

### Architecture

**Location:** `src/lib/local-books/`

**Files:**
- `localBook.types.ts` - TypeScript types for local books
- `localBookMapper.ts` - Mapping between forms and local book types
- `localBookStorage.ts` - localStorage operations
- `hooks/useLocalBooks.ts` - React hook for local books

### Types

```typescript
interface LocalBook {
  localBookId: string;      // Unique ID (UUID)
  title: string;
  description: string;
  cover: string;            // Base64 data URL
  author: string;
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
}

interface LocalChapter {
  id: string;
  bookId: string;          // References localBookId
  title: string;
  content: string;
  isFree: boolean;
  price: number;
  discount: number;
  images: ChapterImage[];
}

interface LocalBookStorage {
  books: LocalBook[];
  chapters: LocalChapter[];
}
```

### Storage Operations

**Location:** `src/lib/local-books/localBookStorage.ts`

**Functions:**
- `getLocalBooks()` - Retrieve all local books and chapters
- `getLocalBookById(bookId)` - Get specific local book
- `getLocalChaptersByBookId(bookId)` - Get chapters for a book
- `saveLocalBook(book, chapters)` - Save new or update existing book
- `updateLocalBook(book, chapters)` - Update existing book
- `deleteLocalBook(bookId)` - Delete book and its chapters
- `clearAllLocalBooks()` - Clear all local books (testing)

**SSR Safety:**
All storage operations check for localStorage availability before access to prevent SSR errors.

### React Hook

**Location:** `src/lib/local-books/hooks/useLocalBooks.ts`

```typescript
const {
  localBooks,           // Array of local books
  localChapters,        // Array of local chapters
  isLoaded,             // Whether local books are loaded
  createLocalBook,      // Create new local book
  updateLocalBook,      // Update existing local book
  removeLocalBook,      // Delete local book
  isLocalBook,          // Check if book ID is local
} = useLocalBooks();
```

### Integration with BookForm

The BookForm component supports both remote and local book creation:

```typescript
const [createLocally, setCreateLocally] = useState(false);

// In handleSubmit:
if (createLocally) {
  const { book, chapters } = mapFormToLocalBook(form, chapters);
  createLocalBook(book, chapters);
  // Redirect to local book
} else {
  // Submit to backend API
}
```

## Pagination System

The application implements server-side pagination with optional local book merging.

### Hook: useBooksPagination

**Location:** `src/lib/hooks/useBooksPagination.ts`

**Features:**
- Server-side pagination with configurable page size
- Optional merging with local books
- Search functionality
- Sort functionality (newest/oldest)
- Load more button
- Refresh functionality

**Parameters:**
```typescript
interface UseBooksPaginationOptions {
  initialLimit?: number;      // Default: 8
  mergeWithLocal?: boolean;   // Default: true
  ownerId?: string;           // Filter by owner
  search?: string;            // Search query
  sort?: 'newest' | 'oldest'; // Sort order
}
```

**Return Values:**
```typescript
interface UseBooksPaginationReturn {
  books: Book[];              // Remote books only
  localBooks: Book[];         // Local books only
  allBooks: Book[];           // Merged books
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}
```

**API Integration:**
Calls `/api/books` with query parameters:
- `page` - Current page number
- `limit` - Items per page
- `ownerId` - Filter by owner
- `search` - Search query
- `sort` - Sort order

## Main Pages

### Dashboard Books Page

**Location:** `src/app/dashboard/books/page.tsx`

**Components:**
- `BooksDashboard` - Main dashboard component

**Features:**
- Displays user's books (both local and remote)
- Shows book creation form
- Displays published books with pagination
- Shows chapter count per book
- Handles book limit warnings

### Book Detail Page

**Location:** `src/app/book/[bookSlug]/page.tsx`

**Features:**
- Displays book details (title, author, description, cover)
- Shows chapter list
- Handles locked/free chapters
- Displays chapter images
- Chapter navigation

### Chapter Reading Page

**Location:** `src/app/book/[bookSlug]/chapter/[chapterSlug]/page.tsx`

**Features:**
- Displays chapter content
- Shows chapter images with captions
- Paywall for locked chapters
- Chapter navigation (prev/next)
- Purchase button for locked chapters

### Authentication Pages

**Login Page:** `src/app/auth/login/page.tsx`
- Email/password form
- Error handling
- Redirect to dashboard on success

**Register Page:** `src/app/auth/register/page.tsx`
- Name/email/password form
- Error handling
- Redirect to dashboard on success

## API Communication

### API Client Functions

**Location:** `src/lib/api/`

**books.ts**
```typescript
getBooks()                          // Get all books (non-paginated)
getBooksWithPagination(params)     // Get paginated books
getBookById(id)                     // Get book by ID
getBookBySlug(slug)                 // Get book by slug
```

**chapters.ts**
```typescript
getChaptersByBook(bookId)           // Get chapters for a book
getChaptersByBookSorted(bookId)     // Get chapters sorted
getChapterById(id)                  // Get chapter by ID
```

### Request Lifecycle

**Standard API Call:**
```typescript
async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { "Accept": "application/json" },
  });
  
  const payload = await response.json();
  
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  
  return payload.data as T;
}
```

**Authenticated Request:**
```typescript
const response = await fetch(endpoint, {
  method: 'POST',
  headers: await getAuthHeaders(),  // Empty - JWT in cookie
  body: formData,
});
```

**Note:** JWT authentication uses HTTP-only cookies, so no manual header setting is required for authenticated requests.

### Upload Flow

**Book Creation with Images:**

1. User fills BookForm with chapters and images
2. Images converted to base64 for preview
3. On submit:
   - Create FormData
   - Append book data as JSON
   - Convert base64 images to File objects
   - Append images to FormData
4. Backend validates and uploads to Supabase Storage
5. Backend returns Supabase public URLs

**Code Example:**
```typescript
const formData = new FormData();
formData.append("book", JSON.stringify(bookPayload));

form.chapters.forEach((chapter, chapterIndex) => {
  chapter.images.forEach((image, imageIndex) => {
    if (image.url.startsWith("data:")) {
      const base64Data = image.url.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });
      const file = new File([blob], `chapter-${chapterIndex}-image-${imageIndex}.jpg`, { type: "image/jpeg" });
      formData.append(`chapterImages_${chapterIndex}_${imageIndex}`, file);
    }
  });
});
```

### Error Handling

**API Errors:**
```typescript
try {
  const response = await fetch(endpoint);
  const payload = await response.json();
  
  if (!response.ok || !payload?.success) {
    setApiError(payload?.error || `Save failed: HTTP ${response.status}`);
    return;
  }
} catch (err) {
  setApiError(err instanceof Error ? err.message : "Request failed");
}
```

**Demo Limit Errors (409):**
```typescript
if (response.status === 409 && payload?.requiresReplacement) {
  setReplacementBooks(payload.books || []);
  setPendingFormData(formData);
  setReplacementModalOpen(true);
  return;
}
```

## Demo Limit UX

### Book Replacement Flow

**Trigger:** User attempts to create a 4th book (limit: 3)

**Flow:**
1. User submits book creation form
2. Backend returns 409 Conflict with:
   ```json
   {
     "error": "Book limit reached",
     "message": "You already reached the maximum of 3 books available in the demo version.",
     "requiresReplacement": true,
     "maxBooks": 3,
     "books": [...]  // User's existing books
   }
   ```
3. Frontend opens `BookReplacementModal`
4. User selects which book to replace
5. User confirms replacement
6. Frontend resubmits original form data with `replaceBookId`
7. Backend deletes selected book, creates new book
8. Success response redirects to new book

**Modal UI:**
- Title: "Demo Book Limit Reached"
- Description: "You already reached the maximum of 3 books available in the demo version. Select a book to replace."
- Book cards showing: cover, title, author, creation date
- Selected book highlighted with accent border
- "Cancel" button
- "Replace Selected Book" button (disabled until selection)

### Chapter Limits

**Maximum:** 5 chapters per book

**Frontend Validation:**
```typescript
if (form.chapters.length >= 5) {
  // Disable "Add Chapter" button
  // Show warning message
}
```

**Backend Validation:**
```typescript
if (chapters.length > 5) {
  return errorResponse("Maximum number of chapters per book is 5.", 400);
}
```

### Image Limits

**Maximum:** 3 images per chapter

**Frontend Validation:**
```typescript
const remainingSlots = 3 - chapter.images.length;
const toProcess = Array.from(files).slice(0, remainingSlots);
```

**Backend Validation:**
```typescript
if (chapters.some((c: any) => c.images && c.images.length > 3)) {
  return errorResponse("Maximum number of images per chapter is 3.", 400);
}
```

### Frontend Validations

**Input Limits (src/lib/sanitize.ts):**
```typescript
const INPUT_LIMITS = {
  bookTitle: 100,
  description: 500,
  chapterTitle: 100,
  chapterContent: 10000,
  caption: 200,
};
```

**Image Validation:**
- Allowed types: JPEG, PNG, WebP
- Maximum size: 2MB per image
- Validation in `src/lib/upload.ts`

## Styling

### Tailwind CSS Usage

The application uses Tailwind CSS 4.2.2 with a custom configuration.

**Configuration:** `tailwind.config.ts`

**Theme:**
- Custom color palette (text-primary, text-secondary, bg-primary, etc.)
- Custom border colors
- Custom accent colors

**Common Classes:**
- `card` - Card container with border and background
- `btn-primary` - Primary button style
- `text-text-primary` - Primary text color
- `bg-bg-primary` - Primary background color
- `border-border` - Border color

### Animation System

**Library:** Framer Motion 12.38.0

**Common Patterns:**

**Fade In:**
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

**Slide Up:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

**Animate Presence (for lists):**
```typescript
<AnimatePresence mode="popLayout">
  {items.map((item) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
```

**Hover Effects:**
```typescript
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
```

### Responsive Design

**Breakpoints:**
- Mobile: Default
- Tablet: `md:` prefix
- Desktop: `lg:` prefix

**Example:**
```typescript
className="grid grid-cols-1 md:grid-cols-2 gap-6"
```

## Important Components

### BookForm

**Location:** `src/components/books/BookForm.tsx`

**Purpose:** Create and edit books with chapters and images

**Features:**
- Book details (title, description, cover, author)
- Chapter management (add, remove, reorder)
- Chapter images (upload, caption, remove)
- Price and discount settings
- Free chapter toggle
- Local vs remote creation toggle
- Book replacement modal integration

**State:**
```typescript
const [form, setForm] = useState<FormState>(INITIAL_STATE);
const [isModalOpen, setIsModalOpen] = useState(false);
const [apiError, setApiError] = useState<string | null>(null);
const [createLocally, setCreateLocally] = useState(false);
const [replacementModalOpen, setReplacementModalOpen] = useState(false);
const [replacementBooks, setReplacementBooks] = useState<any[]>([]);
const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
```

**Validation:**
- Required fields: title, author, cover, chapter title, chapter content
- Character limits enforced
- Image count limits enforced
- File size limits enforced

### LocalBooksGrid

**Location:** `src/components/books/LocalBooksGrid.tsx`

**Purpose:** Display local books in a grid layout

**Features:**
- Grid layout (responsive)
- Book cards with cover, title, author
- Chapter count display
- Delete functionality
- Edit functionality

### BookReplacementModal

**Location:** `src/components/modals/BookReplacementModal.tsx`

**Purpose:** Allow user to select which book to replace when limit reached

**Features:**
- Displays user's books as selectable cards
- Visual highlighting for selected book
- Confirm and cancel buttons
- Disabled confirm until selection made

**Props:**
```typescript
interface Props {
  isOpen: boolean;
  books: Book[];
  selectedBookId: string | null;
  onSelectBook: (bookId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}
```

### AuthProvider

**Location:** `src/components/auth/AuthProvider.tsx`

**Purpose:** Provide authentication context to entire application

**Features:**
- User session management
- Login, register, logout functions
- Automatic session restoration
- Loading states

**Usage:**
```typescript
const { user, login, register, logout, isLoading } = useAuth();
```

## State Management Patterns

### Component State

Used for:
- Form data
- Modal open/close
- UI toggles
- Temporary selections

```typescript
const [value, setValue] = useState(initialValue);
```

### Context State

Used for:
- Authentication (AuthProvider)
- Global app settings

```typescript
const Context = createContext<ContextType>(undefined);

export function Provider({ children }) {
  const [state, setState] = useState(initialValue);
  return (
    <Context.Provider value={{ state, setState }}>
      {children}
    </Context.Provider>
  );
}
```

### Custom Hooks

Used for:
- Complex state logic
- API interactions
- Local storage operations

```typescript
export function useCustomHook() {
  const [state, setState] = useState(initialValue);
  
  // Complex logic here
  
  return { state, setState, actions };
}
```

## localStorage Usage

**Storage Key:** `local_books`

**Data Structure:**
```typescript
{
  books: LocalBook[],
  chapters: LocalChapter[]
}
```

**Operations:**
- Read on component mount
- Write on book create/update/delete
- SSR-safe access checks

**SSR Safety:**
```typescript
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
```

## Performance Considerations

### Image Optimization

- Images converted to base64 for preview
- File size validation (2MB max)
- Supabase Storage for production images
- Lazy loading for chapter images

### Pagination

- Server-side pagination for large datasets
- Configurable page size (default: 8)
- Load more button for incremental loading
- Local books merged client-side

### Code Splitting

- Next.js automatic code splitting
- Dynamic imports for large components
- Route-based splitting

## Accessibility

### Semantic HTML

- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support

### Form Accessibility

- Proper label associations
- Error announcements
- Required field indicators

### Color Contrast

- Tailwind color palette ensures WCAG compliance
- Custom colors tested for contrast

## Browser Compatibility

**Supported Browsers:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

**Features Used:**
- ES6+ JavaScript
- CSS Grid
- CSS Flexbox
- localStorage API
- Fetch API
- FormData API

## Development Notes

### Hot Reload

Next.js provides hot reload for both frontend and backend changes.

### TypeScript

Strict TypeScript configuration enabled. All components and utilities are fully typed.

### ESLint

ESLint configured with Next.js rules. Run `npm run lint` to check.

### Environment Variables

Required environment variables (set in `.env`):
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Testing

### Manual Testing

1. **Authentication Flow**
   - Register new user
   - Login
   - Logout
   - Protected route access

2. **Book Creation**
   - Create book with chapters
   - Add chapter images
   - Set prices and discounts
   - Test local vs remote creation

3. **Book Limits**
   - Create 3 books
   - Attempt 4th book
   - Test replacement modal
   - Verify deletion and creation

4. **Pagination**
   - Load more books
   - Test search
   - Test sort
   - Test local book merging

5. **Local Books**
   - Create local book
   - Edit local book
   - Delete local book
   - Test localStorage persistence

## Troubleshooting

### Common Issues

**localStorage not working:**
- Check if cookies/storage are enabled
- Verify browser privacy settings
- Check console for quota exceeded errors

**Images not uploading:**
- Verify file size (max 2MB)
- Check file type (JPEG, PNG, WebP)
- Verify Supabase credentials
- Check network connection

**Authentication failing:**
- Verify JWT_SECRET is set
- Check cookie settings
- Verify API endpoints are accessible

**Pagination not loading:**
- Check API response format
- Verify pagination metadata
- Check network tab for errors
