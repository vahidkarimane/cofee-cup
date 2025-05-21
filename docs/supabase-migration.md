# Migrating from Firebase to Supabase

This document outlines the steps to migrate the Coffee Cup Fortune application from Firebase to Supabase.

## Prerequisites

1. A Supabase account and project
2. Supabase project URL and API keys
3. Supabase storage bucket named `coffee-cup` (already created)

## Migration Steps

### 1. Update Environment Variables

Add the following to your `.env.local` file:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

The `SUPABASE_SERVICE_ROLE_KEY` is required for running migrations and can be found in your Supabase project settings under "API" > "Project API keys" > "service_role key (secret)".

### 2. Database Tables

The necessary tables have been created in Supabase using the MCP tool:

- `fortunes`: Stores fortune readings
- `payments`: Stores payment information

These tables have appropriate indexes and row-level security policies set up. Since we're using Clerk for authentication instead of Supabase Auth, the RLS policies are currently set to allow all operations. In a production environment, you may want to implement more restrictive policies based on your authentication strategy.

The "coffee-cup" storage bucket has also been created for storing images.

### 3. Update Code References

The following files have been updated to use Supabase instead of Firebase:

- `lib/supabase/config.ts`: Supabase client configuration
- `lib/supabase/utils.ts`: Utility functions for Supabase
- `app/api/fortune/direct-prediction/route.ts`: API route for direct fortune predictions
- `app/api/fortune/route.ts`: API route for fortune submissions
- `app/api/fortune/process/route.ts`: API route for processing fortunes
- `app/api/payment/route.ts`: API route for payments
- `hooks/useMultipleImageUpload.ts`: Hook for uploading images to Supabase storage

### 4. Testing

After completing the migration, test the following functionality:

1. User authentication with Clerk
2. Uploading images to Supabase storage
3. Creating fortune readings
4. Processing payments
5. Viewing fortune results

## Troubleshooting

If you encounter any issues with the migration, check the following:

1. Ensure all environment variables are correctly set
2. Verify that the Supabase tables were created successfully
3. Check that the Supabase storage bucket `coffee-cup` exists
4. Review the browser console and server logs for any errors
