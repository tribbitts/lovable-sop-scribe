
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSopContext } from "@/context/SopContext";
import { Button } from "@/components/ui/button";
import { X, Upload, Building } from "lucide-react";

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
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
          <div className="w-full sm:w-3/4">
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
          
          <div className="w-full sm:w-1/4 flex flex-col sm:items-end">
            <Label className="text-zinc-300 flex items-center gap-2 mb-2 sm:justify-end">
              <Upload className="h-4 w-4" /> Logo
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
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationHeader;
