
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already authenticated, redirect to app
    if (user) {
      navigate("/app");
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
        
        <Card className="bg-[#1E1E1E] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-center text-white">Account Access</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
