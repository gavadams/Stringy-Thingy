# Stringy-Thingy Supabase Setup Guide

## 🚀 Complete Backend Setup Instructions

This guide will walk you through setting up the complete Supabase backend for Stringy-Thingy.

## 📋 Prerequisites

- ✅ Session 1 completed (Next.js project setup)
- ✅ Supabase account created
- ✅ Supabase project created

## 🔧 Step 1: Environment Configuration

### 1.1 Update .env.local
Replace the placeholder values in `.env.local` with your actual Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to find these values:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key
4. Copy the service_role key (keep this secret!)

## 🗄️ Step 2: Database Schema Setup

### 2.1 Run Database Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Click "Run" to execute the schema

**This creates:**
- ✅ `profiles` table (extends auth.users)
- ✅ `kit_codes` table (for kit code management)
- ✅ `generations` table (for user string art creations)
- ✅ `products` table (for e-commerce)
- ✅ `orders` table (for order management)
- ✅ `content` table (for CMS)
- ✅ Row Level Security (RLS) policies
- ✅ Database functions and triggers

### 2.2 Verify Tables Created
1. Go to Table Editor in Supabase
2. Verify all tables are created:
   - profiles
   - kit_codes
   - generations
   - products
   - orders
   - content

## 🗂️ Step 3: Storage Buckets Setup

### 3.1 Create Storage Buckets
1. Go to Storage in your Supabase dashboard
2. Create the following buckets:

**Bucket 1: `user-images`**
- Public: No (private)
- File size limit: 10MB
- Allowed MIME types: image/*

**Bucket 2: `product-images`**
- Public: Yes
- File size limit: 5MB
- Allowed MIME types: image/*

**Bucket 3: `generated-patterns`**
- Public: No (private)
- File size limit: 5MB
- Allowed MIME types: image/*

### 3.2 Set Storage Policies
1. Go to SQL Editor
2. Copy and paste the contents of `storage-policies.sql`
3. Click "Run" to execute the policies

## 🔐 Step 4: Authentication Setup

### 4.1 Configure Auth Settings
1. Go to Authentication > Settings in Supabase
2. Configure the following:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/dashboard
http://localhost:3000/login
```

**Email Settings:**
- Enable email confirmations (recommended)
- Configure SMTP settings (optional)

### 4.2 Test Authentication
1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Try creating a test account
4. Check Supabase Auth > Users to see the new user

## 🧪 Step 5: Testing the Setup

### 5.1 Test Database Connection
1. Go to SQL Editor in Supabase
2. Run this test query:
```sql
SELECT * FROM profiles LIMIT 1;
```

### 5.2 Test Authentication Flow
1. **Sign Up Test:**
   - Go to `/login`
   - Click "Sign Up" tab
   - Create a test account
   - Check email for verification (if enabled)

2. **Sign In Test:**
   - Go to `/login`
   - Click "Sign In" tab
   - Enter credentials
   - Should redirect to `/dashboard`

3. **Kit Code Redemption Test:**
   - Go to `/login`
   - Click "Redeem Kit" tab
   - Create account with kit code
   - Check database for kit code association

### 5.3 Test Route Protection
1. **Protected Routes:**
   - Try accessing `/dashboard` without login (should redirect to `/login`)
   - Try accessing `/admin` without admin role (should redirect to `/dashboard`)

2. **Middleware Test:**
   - Check browser console for any errors
   - Verify redirects work correctly

## 🔧 Step 6: Create Test Data

### 6.1 Create Test Kit Codes
Run this SQL in Supabase SQL Editor:

```sql
-- Insert test kit codes
INSERT INTO kit_codes (code, kit_type, max_generations) VALUES
('STARTER-001', 'starter', 3),
('STANDARD-001', 'standard', 5),
('PREMIUM-001', 'premium', 10);
```

### 6.2 Create Test Products
```sql
-- Insert test products
INSERT INTO products (name, description, price, kit_type, pegs, lines, frame_size) VALUES
('Starter Kit', 'Perfect for beginners', 29.99, 'starter', 24, 12, '8x8'),
('Standard Kit', 'Great for regular use', 49.99, 'standard', 36, 18, '12x12'),
('Premium Kit', 'Professional quality', 79.99, 'premium', 48, 24, '16x16');
```

### 6.3 Create Admin User
```sql
-- Update a user to admin role (replace with actual user ID)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

## 🚨 Troubleshooting

### Common Issues

**1. "Invalid API key" error:**
- ✅ Check your `.env.local` file has correct values
- ✅ Restart your development server
- ✅ Verify the keys in Supabase dashboard

**2. "Row Level Security" errors:**
- ✅ Ensure RLS policies are created
- ✅ Check user authentication status
- ✅ Verify user has correct role

**3. "Redirect URL mismatch" error:**
- ✅ Check Supabase Auth settings
- ✅ Ensure redirect URLs are configured
- ✅ Update site URL in Supabase

**4. Database connection issues:**
- ✅ Verify database schema is created
- ✅ Check table permissions
- ✅ Ensure RLS policies are active

### Debug Steps

1. **Check Console Logs:**
   - Open browser dev tools
   - Look for any JavaScript errors
   - Check network tab for failed requests

2. **Verify Environment Variables:**
   ```bash
   # Check if variables are loaded
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

3. **Test Database Connection:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT current_user, current_database();
   ```

## 📊 Step 7: Verify Complete Setup

### 7.1 Checklist
- [ ] Environment variables configured
- [ ] Database schema created
- [ ] Storage buckets created
- [ ] Storage policies applied
- [ ] Auth settings configured
- [ ] Test data created
- [ ] Authentication flow working
- [ ] Route protection working
- [ ] Admin access working

### 7.2 Test All Features
1. **User Registration:**
   - [ ] Sign up works
   - [ ] Email verification (if enabled)
   - [ ] Profile created in database

2. **User Authentication:**
   - [ ] Sign in works
   - [ ] Sign out works
   - [ ] Session persistence

3. **Kit Code Redemption:**
   - [ ] Kit code validation
   - [ ] User association
   - [ ] Usage tracking

4. **Route Protection:**
   - [ ] Dashboard access
   - [ ] Admin access
   - [ ] Redirects work

5. **Database Operations:**
   - [ ] User data retrieval
   - [ ] Kit code management
   - [ ] Generation tracking

## 🎯 Next Steps

After successful setup:

1. **Create Admin Account:**
   - Sign up with admin email
   - Update role to 'admin' in database
   - Test admin panel access

2. **Test Kit Code Flow:**
   - Create kit codes in admin panel
   - Test redemption process
   - Verify usage tracking

3. **Test Generation System:**
   - Create test generations
   - Verify image upload
   - Test usage limits

4. **Production Setup:**
   - Update environment variables for production
   - Configure production Supabase project
   - Set up monitoring and logging

## 📞 Support

If you encounter issues:

1. **Check the logs:**
   - Browser console
   - Supabase logs
   - Next.js server logs

2. **Verify configuration:**
   - Environment variables
   - Database schema
   - Auth settings

3. **Test step by step:**
   - Database connection
   - Authentication
   - Route protection
   - Storage access

---

**Setup completed successfully!** 🎉

Your Stringy-Thingy backend is now fully configured with:
- ✅ Complete database schema
- ✅ Authentication system
- ✅ Route protection
- ✅ Storage buckets
- ✅ Admin functionality
- ✅ Kit code management
