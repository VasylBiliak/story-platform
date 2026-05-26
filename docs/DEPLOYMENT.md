# Deployment Documentation

## Overview

The Story Platform is designed for deployment on Vercel with Supabase as the backend infrastructure. This guide covers environment setup, database configuration, deployment steps, and production considerations.

## Prerequisites

### Required Accounts

- **Vercel Account** - For hosting the Next.js application
- **Supabase Account** - For PostgreSQL database and file storage
- **Git Repository** - GitHub, GitLab, or Bitbucket for version control

### Required Tools

- **Node.js** - Version 18 or higher
- **npm** - Comes with Node.js
- **Git** - For version control
- **Prisma CLI** - For database management (`npm install -g prisma`)

## Environment Variables

### Required Environment Variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database?pgbouncer=true"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### Variable Descriptions

**DATABASE_URL**
- PostgreSQL connection string
- Used by Prisma for database operations
- Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

**DIRECT_URL**
- Direct PostgreSQL connection string
- Used for Prisma migrations
- Format: Same as DATABASE_URL but with `?pgbouncer=true` for connection pooling

**JWT_SECRET**
- Secret key for JWT token signing
- Must be at least 32 characters
- Keep this secret and never commit to git

**NEXT_PUBLIC_SUPABASE_URL**
- Supabase project URL
- Used for Supabase client initialization
- Format: `https://[project-id].supabase.co`

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Supabase anonymous key
- Used for public Supabase operations
- Found in Supabase project settings

### Environment-Specific Variables

**Development (.env.local):**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/story_platform_dev"
DIRECT_URL="postgresql://postgres:password@localhost:5432/story_platform_dev?pgbouncer=true"
JWT_SECRET="dev-secret-key-change-in-production"
NEXT_PUBLIC_SUPABASE_URL="https://your-dev-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-dev-anon-key"
```

**Production (Vercel):**
Configure in Vercel project settings under Environment Variables

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project name: `story-platform`
4. Enter database password (save this securely)
5. Select region closest to your users
6. Click "Create new project"
7. Wait for project to be provisioned (2-3 minutes)

### 2. Get Connection Strings

1. Go to Project Settings → Database
2. Copy **Connection String** (URI format)
3. Copy **Connection Pooling** URI (for DIRECT_URL)
4. Save these for environment variables

### 3. Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Click "New bucket"
3. Enter bucket name: `book-images`
4. Make bucket **Public** (for image access)
5. Click "Create bucket"

### 4. Get Supabase Keys

1. Go to Project Settings → API
2. Copy **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
3. Copy **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Save these for environment variables

### 5. Configure RLS (Optional)

For production, enable Row Level Security:

```sql
-- Enable RLS
ALTER TABLE "Book" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Chapter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChapterImage" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own books"
ON "Book" FOR SELECT
USING (auth.uid()::text = "ownerId");

CREATE POLICY "Users can insert their own books"
ON "Book" FOR INSERT
WITH CHECK (auth.uid()::text = "ownerId");

CREATE POLICY "Users can update their own books"
ON "Book" FOR UPDATE
USING (auth.uid()::text = "ownerId");

CREATE POLICY "Users can delete their own books"
ON "Book" FOR DELETE
USING (auth.uid()::text = "ownerId");
```

## Prisma Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- Next.js and React
- Prisma and Prisma Client
- Supabase SDK
- Authentication libraries
- Validation libraries

### 2. Generate Prisma Client

```bash
npx prisma generate
```

This generates the Prisma Client based on the schema.

### 3. Run Migrations (Development)

```bash
npx prisma migrate dev --name init
```

This:
- Creates the initial migration
- Applies it to your local database
- Generates the Prisma Client

### 4. Run Migrations (Production)

```bash
npx prisma migrate deploy
```

This applies migrations to the production database.

### 5. Seed Database (Optional)

Create a seed file in `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: '$2a$10$hashedpassword', // Use bcrypt to hash
    },
  })

  console.log({ user })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

