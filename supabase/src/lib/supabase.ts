
import { createClient } from '@supabase/supabase-js';

// Try to get from environment variables first
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Default to provided credentials
if (!supabaseUrl || !supabaseAnonKey) {
  supabaseUrl = "https://tdgslnywgmwrovzulvno.supabase.co";
  supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZ3Nsbnl3Z213cm92enVsdm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NDk5MzEsImV4cCI6MjA2MzQyNTkzMX0.T2rlM7e2JV_tPREEJFzeRj-BULyR2Mw32rIRFMmWAe0";
}

// Check localStorage for stored credentials
const storedUrl = localStorage.getItem('supabase_url');
const storedKey = localStorage.getItem('supabase_anon_key');

// Use stored credentials if available
if (storedUrl && storedKey) {
  supabaseUrl = storedUrl;
  supabaseAnonKey = storedKey;
}

// Store the credentials in localStorage
export const storeSupabaseCredentials = (url: string, key: string): void => {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_anon_key', key);
  window.location.reload(); // Reload to initialize with new credentials
};

// Initialize Supabase client with production-ready configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'sopify-app'
    }
  }
});

// Enhanced connection test with retry logic
export const testSupabaseConnection = async (retries: number = 3): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      const { error } = await supabase.from('subscriptions').select('count', { count: 'exact', head: true });
      if (!error) return true;
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    } catch (error) {
      console.warn(`Supabase connection attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  return false;
};

// Enhanced PDF usage tracking with error handling
export const createPdfUsageRecord = async (userId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('pdf_usage')
      .insert({
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating PDF usage record:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to create PDF usage record:", error);
    return null;
  }
};

// Enhanced PDF usage limit check with better date handling
export const checkPdfUsageLimit = async (userId: string): Promise<boolean> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const { count, error } = await supabase
      .from('pdf_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString());
      
    if (error) {
      console.error("Error checking PDF usage limit:", error);
      return false; // Default to restricting access on error
    }
    
    return (count !== null && count < 1);
  } catch (error) {
    console.error("Failed to check PDF usage limit:", error);
    return false;
  }
};

// Enhanced subscription retrieval with caching
let subscriptionCache: { [userId: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getUserSubscription = async (userId: string, useCache: boolean = true): Promise<any> => {
  // Check cache first if enabled
  if (useCache && subscriptionCache[userId]) {
    const { data, timestamp } = subscriptionCache[userId];
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error("Error getting user subscription:", error);
      throw error;
    }
    
    const result = data || null;
    
    // Cache the result
    if (useCache) {
      subscriptionCache[userId] = {
        data: result,
        timestamp: Date.now()
      };
    }
    
    return result;
  } catch (error) {
    console.error("Failed to get user subscription:", error);
    return null;
  }
};

// Clear subscription cache
export const clearSubscriptionCache = (userId?: string): void => {
  if (userId) {
    delete subscriptionCache[userId];
  } else {
    subscriptionCache = {};
  }
};

// Health check function for monitoring
export const performHealthCheck = async (): Promise<{
  supabase: boolean;
  auth: boolean;
  database: boolean;
}> => {
  const results = {
    supabase: false,
    auth: false,
    database: false
  };

  try {
    // Test basic Supabase connection
    results.supabase = await testSupabaseConnection(1);
    
    // Test auth system
    try {
      const { data } = await supabase.auth.getSession();
      results.auth = true;
    } catch {
      results.auth = false;
    }
    
    // Test database queries
    try {
      const { error } = await supabase.from('subscriptions').select('count', { count: 'exact', head: true });
      results.database = !error;
    } catch {
      results.database = false;
    }
  } catch (error) {
    console.error("Health check failed:", error);
  }

  return results;
};
