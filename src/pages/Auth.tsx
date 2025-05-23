
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import SupabaseConfig from "@/components/auth/SupabaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storeSupabaseCredentials } from "@/lib/supabase";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfig, setShowConfig] = useState(false);
  
  // Check if Supabase credentials are missing
  const isMissingCredentials = () => {
    const url = localStorage.getItem('supabase_url');
    const key = localStorage.getItem('supabase_anon_key');
    return !url || !key || 
           url === 'https://placeholder-url.supabase.co' || 
           key === 'placeholder-key';
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
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
