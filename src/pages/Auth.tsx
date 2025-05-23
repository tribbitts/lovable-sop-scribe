
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import SupabaseConfig from "@/components/auth/SupabaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storeSupabaseCredentials } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if Supabase credentials are missing
  const isMissingCredentials = () => {
    const url = localStorage.getItem('supabase_url');
    const key = localStorage.getItem('supabase_anon_key');
    return !url || !key || 
           url === 'https://placeholder-url.supabase.co' || 
           key === 'placeholder-key';
  };

  // Function to check if super user exists
  const checkSuperUserExists = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'tribbit@tribbit.gg',
        password: '5983iuYN42z#hi&'
      });
      
      // If login works, the user exists
      if (data.user) {
        return true;
      }
      
      // If error is not about invalid credentials, throw it
      if (error && !error.message.includes('Invalid login credentials') && 
          !error.message.includes('Email not confirmed')) {
        throw error;
      }
      
      // If we get invalid credentials or email not confirmed, try to look up the user
      // Using any type to handle admin API response
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers() as { 
        data: { users?: { email: string }[] } | null,
        error: Error | null 
      };
      
      if (userError) {
        console.error("Error checking users:", userError);
        return false;
      }
      
      // Check if the super user exists in the list
      const superUser = userData?.users?.find(u => u.email === 'tribbit@tribbit.gg');
      return !!superUser;
    } catch (error) {
      // Assume user doesn't exist if there's an error
      console.error("Error checking super user:", error);
      return false;
    }
  };

  // Function to create the super user if it doesn't exist
  const createSuperUserIfNeeded = async () => {
    const superUserExists = await checkSuperUserExists();
    
    if (!superUserExists) {
      try {
        // Create super user with admin.createUser to bypass email confirmation
        // Using any type to handle admin API response
        const { data, error } = await supabase.auth.admin.createUser({
          email: 'tribbit@tribbit.gg',
          password: '5983iuYN42z#hi&',
          email_confirm: true // Auto-confirm the email
        }) as { data: any, error: Error | null };
        
        if (error) throw error;
        
        toast({
          title: "Super user created",
          description: "The super user account has been created successfully."
        });
        
        return true;
      } catch (error) {
        console.error("Error creating super user:", error);
        
        // Fall back to regular signup if admin create fails
        try {
          // We need to properly type this call to signUp to avoid the TypeScript error
          await signUp('tribbit@tribbit.gg', '5983iuYN42z#hi&');
          
          // Since regular signup doesn't auto-confirm, let's directly update the user in the database
          const { error: confirmError } = await supabase.rpc('confirm_super_user');
          
          if (confirmError) {
            console.error("Error confirming super user:", confirmError);
          }
          
          toast({
            title: "Super user created",
            description: "The super user account has been created successfully."
          });
          
          return true;
        } catch (signUpError) {
          console.error("Error in fallback signup:", signUpError);
          return false;
        }
      }
    }
    
    return superUserExists;
  };

  const handleSuperUserLogin = async () => {
    setLoading(true);
    try {
      // First ensure the super user exists
      await createSuperUserIfNeeded();
      
      // Then attempt to sign in
      await signIn('tribbit@tribbit.gg', '5983iuYN42z#hi&');
      navigate('/app');
    } catch (error) {
      console.error('Error signing in as super user:', error);
      toast({
        title: "Login Failed",
        description: "There was an issue signing in as super user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Check if the admin configuration mode is enabled via URL parameter ONLY
    const configMode = searchParams.get('config') === 'true';
    setShowConfig(configMode);

    // If user is already authenticated, redirect to app
    if (user) {
      navigate("/app");
    }
    
    // Auto-store provided credentials if none exist yet
    if (isMissingCredentials()) {
      storeSupabaseCredentials(
        "https://tdgslnywgmwrovzulvno.supabase.co", 
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZ3Nsbnl3Z213cm92enVsdm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NDk5MzEsImV4cCI6MjA2MzQyNTkzMX0.T2rlM7e2JV_tPREEJFzeRj-BULyR2Mw32rIRFMmWAe0"
      );
      // The page will reload from the storeSupabaseCredentials function
    }
  }, [user, navigate, searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-medium tracking-tight text-white">SOP</span>
            <span className="text-3xl font-light tracking-tight text-[#007AFF]">ify</span>
          </div>
          <p className="text-zinc-400 mt-2">Create professional SOPs in minutes</p>
        </div>
        
        {showConfig ? (
          <>
            <SupabaseConfig />
            <div className="mt-4 text-center">
              <button 
                className="text-zinc-400 hover:text-white bg-transparent border-none cursor-pointer"
                onClick={() => setShowConfig(false)}
              >
                Already have credentials configured? Sign in
              </button>
            </div>
          </>
        ) : (
          <>
            <Card className="bg-[#1E1E1E] border-zinc-800">
              <CardHeader>
                <CardTitle className="text-center text-white">Account Access</CardTitle>
              </CardHeader>
              <CardContent>
                <AuthForm />
                <div className="mt-6 pt-6 border-t border-zinc-700 text-center">
                  <p className="text-zinc-400 text-sm mb-2">Log in as super user with full access</p>
                  <Button 
                    onClick={handleSuperUserLogin} 
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login as Super User'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
