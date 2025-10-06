# 🔐 Supabase Auth Setup Guide for 4Paws

This guide will walk you through setting up Supabase Authentication for your 4Paws multi-tenant animal shelter management system.

## 📋 Prerequisites

- Access to your Supabase project dashboard
- Basic understanding of SQL and database concepts
- Your 4Paws application running locally

## 🚀 Step-by-Step Setup

### Step 1: Configure Supabase Authentication Settings

1. **Go to your Supabase Dashboard**
   - Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your 4Paws project

2. **Configure Authentication Settings**
   - Go to **Authentication** → **Settings** in the left sidebar
   - Under **General**:
     - ✅ Enable **Enable email confirmations**
     - Set **Site URL** to: `http://localhost:3000`
     - Add to **Redirect URLs**: `http://localhost:3000/**`
   - Under **Email**:
     - Configure your SMTP settings (optional but recommended)
     - Customize email templates for signup confirmation

3. **Configure Auth Providers**
   - Go to **Authentication** → **Providers**
   - Ensure **Email** provider is enabled
   - You can optionally enable other providers (Google, GitHub, etc.)

### Step 2: Run Database Setup Script

1. **Open Supabase SQL Editor**
   - Go to **SQL Editor** in your Supabase dashboard
   - Click **New Query**

2. **Run the Setup Script**
   - Copy the contents of `supabase-auth-setup.sql` (created in your project)
   - Paste it into the SQL Editor
   - Click **Run** to execute the script

3. **Verify Tables Created**
   - Go to **Table Editor** in your Supabase dashboard
   - You should see these new tables:
     - `organizations`
     - `users`
     - `user_memberships`

### Step 3: Test Authentication

1. **Start Your Application**
   ```bash
   cd /Users/vaibhavchoudhary/4Paws
   /Users/vaibhavchoudhary/.bun/bin/bun run dev
   ```

2. **Test Signup Flow**
   - Navigate to `http://localhost:3000/signup`
   - Try creating a new account
   - Check your email for confirmation (if email is configured)

3. **Test Login Flow**
   - Navigate to `http://localhost:3000/login`
   - Try logging in with your new account

### Step 4: Configure Environment Variables

1. **Update your Supabase configuration**
   - The current configuration in `apps/4paws-web/src/lib/supabase.ts` should work
   - If you need to update the URL or key, do it there

2. **Test API calls**
   - Check the browser console for any authentication errors
   - Verify that data is being fetched correctly

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check that your Supabase URL and anon key are correct
   - Verify the keys in your Supabase dashboard under **Settings** → **API**

2. **"Row Level Security" errors**
   - Make sure you ran the complete setup script
   - Check that RLS policies are created correctly

3. **"User not found" after signup**
   - Check that the `handle_new_user()` function is working
   - Look at the Supabase logs for any errors

4. **Can't see data after login**
   - Verify that user memberships are created correctly
   - Check that RLS policies allow access to the data

### Debug Steps

1. **Check Supabase Logs**
   - Go to **Logs** in your Supabase dashboard
   - Look for any error messages

2. **Test Database Queries**
   - Use the SQL Editor to test queries manually
   - Verify that RLS policies are working

3. **Check Browser Console**
   - Look for JavaScript errors
   - Check network requests in DevTools

## 📊 Database Schema Overview

After running the setup script, you'll have:

### Core Tables
- **`organizations`** - Shelter organizations
- **`users`** - User profiles (linked to Supabase auth)
- **`user_memberships`** - User-organization relationships with roles

### Data Tables (with RLS)
- **`animals`** - Animal records (scoped to organization)
- **`medical_records`** - Medical data (scoped to organization)
- **`adoptions`** - Adoption records (scoped to organization)
- **`fosters`** - Foster assignments (scoped to organization)
- **`volunteer_activities`** - Volunteer data (scoped to organization)

### Security Features
- **Row Level Security (RLS)** - Data isolation between organizations
- **Role-based access** - Different permissions per role
- **Automatic user creation** - Trigger creates profile on signup

## 🎯 Next Steps

1. **Test the complete flow**:
   - Sign up as a new user
   - Request access to an organization
   - Approve the request (as admin)
   - Login and access the dashboard

2. **Customize for your needs**:
   - Add more organizations
   - Customize email templates
   - Add additional user fields

3. **Deploy to production**:
   - Update Site URL and Redirect URLs for your domain
   - Configure production email settings
   - Set up proper monitoring

## 🆘 Need Help?

If you encounter any issues:

1. Check the Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
2. Look at the Supabase logs for error messages
3. Test individual components in the SQL Editor
4. Verify your environment variables are correct

The authentication system is now ready to handle multi-tenant shelter management with proper security and access control!
