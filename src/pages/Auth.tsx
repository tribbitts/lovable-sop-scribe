
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import SupabaseConfig from "@/components/auth/SupabaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    // If user is already authenticated, redirect to app
    if (user) {
      navigate("/app");
    }
    
    // Show config by default if credentials are missing
    if (isMissingCredentials()) {
      setShowConfig(true);
    }
  }, [user, navigate]);
  
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
              </CardContent>
            </Card>
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                className="text-zinc-400 hover:text-white"
                onClick={() => setShowConfig(true)}
              >
                Need to configure Supabase?
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
