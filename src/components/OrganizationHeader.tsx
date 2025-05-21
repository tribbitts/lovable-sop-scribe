
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSopContext } from "@/context/SopContext";
import { Button } from "@/components/ui/button";
import { X, Upload, Building, Image } from "lucide-react";

const OrganizationHeader = () => {
  const { sopDocument, setCompanyName, setLogo, setBackgroundImage } = useSopContext();
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
    const file = e.target.files?.[0];
    
    if (file) {
      // Check if image is the right size (A4 dimensions at 72dpi: 595x842px)
      const img = document.createElement('img');
      img.onload = () => {
        // Allow some flexibility in dimensions
        const isAcceptableSize = 
          (img.width >= 590 && img.width <= 600) && 
          (img.height >= 837 && img.height <= 847);
        
        if (isAcceptableSize) {
          setBackgroundImage(reader.result as string);
        } else {
          alert("Background image should be approximately 595x842px (A4 size at 72dpi)");
        }
      };
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
  };
  
  const handleRemoveBackground = () => {
    setBackgroundImage(null);
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
            
            {/* Background upload */}
            <div className="flex flex-col">
              <Label className="text-zinc-300 flex items-center gap-2 mb-2">
                <Image className="h-4 w-4" /> PDF Background
              </Label>
              {sopDocument.backgroundImage ? (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700">
                    <img src={sopDocument.backgroundImage} alt="Background" className="max-w-full max-h-full object-contain" />
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
                <label htmlFor="background-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 bg-zinc-800 border border-dashed border-zinc-700 hover:border-zinc-600 rounded-lg transition-all">
                    <Image className="h-5 w-5 text-zinc-400" />
                  </div>
                  <Input
                    id="background-upload"
                    type="file"
                    onChange={handleBackgroundChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <span className="text-xs text-zinc-500 mt-1 block">A4 (595×842)</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationHeader;
