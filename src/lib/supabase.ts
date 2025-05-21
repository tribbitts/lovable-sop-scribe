
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verify that the required environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Create a subscription client that will be used to track PDF usage
export const createPdfUsageRecord = async (userId: string) => {
  const { data, error } = await supabase
    .from('pdf_usage')
    .insert({
      user_id: userId,
      created_at: new Date().toISOString()
    });
    
  if (error) throw error;
  return data;
};

// Check if user has reached daily PDF limit (1 per day for free tier)
export const checkPdfUsageLimit = async (userId: string): Promise<boolean> => {
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
};

// Get user subscription status
export const getUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found" error
  
  return data || null;
};
