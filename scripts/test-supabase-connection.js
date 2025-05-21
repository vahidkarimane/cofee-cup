#!/usr/bin/env node

const {createClient} = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	console.error('Missing Supabase URL or anon key. Please check your .env.local file.');
	process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
	try {
		console.log('Testing Supabase connection...');

		// Simple query to test connection
		const {data, error} = await supabase.from('fortunes').select('count(*)');

		if (error) {
			console.error('Error connecting to Supabase:', error);
		} else {
			console.log('Connection successful!');
			console.log('Fortunes count:', data[0].count);
			console.log('Tables are properly set up.');
		}

		// Test storage bucket
		console.log('\nTesting Supabase storage...');
		const {data: buckets, error: bucketsError} = await supabase.storage.listBuckets();

		if (bucketsError) {
			console.error('Error listing storage buckets:', bucketsError);
		} else {
			console.log('Available buckets:', buckets.map((b) => b.name).join(', '));

			// Check if coffee-cup bucket exists
			const coffeeCupBucket = buckets.find((b) => b.name === 'coffee-cup');
			if (coffeeCupBucket) {
				console.log('✅ "coffee-cup" bucket found!');
			} else {
				console.log(
					'❌ "coffee-cup" bucket not found. Please create it in the Supabase dashboard.'
				);
			}
		}
	} catch (err) {
		console.error('Unexpected error:', err);
	}
}

testConnection();
