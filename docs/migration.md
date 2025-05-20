# Firebase to Supabase Migration Plan

This document outlines the complete step-by-step migration process from Firebase Firestore to Supabase for our Coffee Cup application.

## Table of Contents

1. [Preparation (User Tasks)](#1-preparation-user-tasks)
2. [Environment Setup](#2-environment-setup)
3. [Database Schema Creation](#3-database-schema-creation)
4. [Code Implementation](#4-code-implementation)
5. [Data Migration](#5-data-migration)
6. [Testing](#6-testing)
7. [Deployment](#7-deployment)
8. [Clean Up (Optional)](#8-clean-up-optional)

## 1. Preparation (User Tasks)

These tasks must be completed manually before proceeding with the code changes:

### 1.1. Create Supabase Account
- [ ] Sign up at [supabase.com](https://supabase.com)
- [ ] Verify email address

### 1.2. Create a New Supabase Project
- [ ] Login to the Supabase dashboard
- [ ] Click "New Project"
- [ ] Enter project name (e.g., "coffee-cup")
- [ ] Choose a strong database password (save it securely)
- [ ] Select the region closest to your users
- [ ] Click "Create new project"

### 1.3. Get API Credentials
- [ ] Once the project is created, go to Project Settings > API
- [ ] Save the following credentials in a secure place:
  - Project URL (`https://[project-id].supabase.co`)
  - `anon` public key (for client-side operations)
  - `service_role` secret key (for server-side admin operations)

### 1.4. Configure Storage
- [ ] In the Supabase dashboard, go to Storage > Buckets
- [ ] Create a new bucket called `fortune-images`
- [ ] Set RLS (Row Level Security) policies:
  - Click "New Policy"
  - For uploads: Allow authenticated users to upload files
  - For downloads: Allow public access to view files

## 2. Environment Setup

### 2.1. Install Supabase Dependencies
- [ ] Run: `npm install @supabase/supabase-js`

### 2.2. Set Up Environment Variables
- [ ] Create or update `.env.local` file with Supabase credentials:
```env
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Keep existing env vars for Clerk, OpenAI, etc.
```

## 3. Database Schema Creation

### 3.1. Create Database Schema in Supabase SQL Editor
- [ ] Go to Supabase Dashboard > SQL Editor
- [ ] Create a new query and execute the following SQL:

```sql
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for additional user data beyond Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fortunes table
CREATE TABLE fortunes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  prediction TEXT,
  name TEXT NOT NULL,
  age TEXT NOT NULL,
  intent TEXT NOT NULL,
  about TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_id UUID
);

-- For storing multiple image URLs
CREATE TABLE fortune_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fortune_id UUID REFERENCES fortunes(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  fortune_id UUID REFERENCES fortunes(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX fortunes_user_id_idx ON fortunes(user_id);
CREATE INDEX payments_user_id_idx ON payments(user_id);
CREATE INDEX fortune_images_fortune_id_idx ON fortune_images(fortune_id);
```

### 3.2. Set Up Row Level Security (RLS) for Database Tables
- [ ] Enable RLS for all tables
- [ ] Create policies to ensure users can only access their own data
- [ ] Execute the following SQL:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fortune_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users table policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = clerk_id);

-- Fortunes table policies
CREATE POLICY "Users can insert their own fortunes" ON fortunes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own fortunes" ON fortunes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own fortunes" ON fortunes
  FOR UPDATE USING (auth.uid() = user_id);

-- Fortune images policies
CREATE POLICY "Users can insert fortune images" ON fortune_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM fortunes 
      WHERE id = fortune_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view fortune images" ON fortune_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fortunes 
      WHERE id = fortune_id AND user_id = auth.uid()
    )
  );

-- Payments table policies
CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);
```

## 4. Code Implementation

### 4.1. Create Supabase Configuration File
- [ ] Create file: `lib/supabase/config.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

// Client for browser usage (limited privileges)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (elevated privileges)
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)
```

### 4.2. Create Supabase Utilities
- [ ] Create file: `lib/supabase/utils.ts` with the following functions:
```typescript
import { supabase, adminSupabase } from './config';
import { Fortune, FortuneStatus, PaymentStatus } from '@/types';

// Fortune operations
export async function createFortune(
  userId: string,
  imageUrl: string | string[],
  name: string,
  age: string,
  intent: string,
  about?: string
): Promise<string> {
  try {
    // Create the fortune record
    const { data: fortune, error: fortuneError } = await adminSupabase
      .from('fortunes')
      .insert({
        user_id: userId,
        name,
        age,
        intent,
        about: about || '',
        status: FortuneStatus.PENDING,
      })
      .select()
      .single();

    if (fortuneError) throw fortuneError;

    // Handle single or multiple image URLs
    if (typeof imageUrl === 'string') {
      const { error: imageError } = await adminSupabase
        .from('fortune_images')
        .insert({
          fortune_id: fortune.id,
          image_url: imageUrl,
        });

      if (imageError) throw imageError;
    } else if (Array.isArray(imageUrl)) {
      const imageInserts = imageUrl.map((url) => ({
        fortune_id: fortune.id,
        image_url: url,
      }));

      const { error: imagesError } = await adminSupabase
        .from('fortune_images')
        .insert(imageInserts);

      if (imagesError) throw imagesError;
    }

    return fortune.id;
  } catch (error) {
    console.error('Error creating fortune:', error);
    throw new Error('Failed to create fortune');
  }
}

export async function getFortune(fortuneId: string): Promise<Fortune | null> {
  try {
    // Get the fortune
    const { data: fortune, error: fortuneError } = await adminSupabase
      .from('fortunes')
      .select('*')
      .eq('id', fortuneId)
      .single();

    if (fortuneError) {
      if (fortuneError.code === 'PGRST116') return null; // Not found
      throw fortuneError;
    }

    // Get the associated images
    const { data: images, error: imagesError } = await adminSupabase
      .from('fortune_images')
      .select('image_url')
      .eq('fortune_id', fortuneId);

    if (imagesError) throw imagesError;

    // Format the result to match your Fortune type
    const imageUrls = images.map(img => img.image_url);
    
    return {
      id: fortune.id,
      userId: fortune.user_id,
      imageUrl: imageUrls.length === 1 ? imageUrls[0] : imageUrls,
      prediction: fortune.prediction || '',
      name: fortune.name,
      age: fortune.age,
      intent: fortune.intent,
      about: fortune.about,
      createdAt: new Date(fortune.created_at),
      status: fortune.status,
      paymentId: fortune.payment_id,
    };
  } catch (error) {
    console.error('Error getting fortune:', error);
    throw new Error('Failed to get fortune');
  }
}

export async function updateFortunePrediction(
  fortuneId: string,
  prediction: string
): Promise<void> {
  try {
    const { error } = await adminSupabase
      .from('fortunes')
      .update({
        prediction,
        status: FortuneStatus.COMPLETED,
      })
      .eq('id', fortuneId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating fortune prediction:', error);
    throw new Error('Failed to update fortune prediction');
  }
}

export async function getUserFortunes(userId: string): Promise<Fortune[]> {
  try {
    const { data: fortunes, error: fortunesError } = await adminSupabase
      .from('fortunes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fortunesError) throw fortunesError;

    // Get all image URLs for these fortunes
    const fortuneIds = fortunes.map(f => f.id);
    
    const { data: allImages, error: imagesError } = await adminSupabase
      .from('fortune_images')
      .select('fortune_id, image_url')
      .in('fortune_id', fortuneIds);

    if (imagesError) throw imagesError;

    // Group images by fortune_id
    const imagesByFortuneId = allImages.reduce((acc, img) => {
      if (!acc[img.fortune_id]) acc[img.fortune_id] = [];
      acc[img.fortune_id].push(img.image_url);
      return acc;
    }, {});

    // Format the results
    return fortunes.map(fortune => {
      const imageUrls = imagesByFortuneId[fortune.id] || [];
      return {
        id: fortune.id,
        userId: fortune.user_id,
        imageUrl: imageUrls.length === 1 ? imageUrls[0] : imageUrls,
        prediction: fortune.prediction || '',
        name: fortune.name,
        age: fortune.age,
        intent: fortune.intent,
        about: fortune.about,
        createdAt: new Date(fortune.created_at),
        status: fortune.status,
        paymentId: fortune.payment_id,
      };
    });
  } catch (error) {
    console.error('Error getting user fortunes:', error);
    throw new Error('Failed to get user fortunes');
  }
}

// Payment operations
export async function createPayment(
  userId: string,
  fortuneId: string,
  amount: number,
  currency: string,
  stripePaymentIntentId: string
): Promise<string> {
  try {
    // Create the payment record
    const { data: payment, error: paymentError } = await adminSupabase
      .from('payments')
      .insert({
        user_id: userId,
        fortune_id: fortuneId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
        stripe_payment_intent_id: stripePaymentIntentId,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update the fortune with the payment ID
    const { error: fortuneError } = await adminSupabase
      .from('fortunes')
      .update({ payment_id: payment.id })
      .eq('id', fortuneId);

    if (fortuneError) throw fortuneError;

    return payment.id;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw new Error('Failed to create payment');
  }
}

export async function updatePaymentStatus(
  paymentId: string, 
  status: PaymentStatus
): Promise<void> {
  try {
    const { error } = await adminSupabase
      .from('payments')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Failed to update payment status');
  }
}

export async function getPayment(paymentId: string) {
  try {
    const { data: payment, error } = await adminSupabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      id: payment.id,
      userId: payment.user_id,
      fortuneId: payment.fortune_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      stripePaymentIntentId: payment.stripe_payment_intent_id,
      createdAt: new Date(payment.created_at),
      updatedAt: new Date(payment.updated_at),
    };
  } catch (error) {
    console.error('Error getting payment:', error);
    throw new Error('Failed to get payment');
  }
}

// Storage operations
export async function uploadImage(userId: string, file: File): Promise<string> {
  try {
    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}-${file.name}`;
    
    const { data, error } = await supabase
      .storage
      .from('fortune-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('fortune-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract the path from the URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/fortune-images\/(.*)/);
    
    if (!pathMatch || !pathMatch[1]) {
      throw new Error('Invalid image URL format');
    }
    
    const storagePath = pathMatch[1];
    
    const { error } = await supabase
      .storage
      .from('fortune-images')
      .remove([storagePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}
```

### 4.3. Update API Routes
- [ ] Update `app/api/fortune/process/route.ts`:
  - Replace Firebase imports with Supabase
  - Update function calls to use Supabase utilities

- [ ] Update `app/api/fortune/route.ts`:
  - Replace Firebase imports with Supabase
  - Update function calls to use Supabase utilities

- [ ] Update `app/api/payment/route.ts`:
  - Replace Firebase imports with Supabase
  - Update function calls to use Supabase utilities

### 4.4. Update Components
- [ ] Update `components/fortune/FortuneForm.tsx`:
  - Replace Firebase image upload with Supabase Storage
  - Update any data handling to use Supabase utilities

- [ ] Update `components/fortune/FortuneResult.tsx`:
  - Replace Firebase data retrieval with Supabase queries
  - Update any data handling to use Supabase utilities

- [ ] Update `components/payment/PaymentForm.tsx`:
  - Replace Firebase payment handling with Supabase utilities
  - Update any data handling to use Supabase utilities

### 4.5. Update Hooks
- [ ] Update `hooks/useImageUpload.ts`:
  - Replace Firebase Storage with Supabase Storage
  - Update function calls to use Supabase utilities

- [ ] Update `hooks/useMultipleImageUpload.ts`:
  - Replace Firebase Storage with Supabase Storage
  - Update function calls to use Supabase utilities

### 4.6. Update Context Files
- [ ] Update `contexts/FortuneContext.tsx`:
  - Replace Firebase data handling with Supabase utilities
  - Update any data fetching or state management to use Supabase

## 5. Data Migration

### 5.1. Export Existing Data from Firestore
- [ ] Install Firebase Tools: `npm install -g firebase-tools`
- [ ] Login to Firebase: `firebase login`
- [ ] Export Firestore data:
```bash
firebase firestore:export ./firestore-export
```

### 5.2. Create Data Migration Script
- [ ] Create directory: `scripts`
- [ ] Create file: `scripts/migrate-data.js`
```javascript
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse exported Firestore data (adjust paths as needed)
const fortunesData = JSON.parse(readFileSync('./firestore-export/firestore_export/all_namespaces/kind_fortunes/all_namespaces_kind_fortunes.export_metadata', 'utf8'));
const paymentsData = JSON.parse(readFileSync('./firestore-export/firestore_export/all_namespaces/kind_payments/all_namespaces_kind_payments.export_metadata', 'utf8'));

// Migrate fortunes
async function migrateFortunes() {
  console.log('Starting fortune migration...');
  let successCount = 0;
  let errorCount = 0;

  for (const fortune of fortunesData) {
    try {
      // Extract data from Firestore format
      const id = fortune.id;
      const data = fortune.data;
      
      // Create fortune record in Supabase
      const { error: fortuneError } = await supabase
        .from('fortunes')
        .insert({
          id, // Keep original ID
          user_id: data.userId,
          prediction: data.prediction || '',
          name: data.name,
          age: data.age,
          intent: data.intent,
          about: data.about || '',
          status: data.status,
          created_at: new Date(data.createdAt._seconds * 1000), // Convert Firestore timestamp
        });
      
      if (fortuneError) throw fortuneError;
      
      // Handle image URLs
      if (typeof data.imageUrl === 'string') {
        const { error: imageError } = await supabase
          .from('fortune_images')
          .insert({
            fortune_id: id,
            image_url: data.imageUrl,
          });
          
        if (imageError) throw imageError;
      } else if (Array.isArray(data.imageUrl)) {
        const imageInserts = data.imageUrl.map(url => ({
          fortune_id: id,
          image_url: url,
        }));
        
        const { error: imagesError } = await supabase
          .from('fortune_images')
          .insert(imageInserts);
          
        if (imagesError) throw imagesError;
      }
      
      successCount++;
      console.log(`Migrated fortune ${id}`);
    } catch (error) {
      errorCount++;
      console.error(`Error migrating fortune ${fortune.id}:`, error);
    }
  }
  
  console.log(`Fortune migration complete. Success: ${successCount}, Errors: ${errorCount}`);
}

// Migrate payments
async function migratePayments() {
  console.log('Starting payment migration...');
  let successCount = 0;
  let errorCount = 0;

  for (const payment of paymentsData) {
    try {
      // Extract data from Firestore format
      const id = payment.id;
      const data = payment.data;
      
      // Create payment record in Supabase
      const { error } = await supabase
        .from('payments')
        .insert({
          id, // Keep original ID
          user_id: data.userId,
          fortune_id: data.fortuneId,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          stripe_payment_intent_id: data.stripePaymentIntentId,
          created_at: new Date(data.createdAt._seconds * 1000),
          updated_at: new Date(data.updatedAt._seconds * 1000),
        });
      
      if (error) throw error;
      
      // Update fortune with payment ID if it exists
      if (data.fortuneId) {
        const { error: updateError } = await supabase
          .from('fortunes')
          .update({ payment_id: id })
          .eq('id', data.fortuneId);
          
        if (updateError) throw updateError;
      }
      
      successCount++;
      console.log(`Migrated payment ${id}`);
    } catch (error) {
      errorCount++;
      console.error(`Error migrating payment ${payment.id}:`, error);
    }
  }
  
  console.log(`Payment migration complete. Success: ${successCount}, Errors: ${errorCount}`);
}

// Run migration
async function runMigration() {
  try {
    await migrateFortunes();
    await migratePayments();
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

runMigration();
```

### 5.3. Run Data Migration Script
- [ ] Install script dependencies: `npm install dotenv`
- [ ] Run the script: `node scripts/migrate-data.js`

## 6. Testing

### 6.1. Local Testing
- [ ] Create a test branch: `git checkout -b supabase-migration`
- [ ] Implement all the changes above
- [ ] Start local development server: `npm run dev`
- [ ] Test the following functionality:
  - User authentication (ensure Clerk integration still works)
  - Creating new fortunes
  - Viewing existing fortunes (migrated data)
  - Image upload to Supabase storage
  - Payment creation and processing
  - Fortune prediction generation

### 6.2. Run Automated Tests
- [ ] Update test files to use Supabase instead of Firebase:
  - Update `__tests__/lib/firebase/utils.test.ts` -> rename to `__tests__/lib/supabase/utils.test.ts`
  - Update any other affected test files
- [ ] Run tests: `npm test`
- [ ] Fix any failing tests

## 7. Deployment

### 7.1. Environment Variable Setup
- [ ] Add Supabase environment variables to your production environment:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 7.2. Deploy Application
- [ ] Review all changes: `git diff`
- [ ] Commit changes: `git commit -m "Migrate from Firestore to Supabase"`
- [ ] Push to repository: `git push origin supabase-migration`
- [ ] Create and merge Pull Request
- [ ] Deploy to production

### 7.3. Post-Deployment Verification
- [ ] Verify all functionality works in production
- [ ] Monitor error logs for any issues
- [ ] Verify data migration was successful

## 8. Clean Up (Optional)

### 8.1. Remove Firebase Dependencies
- [ ] After confirming everything works, you can remove Firebase dependencies:
  - Update `package.json` to remove Firebase packages
  - Run `npm install` to update `package-lock.json`

### 8.2. Remove Firebase Files
- [ ] Remove Firebase configuration and utility files:
  - `lib/firebase/admin.ts`
  - `lib/firebase/config.ts`
  - `lib/firebase/index.ts`
  - `lib/firebase/schema.ts`
  - `lib/firebase/utils.ts`

### 8.3. Downgrade Firebase Plan
- [ ] Once migration is complete, downgrade your Firebase plan if necessary