Run seed:
```bash
npx prisma db seed
```

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/story-platform.git
cd story-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local`:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/story_platform_dev"
DIRECT_URL="postgresql://postgres:password@localhost:5432/story_platform_dev?pgbouncer=true"
JWT_SECRET="dev-secret-key-change-in-production"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 6. Test the Application

1. Open `http://localhost:3000`
2. Register a new user
3. Create a test book
4. Verify all features work

## Vercel Deployment

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will detect Next.js automatically

### 2. Configure Build Settings

Vercel auto-detects Next.js settings:

**Framework Preset:** Next.js
**Root Directory:** `./`
**Build Command:** `npm run build`
**Output Directory:** `.next`

### 3. Configure Environment Variables

In Vercel project settings:

1. Go to Settings → Environment Variables
2. Add each variable:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Select environments:
   - Production
   - Preview
   - Development

4. Click "Save"

### 4. Deploy

1. Click "Deploy"
2. Vercel will:
   - Install dependencies
   - Run `prisma generate`
   - Build the application
   - Deploy to edge network

3. Wait for deployment to complete

### 5. Run Database Migrations

After first deployment:

```bash
npx prisma migrate deploy
```

This applies migrations to the production database.

### 6. Configure Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records
4. Wait for SSL certificate

## Production Considerations

### Security

**JWT Secret:**
- Use a strong, random secret (32+ characters)
- Never commit to git
- Rotate periodically
- Use different secret for each environment

**Database Credentials:**
- Use strong passwords
- Never commit to git
- Rotate periodically
- Use connection pooling

**Environment Variables:**
- Never commit `.env` files
- Use Vercel environment variables
- Use different variables per environment
- Rotate sensitive values

**HTTPS:**
- Vercel provides automatic HTTPS
- No additional configuration needed
- SSL certificates managed automatically

### Performance

**Database Connection Pooling:**
- Use `DIRECT_URL` with `?pgbouncer=true`
- Supabase provides connection pooling
- Reduces database connection overhead

**Image Optimization:**
- Supabase Storage provides CDN
- Images delivered from edge
- Consider adding image optimization

**Caching:**
- Consider adding Redis for session caching
- Consider CDN caching for static assets
- Consider database query caching

**Monitoring:**
- Set up error tracking (Sentry)
- Set up performance monitoring (Vercel Analytics)
- Set up uptime monitoring

### Backup

**Database Backups:**
- Supabase provides automatic backups
- Configure backup retention in Supabase settings
- Export backups regularly

**Storage Backups:**
- Supabase Storage provides versioning
- Enable bucket versioning
- Export important files regularly

**Code Backups:**
- Git provides version control
- Use GitHub/GitLab/Bitbucket
- Regular commits and pushes

### Scaling

**Horizontal Scaling:**
- Vercel automatically scales
- Stateless API routes
- No session state on server
- Database handles connections

**Database Scaling:**
- Supabase provides scaling
- Consider read replicas for high traffic
- Optimize queries with indexes

**Storage Scaling:**
- Supabase Storage scales automatically
- Consider CDN for global delivery
- Monitor storage usage

## Troubleshooting

### Common Issues

**Build Fails - Prisma Client Not Generated:**

```bash
# Locally
npx prisma generate

# In Vercel, add postinstall script to package.json:
"postinstall": "prisma generate"
```

**Database Connection Failed:**

- Verify `DATABASE_URL` is correct
- Check Supabase project status
- Verify network connectivity
- Check firewall settings

**Migration Fails:**

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or resolve migration conflict manually
npx prisma migrate resolve --applied "migration_name"
```

**Environment Variables Not Working:**

- Verify variable names match exactly
- Check Vercel environment variables
- Restart deployment after adding variables
- Check for typos in variable names

**Images Not Uploading:**

- Verify Supabase credentials
- Check bucket exists and is public
- Verify file size limits
- Check network connectivity

**JWT Verification Fails:**

- Verify `JWT_SECRET` is set
- Check token expiration
- Verify cookie is being sent
- Check for secret mismatch between environments

**Local Storage Not Working:**

- Check browser privacy settings
- Verify cookies/storage are enabled
- Check for quota exceeded errors
- Try in incognito mode

### Debug Mode

**Enable Prisma Logging:**

```typescript
// src/server/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

