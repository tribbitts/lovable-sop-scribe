
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import SupabaseConfig from "@/components/auth/SupabaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { storeSupabaseCredentials } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Auth = () => {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfig, setShowConfig] = useState(false);
  const [isDev] = useState(() => import.meta.env.MODE === 'development');
  const [devLoading, setDevLoading] = useState(false);
  
  // Check if Supabase credentials are missing
  const isMissingCredentials = () => {
    const url = localStorage.getItem('supabase_url');
    const key = localStorage.getItem('supabase_anon_key');
    return !url || !key || 
           url === 'https://placeholder-url.supabase.co' || 
           key === 'placeholder-key';
  };
  
  // Development-only quick login handler
  const handleDevLogin = async () => {
    if (isDev) {
      try {
        setDevLoading(true);
        
        // Check if dev account exists first
        const { data: userExists } = await supabase.auth.admin
          .getUserByEmail('dev@example.com')
          .catch(() => ({ data: null }));
        
        // If user doesn't exist, create it first
        if (!userExists) {
          // Try to create the development account
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'dev@example.com',
            password: 'password123',
            options: {
              data: { role: 'developer' }
            }
          });
          
          if (signUpError) {
            // If sign-up fails, try direct sign-in
            console.log('Failed to create dev account, attempting login:', signUpError);
          } else {
            toast({
              title: "Dev Account Created",
              description: "Created development account automatically",
            });
            
            // Auto-confirm the user for development purposes
            try {
              // This is admin functionality that might not be available
              await supabase.auth.admin.updateUserById(
                'dev@example.com',
                { email_confirm: true }
              ).catch(() => console.log('Unable to auto-confirm user - this is expected'));
            } catch (err) {
              console.log('Unable to auto-confirm user:', err);
            }
          }
        }
        
        // Attempt to sign in with dev credentials
        await signIn('dev@example.com', 'password123');
        navigate('/app');
      } catch (error) {
        console.error('Development login failed:', error);
        toast({
          title: "Development Login Failed",
          description: "Please create a user account manually or check Supabase configuration",
          variant: "destructive",
        });
      } finally {
        setDevLoading(false);
      }
    }
  };
  
  useEffect(() => {
    // Check if the admin configuration mode is enabled via URL parameter
    const configMode = searchParams.get('config') === 'true';
    if (configMode) {
      setShowConfig(true);
    }

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
  }, [user, navigate, searchParams, signIn]);
  
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
              <Button 
                variant="ghost" 
                className="text-zinc-400 hover:text-white"
                onClick={() => setShowConfig(false)}
              >
                Already have credentials configured? Sign in
              </Button>
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
                
                {/* Developer quick access - only visible in development mode */}
                {isDev && (
                  <div className="mt-6 pt-4 border-t border-zinc-700">
                    <p className="text-amber-400 text-xs mb-2">Development Mode Only</p>
                    <Button 
                      variant="outline" 
                      className="w-full border-amber-600 text-amber-400 hover:bg-amber-950/30"
                      onClick={handleDevLogin}
                      disabled={devLoading}
                    >
                      {devLoading ? (
                        <>
                          <div className="h-4 w-4 border-t-2 border-r-2 border-amber-400 rounded-full animate-spin mr-2" />
                          Setting Up Dev Access...
                        </>
                      ) : "Developer Quick Access"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
