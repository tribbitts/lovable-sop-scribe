
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeSupabaseCredentials } from "@/lib/supabase";

const configSchema = z.object({
  projectUrl: z.string().url({ message: "Please enter a valid Supabase project URL" }),
  anonKey: z.string().min(1, { message: "Anon key is required" }),
});

type ConfigFormValues = z.infer<typeof configSchema>;

const SupabaseConfig = () => {
  const [saving, setSaving] = useState(false);
  
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      projectUrl: localStorage.getItem('supabase_url') || "",
      anonKey: localStorage.getItem('supabase_anon_key') || "",
    },
  });

  const onSubmit = async (data: ConfigFormValues) => {
    setSaving(true);
    
    try {
      storeSupabaseCredentials(data.projectUrl, data.anonKey);
      // Page will reload automatically after storing credentials
    } catch (error) {
      console.error("Error saving Supabase configuration:", error);
      setSaving(false);
    }
  };

  return (
    <Card className="bg-[#1E1E1E] border-zinc-800">
      <CardHeader>
        <CardTitle className="text-center text-white">Supabase Configuration</CardTitle>
        <CardDescription className="text-center text-zinc-400">
          Enter your Supabase project URL and anonymous key
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Project URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://your-project.supabase.co" 
                      {...field} 
                      className="bg-zinc-900 text-white border-zinc-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="anonKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Anonymous Key</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="eyJhbG..." 
                      {...field} 
                      className="bg-zinc-900 text-white border-zinc-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-[#007AFF] hover:bg-[#0066CC]" 
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SupabaseConfig;
