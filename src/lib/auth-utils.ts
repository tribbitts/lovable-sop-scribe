
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if Supabase credentials are missing or placeholder values
 */
export const isMissingCredentials = (): boolean => {
  const url = localStorage.getItem('supabase_url');
  const key = localStorage.getItem('supabase_anon_key');
  return !url || !key || 
         url === 'https://placeholder-url.supabase.co' || 
         key === 'placeholder-key';
};

/**
 * Handles sign in with email and password
 */
export const handleSignIn = async (
  email: string, 
  password: string,
  isConnected: boolean
): Promise<{ error: string | null }> => {
  try {
    if (!isConnected) {
      throw new Error("Unable to connect to authentication service. Please check your network connection.");
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    toast({
      title: "Welcome back!",
      description: "You have successfully signed in.",
    });
    
    return { error: null };
  } catch (error: any) {
    const errorMessage = error.message || "Error signing in";
    
    toast({
      title: "Error signing in",
      description: errorMessage,
      variant: "destructive",
    });
    
    return { error: errorMessage };
  }
};

/**
 * Handles sign up with email and password
 */
export const handleSignUp = async (
  email: string, 
  password: string,
  isConnected: boolean,
  isDev: boolean
): Promise<{ error: string | null }> => {
  try {
    if (!isConnected) {
      throw new Error("Unable to connect to authentication service. Please check your network connection.");
    }
    
    // In development mode, use auto-confirm for easier testing
    let options = {};
    if (isDev) {
      options = { emailRedirectTo: window.location.origin + '/app' };
    }
    
    const { error, data } = await supabase.auth.signUp({ 
      email, 
      password,
      options
    });
    
    if (error) throw error;
    
    // Special case for the admin account
    if (email === 'Onoki82@gmail.com') {
      // Create admin entry if this is the admin email
      const { error: adminError } = await supabase
        .from('admins')
        .insert({ user_id: data.user?.id });
      
      if (adminError) {
        console.error("Error creating admin record:", adminError);
        // Continue anyway, just log the error
      } else {
        toast({
          title: "Admin account created",
          description: "You have administrator privileges.",
        });
      }
    }
    
    toast({
      title: "Account created",
      description: isDev 
        ? "Development account created. You can now sign in." 
        : "Please check your email for the confirmation link.",
    });
    
    return { error: null };
  } catch (error: any) {
    const errorMessage = error.message || "Error creating account";
    
    toast({
      title: "Error creating account",
      description: errorMessage,
      variant: "destructive",
    });
    
    return { error: errorMessage };
  }
};

/**
 * Handles sign out
 */
export const handleSignOut = async (isConnected: boolean): Promise<{ error: string | null }> => {
  try {
    if (!isConnected) {
      throw new Error("Unable to connect to authentication service. Please check your network connection.");
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    
    return { error: null };
  } catch (error: any) {
    const errorMessage = error.message || "Error signing out";
    console.error("Sign out error:", error);
    
    toast({
      title: "Error signing out",
      description: errorMessage,
      variant: "destructive",
    });
    
    return { error: errorMessage };
  }
};
