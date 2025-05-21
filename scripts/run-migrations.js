#!/usr/bin/env node

const {createClient} = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({path: '.env.local'});

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error('Missing Supabase URL or service role key. Please check your .env.local file.');
	process.exit(1);
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
	try {
		console.log('Running Supabase migrations...');

		// Read the migration file
		const migrationPath = path.join(__dirname, '..', 'migrations', 'create_supabase_tables.sql');
		const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

		// Execute the SQL
		const {error} = await supabase.rpc('pgexec', {sql: migrationSQL});

		if (error) {
			console.error('Migration failed:', error);
			process.exit(1);
		}

		console.log('Migration completed successfully!');
	} catch (err) {
		console.error('Error running migration:', err);
		process.exit(1);
	}
}

runMigration();
