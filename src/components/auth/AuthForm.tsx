
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { testSupabaseConnection } from "@/lib/supabase";

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type AuthFormValues = z.infer<typeof authSchema>;

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState<string>("signin");
  const { signIn, signUp, loading, error: authError } = useAuth();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);
  const [isDev] = useState(() => import.meta.env.MODE === 'development');
  
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthFormValues) => {
    // First test the connection to Supabase
    const isConnected = await testSupabaseConnection();
    
    if (!isConnected) {
      setConnectionError("Unable to connect to the server. Please check your network connection and try again.");
      return;
    }
    
    setConnectionError(null);
    
    if (activeTab === "signin") {
      await signIn(data.email, data.password);
    } else {
      await signUp(data.email, data.password);
      setSignupSuccess(true);
      // Reset the form after successful signup
      form.reset();
      
      // In development mode, tell users they can use the account right away
      if (isDev) {
        setConnectionError("In development mode, new accounts can be used immediately. You can sign in now.");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="signin" value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setSignupSuccess(false);
        setConnectionError(null);
      }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        {(authError || connectionError) && (
          <Alert variant={connectionError && isDev ? "default" : "destructive"} className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{connectionError && isDev ? "Note" : "Error"}</AlertTitle>
            <AlertDescription>
              {connectionError || authError}
            </AlertDescription>
          </Alert>
        )}
        
        {signupSuccess && (
          <Alert className="mt-4 bg-green-950/60 border-green-700 text-green-300">
            <Info className="h-4 w-4" />
            <AlertTitle>Account Created</AlertTitle>
            <AlertDescription>
              {isDev 
                ? "Account created successfully. You can now sign in with your credentials." 
                : "Please check your email for a confirmation link to verify your account. Once verified, you can sign in."}
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  {activeTab === "signin" ? "Signing in..." : "Signing up..."}
                </>
              ) : (
                activeTab === "signin" ? "Sign In" : "Sign Up"
              )}
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default AuthForm;
