// Test Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uvmzvttewgcmutghbyoy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bXp2dHRld2djbXV0Z2hieW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTkwMTQsImV4cCI6MjA3NDk5NTAxNH0.6vo8Z8CRG7ux-Yt1FHcOtZwuUAHGL0mpvbPKfdlkUE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect
    console.log('📡 Testing basic connection...');
    
    // Test 2: Try to fetch animals
    console.log('🐕 Fetching animals...');
    const { data: animals, error: animalsError } = await supabase
      .from('animals')
      .select('*')
      .limit(5);
    
    console.log('Animals result:', { animals, animalsError });
    
    // Test 3: Try to fetch organizations
    console.log('🏢 Fetching organizations...');
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*');
    
    console.log('Organizations result:', { orgs, orgsError });
    
    // Test 4: Check if RLS is enabled
    console.log('🔒 Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_rls_policies', { table_name: 'animals' })
      .catch(() => ({ data: null, error: 'RPC not available' }));
    
    console.log('RLS policies result:', { policies, policiesError });
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();
