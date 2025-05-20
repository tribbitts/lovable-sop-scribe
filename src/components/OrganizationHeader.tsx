
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSopContext } from "@/context/SopContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const OrganizationHeader = () => {
  const { sopDocument, setCompanyName, setLogo } = useSopContext();
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

  const handleRemoveLogo = () => {
    setLogo(null);
  };

  return (
    <Card className="mb-6 bg-[#1E1E1E] border-zinc-800 overflow-hidden rounded-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start">
          <div className="w-full sm:w-1/2 space-y-2">
            <Label htmlFor="company-name" className="text-zinc-300">Organization Name</Label>
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
          
          <div className="w-full sm:w-1/2 space-y-2">
            <Label htmlFor="logo" className="text-zinc-300">Organization Logo</Label>
            <div className="relative flex items-center gap-4">
              {sopDocument.logo ? (
                <div className="flex items-center gap-4 w-full">
                  <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700">
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
                <Input
                  id="logo"
                  type="file"
                  onChange={handleLogoChange}
                  className="bg-zinc-800 border-zinc-700 hover:border-zinc-600 focus:border-[#007AFF] transition-all text-white"
                  accept="image/*"
                />
              )}
            </div>
            <p className="text-xs text-zinc-500">
              Recommended: square image, max 400x400px
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationHeader;
