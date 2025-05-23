import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSopContext } from "@/context/SopContext";
import { Button } from "@/components/ui/button";
import { X, Upload, Building, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/context/SubscriptionContext";
import BackgroundSelector from "./BackgroundSelector";

const OrganizationHeader = () => {
  const { sopDocument, setCompanyName, setLogo, setBackgroundImage: setContextBackgroundImage } = useSopContext();
  const { isPro } = useSubscription();
  const [companyNameInput, setCompanyNameInput] = useState(sopDocument.companyName);
  
  useEffect(() => {
    setCompanyNameInput(sopDocument.companyName);
  }, [sopDocument.companyName]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Custom backgrounds are only available with a Pro subscription.",
        variant: "destructive"
      });
      return;
    }
    
    const file = e.target.files?.[0];
    
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Background image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setContextBackgroundImage(event.target.result as string);
          toast({
            title: "Background Added",
            description: "Custom background image has been added to your SOP."
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPredefinedBackground = async (pathOrNull: string | null) => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Backgrounds are only available with a Pro subscription.",
        variant: "destructive"
      });
      return;
    }

    if (pathOrNull === null) {
      setContextBackgroundImage(null);
      toast({
        title: "Background Cleared",
        description: "Background image has been removed."
      });
      return;
    }

    // Assuming pathOrNull is a path like "/backgrounds/image.jpg"
    try {
      const response = await fetch(pathOrNull);
      if (!response.ok) {
        throw new Error(`Failed to fetch background: ${response.statusText}`);
      }
      const blob = await response.blob();
      
      // Check file size again (though less critical for predefined, good practice)
      if (blob.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Background image must be less than 5MB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setContextBackgroundImage(reader.result as string);
        toast({
          title: "Background Set",
          description: "Predefined background has been applied."
        });
      };
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Could not read predefined background file.",
          variant: "destructive"
        });
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error fetching predefined background:", error);
      toast({
        title: "Error Fetching Background",
        description: (error as Error).message || "Could not load the selected background.",
        variant: "destructive"
      });
      setContextBackgroundImage(null); // Clear if error
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
  };
  
  const handleRemoveBackground = () => {
    setContextBackgroundImage(null);
  };

  return (
    <Card className="mb-6 bg-[#1E1E1E] border-zinc-800 overflow-hidden rounded-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
          <div className="w-full sm:w-1/2">
            <Label htmlFor="company-name" className="text-zinc-300 flex items-center gap-2 mb-2">
              <Building className="h-4 w-4" /> 
              Organization Name <span className="text-zinc-500 text-xs">(appears in PDF footer)</span>
            </Label>
            <div className="relative group">
              <Input
                id="company-name"
                value={companyNameInput}
                onChange={(e) => setCompanyNameInput(e.target.value)}
                onBlur={() => setCompanyName(companyNameInput)}
                className="bg-zinc-800 border-zinc-700 focus:border-[#007AFF] transition-all text-white placeholder:text-zinc-500"
                placeholder="Enter your organization name"
              />
              <div className="absolute inset-0 rounded-md pointer-events-none transition-opacity group-focus-within:opacity-100 opacity-0 bg-[#007AFF]/10"></div>
            </div>
          </div>
          
          <div className="flex flex-row w-full sm:w-1/2 gap-4 sm:justify-end">
            {/* Logo upload */}
            <div className="flex flex-col">
              <Label className="text-zinc-300 flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4" /> PDF Logo
              </Label>
              {sopDocument.logo ? (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700">
                    <img src={sopDocument.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveLogo}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 bg-zinc-800 border border-dashed border-zinc-700 hover:border-zinc-600 rounded-lg transition-all">
                    <Upload className="h-5 w-5 text-zinc-400" />
                  </div>
                  <Input
                    id="logo-upload"
                    type="file"
                    onChange={handleLogoChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              )}
            </div>
            
            {/* Background selector */}
            <div className="flex flex-col">
              <Label className="text-zinc-300 flex items-center gap-2 mb-2">
                <Image className="h-4 w-4" /> PDF Background
              </Label>
              
              {sopDocument.backgroundImage ? (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700">
                    <img src={sopDocument.backgroundImage} alt="Background" className="max-w-full max-h-full object-cover" />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveBackground}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <BackgroundSelector
                  onSelectBackground={handleSelectPredefinedBackground}
                  onCustomUpload={handleBackgroundChange}
                  currentBackground={sopDocument.backgroundImage}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationHeader;