**Enable Next.js Debug:**

```bash
# Development
NODE_ENV=development npm run dev

# Production
NODE_ENV=production npm run build
```

**Check Environment Variables:**

```bash
# In Vercel, use Vercel CLI
vercel env ls

# Or check in deployment logs
```

## CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Generate Prisma Client
        run: npx prisma generate
        
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment Secrets

Add secrets to GitHub:
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `VERCEL_TOKEN`
- `ORG_ID`
- `PROJECT_ID`

## Monitoring

### Vercel Analytics

1. Install Vercel Analytics:
```bash
npm install @vercel/analytics
```

2. Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Tracking (Sentry)

1. Install Sentry:
```bash
npm install @sentry/nextjs
```

2. Initialize Sentry:
```bash
npx @sentry/wizard@latest -i nextjs
```

3. Configure Sentry in `sentry.client.config.ts` and `sentry.server.config.ts`

### Uptime Monitoring

Use external services:
- UptimeRobot
- Pingdom
- StatusCake

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor performance metrics
- Review storage usage
- Check database size

**Monthly:**
- Review and rotate secrets
- Update dependencies
- Review backup retention
- Check security advisories

**Quarterly:**
- Performance audit
- Security audit
- Cost review
- Architecture review

### Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update major versions (careful)
npx npm-check-updates -u
npm install
```

### Database Maintenance

```bash
# Analyze database
npx prisma db pull

# Reset database (WARNING: Deletes data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name feature_name
```

## Rollback Procedure

### Vercel Rollback

1. Go to Vercel project
2. Click "Deployments"
3. Find previous successful deployment
4. Click "..." → "Rollback"
5. Confirm rollback

### Database Rollback

```bash
# View migration history
npx prisma migrate status

# Rollback to specific migration
npx prisma migrate resolve --rolled-back "migration_name"

# Or reset and reapply
npx prisma migrate reset
```

### Emergency Rollback

If critical issue:

1. Rollback Vercel deployment
2. Rollback database migrations
3. Notify users of downtime
4. Investigate issue
5. Fix and redeploy

## Cost Optimization

### Vercel Costs

- Free tier: 100GB bandwidth/month
- Pro tier: $20/month for more bandwidth
- Monitor usage in Vercel dashboard

### Supabase Costs

- Free tier: 500MB database, 1GB storage
- Pro tier: $25/month for more resources
- Monitor usage in Supabase dashboard

### Optimization Tips

- Optimize images before upload
- Use pagination to reduce data transfer
- Implement caching where possible
- Monitor and optimize database queries
- Clean up unused storage files

## Support

### Documentation

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs

### Community

- Next.js Discord: https://discord.gg/nextjs
- Prisma Discord: https://discord.gg/prisma
- Supabase Discord: https://discord.gg/supabase
- Vercel Discord: https://discord.gg/vercel

### Troubleshooting Resources

- Next.js troubleshooting: https://nextjs.org/docs/troubleshooting
- Prisma troubleshooting: https://www.prisma.io/docs/guides/troubleshooting
- Supabase troubleshooting: https://supabase.com/docs/guides/troubleshooting
- Vercel troubleshooting: https://vercel.com/docs/troubleshooting

## Checklist

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Prisma client generated
- [ ] JWT secret set and secure
- [ ] Supabase bucket created and public
- [ ] Image upload tested
- [ ] Authentication flow tested
- [ ] Book creation tested
- [ ] Book replacement flow tested
- [ ] Pagination tested
- [ ] Local books tested
- [ ] Error handling tested
- [ ] Security review completed
- [ ] Performance review completed
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Rollback procedure documented

### Post-Deployment Checklist

- [ ] Verify deployment successful
- [ ] Test authentication
- [ ] Test book creation
- [ ] Test image upload
- [ ] Test pagination
- [ ] Test limits enforcement
- [ ] Test replacement flow
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Verify SSL certificate
- [ ] Test custom domain (if configured)
- [ ] Set up monitoring alerts
- [ ] Document any issues
- [ ] Notify team of deployment
