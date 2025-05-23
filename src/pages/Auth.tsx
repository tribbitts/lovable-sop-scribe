
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import SupabaseConfig from "@/components/auth/SupabaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storeSupabaseCredentials } from "@/lib/supabase";
import AuthHeader from "@/components/auth/AuthHeader";
import { isMissingCredentials } from "@/lib/auth-utils";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfig, setShowConfig] = useState(false);
  
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
        <AuthHeader />
        
        {showConfig ? (
          <AuthConfigSection onBack={() => setShowConfig(false)} />
        ) : (
          <AuthFormSection />
        )}
      </div>
    </div>
  );
};

// Component for the configuration section
const AuthConfigSection: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <>
      <SupabaseConfig />
      <div className="mt-4 text-center">
        <button 
          className="text-zinc-400 hover:text-white bg-transparent border-none cursor-pointer"
          onClick={onBack}
        >
          Already have credentials configured? Sign in
        </button>
      </div>
    </>
  );
};

// Component for the auth form section
const AuthFormSection: React.FC = () => {
  return (
    <Card className="bg-[#1E1E1E] border-zinc-800">
      <CardHeader>
        <CardTitle className="text-center text-white">Account Access</CardTitle>
      </CardHeader>
      <CardContent>
        <AuthForm />
      </CardContent>
    </Card>
  );
};

export default Auth;
