
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
  
  // Valid development email that will pass validation
  const devEmail = "developer@example.com";
  const devPassword = "password123";
  
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
        
        // Check if dev account exists using signIn attempt
        const { data: signInCheck, error: signInError } = await supabase.auth.signInWithPassword({
          email: devEmail,
          password: devPassword,
        });
        
        // If sign-in fails with invalid credentials, we need to create the account
        if (signInError && signInError.message.includes('Invalid login credentials')) {
          // Try to create the development account
          const { error: signUpError } = await supabase.auth.signUp({
            email: devEmail,
            password: devPassword,
            options: {
              data: { role: 'developer' }
            }
          });
          
          if (signUpError) {
            console.log('Failed to create dev account:', signUpError);
            toast({
              title: "Development Account Error",
              description: "Could not create development account: " + signUpError.message,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Dev Account Created",
              description: "Created development account automatically",
            });
            
            // After creating account, attempt to sign in
            await signIn(devEmail, devPassword);
            navigate('/app');
          }
        } else if (signInCheck?.user) {
          // User already exists and sign-in succeeded
          navigate('/app');
        }
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
