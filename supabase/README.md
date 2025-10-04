# Supabase Setup for Stringy-Thingy

This directory contains the Supabase configuration and migration files for the Stringy-Thingy project.

## Files Structure

- `config.toml` - Supabase project configuration
- `migrations/` - Database migration files
  - `20240101000001_initial_schema.sql` - Initial database schema
  - `20240101000002_rls_policies.sql` - Row Level Security policies
  - `20240101000003_functions_and_triggers.sql` - Database functions and triggers
  - `20240101000004_storage_policies.sql` - Storage bucket policies

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

### 2. Configure Environment Variables

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations

Execute the SQL files in the Supabase SQL Editor in this order:

1. `20240101000001_initial_schema.sql` - Creates all tables
2. `20240101000002_rls_policies.sql` - Sets up security policies
3. `20240101000003_functions_and_triggers.sql` - Creates functions and triggers
4. `20240101000004_storage_policies.sql` - Sets up storage policies

### 4. Create Storage Buckets

In the Supabase Dashboard, go to Storage and create these buckets:

- `user-images` (private)
- `product-images` (public)
- `generated-patterns` (private)

### 5. Test the Setup

1. Start your Next.js development server: `npm run dev`
2. Navigate to `/login`
3. Create a test account
4. Verify authentication works
5. Test kit code redemption

## Database Schema

### Tables Created

- **profiles** - User profiles extending auth.users
- **kit_codes** - Kit codes for generation limits
- **generations** - User-generated string art patterns
- **products** - Product catalog
- **orders** - Order management
- **content** - CMS content

### Security Features

- Row Level Security (RLS) enabled on all tables
- User-specific data access
- Admin-only operations for sensitive data
- Secure storage policies

## Functions

- `handle_new_user()` - Automatically creates profile on signup
- `increment_kit_usage()` - Tracks kit code usage

## Storage Policies

- Users can only access their own images
- Product images are public
- Generated patterns are private to users
- Admins have full access to all storage
