# Testing Guide - Demo Limits System

## Setup Before Testing

1. **Run Prisma Migration**
   ```bash
   npx prisma migrate dev --name add-user-ip
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Create Test Account**
   - Register at http://localhost:3000/auth/register
   - Use email: `test@example.com`
   - Password: Any valid password

---

## Test 1: Book Limit (3 max)

### Step 1: Create First Book
1. Go to http://localhost:3000/dashboard/books
2. Fill in book form:
   - Title: "Book 1"
   - Description: "First book"
   - Cover: Upload any image
   - Chapter 1: Add title and content
3. Click "Create Book"
4. **Expected**: Book created, redirects to book page

### Step 2: Create Second Book
1. Go back to dashboard
2. Create another book (Book 2)
3. **Expected**: Book created successfully

### Step 3: Create Third Book
1. Go back to dashboard
2. Create another book (Book 3)
3. **Expected**: Book created successfully
4. **Expected UI**: Warning banner appears:
   ```
   ⚠️ Demo Limit Reached
   You already have 3 books (maximum 3 in demo). 
   Creating a new book will replace your oldest book.
   ```

### Step 4: Create Fourth Book (Trigger Limit)
1. Create another book (Book 4)
2. **Expected**: 
   - Book 1 is automatically deleted
   - Book 4 is created
   - Notification shows: "Your oldest book was replaced..."
   - Dashboard shows only Books 2, 3, 4 (no Book 1)

### Verification
```sql
-- Check database
SELECT id, title, ownerId, createdAt FROM "Book" WHERE ownerId = '<userId>' ORDER BY createdAt;
-- Expected: 3 books (Book 2, 3, 4 with Book 1 deleted)
```

```bash
# Check Supabase Storage
# Go to: Supabase Console > Storage > book-images
# Expected: No orphaned files from Book 1
```

---

## Test 2: Chapter Limit (5 max)

### Step 1: Create Book with 5 Chapters
1. In BookForm, click "+ Add Chapter" 5 times
2. Fill in all chapter titles and content
3. Click "Create Book"
4. **Expected**: Book created with 5 chapters

### Step 2: Edit Book - Try to Add 6th Chapter
1. Go to http://localhost:3000/dashboard/books
2. Click edit on the book
3. Scroll to chapters section
4. **Expected**: "+ Add Chapter" button is DISABLED (grayed out)
5. **Expected**: Message shows: "Maximum number of chapters reached (5)"

### Step 3: Try POST to API Directly
```bash
# Open terminal and run:
curl -X POST http://localhost:3000/api/chapters \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "bookId=<book-id>&title=Chapter 6&content=Test&slug=chapter-6&isFree=true"
```

4. **Expected Response**:
```json
{
  "error": "Chapter limit reached",
  "message": "Maximum number of chapters per book is 5."
}
```

---

## Test 3: Image Limit (3 per chapter)

### Step 1: Create Chapter with 3 Images
1. In BookForm, add a chapter
2. Click "+ Upload images" 3 times to upload 3 images
3. **Expected**: All 3 images shown in grid

### Step 2: Try to Add 4th Image
1. **Expected**: "+ Upload images" button is DISABLED
2. **Expected**: Cannot add more images

### Step 3: Try POST to API
```bash
# Try uploading 4 image files to a chapter
curl -X POST http://localhost:3000/api/chapters \
  -H "Content-Type: multipart/form-data" \
  -F "bookId=<book-id>" \
  -F "title=Chapter 1" \
  -F "content=Test" \
  -F "slug=chapter-1" \
  -F "isFree=true" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg" \
  -F "images=@image4.jpg"
```

3. **Expected Response**:
```json
{
  "error": "Image limit reached",
  "message": "Maximum number of images per chapter is 3."
}
```

---

## Test 4: IP Limit (3 users per IP)

### Step 1: Register 3 Accounts
1. Open browser (private/incognito to get same IP)
2. Register account 1: user1@test.com
3. Register account 2: user2@test.com
4. Register account 3: user3@test.com
5. **Expected**: All 3 registrations succeed

### Step 2: Try to Register 4th Account
1. Try to register account 4: user4@test.com
2. **Expected Response Error**:
```json
{
  "error": "IP limit reached",
  "message": "This demo allows only 3 accounts per IP address."
}
```

### Verification
```sql
-- Check database
SELECT id, email, ip, createdAt FROM "User" WHERE ip = '<your-ip>' ORDER BY createdAt;
-- Expected: 3 users with same IP
```

---

## Test 5: Cascading Deletion & Storage Cleanup

### Step 1: Create Book with Images
1. Create a book with:
   - 2 chapters
   - Chapter 1: 3 images
   - Chapter 2: 2 images
2. Note the book ID for later

### Step 2: Create 2 More Books (to trigger book limit)
1. Create Book 2
2. Create Book 3
3. Create Book 4 (triggers deletion of Book 1)

### Step 3: Verify Cascading Deletion
```sql
-- Check book deleted
SELECT * FROM "Book" WHERE id = '<book-1-id>';
-- Expected: No result (book deleted)

-- Check chapters deleted
SELECT * FROM "Chapter" WHERE bookId = '<book-1-id>';
-- Expected: No results (chapters deleted)

-- Check images deleted
SELECT * FROM "ChapterImage" WHERE chapterId IN 
  (SELECT id FROM "Chapter" WHERE bookId = '<book-1-id>');
