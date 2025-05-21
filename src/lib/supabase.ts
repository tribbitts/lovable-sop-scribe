
import { createClient } from '@supabase/supabase-js';

// Try to get from environment variables first
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check localStorage for stored credentials
const storedUrl = localStorage.getItem('supabase_url');
const storedKey = localStorage.getItem('supabase_anon_key');

// Use stored credentials if available
if (storedUrl && storedKey) {
  supabaseUrl = storedUrl;
  supabaseAnonKey = storedKey;
}

// Verify that the required variables are defined
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'https://placeholder-url.supabase.co' || 
    supabaseAnonKey === 'placeholder-key') {
  console.error('Missing or invalid Supabase credentials. Please configure them in the settings.');
}

// Store the credentials in localStorage
export const storeSupabaseCredentials = (url: string, key: string): void => {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_anon_key', key);
  window.location.reload(); // Reload to initialize with new credentials
};

// Initialize Supabase client with more detailed error handling
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Check if Supabase connection is working
export const testSupabaseConnection = async () => {
  try {
    // Simple ping to verify connection
    const { error } = await supabase.from('pdf_usage').select('count', { count: 'exact', head: true });
    return error === null || error.message !== 'FetchError: fetch failed';
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return false;
  }
};

// Create a subscription client that will be used to track PDF usage
export const createPdfUsageRecord = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('pdf_usage')
      .insert({
        user_id: userId,
        created_at: new Date().toISOString()
      });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating PDF usage record:", error);
    return null;
  }
};

// Check if user has reached daily PDF limit (1 per day for free tier)
export const checkPdfUsageLimit = async (userId: string): Promise<boolean> => {
  try {
    // Get current date in ISO format without the time component
    const today = new Date().toISOString().split('T')[0];
    
    // Count PDFs generated today by this user
    const { data, error, count } = await supabase
      .from('pdf_usage')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`);
      
    if (error) throw error;
    
    // Return true if user has not reached daily limit
    return (count !== undefined && count < 1);
  } catch (error) {
    console.error("Error checking PDF usage limit:", error);
    return false; // Default to restricting access on error
  }
};

// Get user subscription status
export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found" error
    
    return data || null;
  } catch (error) {
    console.error("Error getting user subscription:", error);
    return null;
  }
};