-- Expected: No results (images deleted)
```

### Step 4: Verify Supabase Storage Cleanup
1. Go to Supabase Console
2. Navigate to Storage > book-images
3. Look for any files from Book 1
4. **Expected**: No orphaned files
5. **Expected**: Only files from Books 2, 3, 4 remain

---

## Test 6: Frontend UX Warnings

### Test 6a: Book Limit Warning
1. Create 3 books
2. Go to Dashboard > Books
3. Scroll to "Create a new book" section
4. **Expected**: Warning banner shows:
   ```
   ⚠️ Demo Limit Reached
   You already have 3 books (maximum 3 in demo).
   Creating a new book will replace your oldest book.
   ```
5. Create 4th book
6. **Expected**: Warning still shows, oldest book deleted

### Test 6b: Chapter Limit UI
1. Create book with 5 chapters
2. Edit the book
3. Scroll to chapters section
4. **Expected**: "+ Add Chapter" button is DISABLED
5. **Expected**: Text shows "Maximum number of chapters reached (5)"

### Test 6c: Image Limit UI
1. Add chapter with 3 images
2. **Expected**: Upload area shows "Maximum number of images per chapter is 3"
3. **Expected**: Cannot upload more images from UI

---

## Test 7: Error Response Format

### Test 7a: Book Creation Response (Success)
```bash
curl -X POST http://localhost:3000/api/books \
  -F "book={...}" \
  -F "images..."
```

**Response (No Limit):**
```json
{
  "message": "Book created successfully.",
  "maxBooks": 3,
  "createdBook": { "id": "...", "title": "..." }
}
```

**Response (Limit Reached):**
```json
{
  "message": "Book limit reached. Your oldest book was replaced because this is a demo environment.",
  "maxBooks": 3,
  "replacedBookId": "old-book-id",
  "createdBook": { "id": "...", "title": "..." }
}
```

---

## Browser Console Checks

### Check Network Tab
1. Open DevTools > Network tab
2. Create a book
3. Find POST /api/books request
4. Click on response
5. **Expected**: See response with `replacedBookId` if book was replaced

### Check Local Storage
1. Open DevTools > Application > Local Storage
2. Site: http://localhost:3000
3. Key: `local_books` (if using local storage)
4. **Expected**: JSON array of local books

---

## Edge Case Tests

### Test 1: Delete Book Manually After Limit Hit
1. Create 3 books
2. Create 4th book (1st deletes automatically)
3. In database, verify only books 2-4 exist
4. **Expected**: No orphaned data

### Test 2: Create Book Right After Deletion
1. Create 3 books
2. Delete 1 book manually
3. Create new book
4. **Expected**: Book created without hitting limit
5. **Expected**: Now have 3 books again

### Test 3: Multiple Rapid Book Creations
1. Create books very quickly
2. Create books 1, 2, 3, 4, 5, 6 in rapid succession
3. **Expected**: System handles gracefully
4. **Expected**: Only 3 books remain (4, 5, 6)

---

## Performance Tests

### Test 1: Book Deletion Speed
1. Create book with 5 chapters, 3 images each
2. Create 3 more books to trigger deletion
3. Time from click to redirect
4. **Expected**: < 2 seconds total

### Test 2: Chapter Limit Check Speed
1. Create book with 5 chapters
2. Try to add 6th chapter
3. Check response time in Network tab
4. **Expected**: < 100ms response time

### Test 3: Image Limit Check Speed
1. Create chapter with 3 images
2. Try to add 4th image
3. Check response time
4. **Expected**: < 50ms response time

---

## Post-Test Cleanup

### Clean Up Database (Optional)
```sql
-- Delete all books for test user
DELETE FROM "Book" WHERE ownerId = '<userId>';

-- Delete all chapters for test user
DELETE FROM "Chapter" WHERE bookId IN 
  (SELECT id FROM "Book" WHERE ownerId = '<userId>');

-- Verify cleanup
SELECT COUNT(*) as book_count FROM "Book" WHERE ownerId = '<userId>';
```

### Clean Up Supabase Storage
```bash
# Remove all test images
# Via Supabase Console > Storage > book-images
# Delete all files from testing
```

---

## Troubleshooting

### Issue: Book not deleting when creating 4th book
**Solution**: Check that `handleBookLimit` is being called
```bash
# Look for logs:
# "[BOOK_CREATE_START] Enforcing book limit..."
# "[OLDEST_BOOK_FOUND] id: ..."
```

### Issue: Images not deleted from Supabase
**Solution**: Check chapter cleanup is called
```bash
# Look for Supabase removal logs
# Check supabase.storage.from('book-images').remove([path])
```

### Issue: Chapter limit not enforced
**Solution**: Verify chapter count validation in API
```bash
# Check: GET /api/chapters?bookId=<id>
# Should return exactly 5 chapters
```

### Issue: Frontend warning not showing
**Solution**: Check that `BooksDashboard` is calculating total books
```bash
# Open DevTools Console
# Check: totalUserBooks and bookLimitWarning state
```

---

## Success Criteria

✅ All 4 limits enforced (books, IPs, chapters, images)
✅ Oldest content auto-deleted on book limit
✅ Frontend warnings prevent user confusion
✅ API responses include clear messages
✅ No orphaned files in Supabase Storage
✅ Database remains consistent after deletions
✅ All operations complete within 2 seconds
✅ Error messages in English
✅ Works on both local and Vercel deployment

---

**Testing Complete When All Tests Pass ✅**
