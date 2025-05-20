
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSopContext } from "@/context/SopContext";

const OrganizationHeader = () => {
  const { sopDocument, setCompanyName } = useSopContext();
  const [companyNameInput, setCompanyNameInput] = useState(sopDocument.companyName);
  
  useEffect(() => {
    setCompanyNameInput(sopDocument.companyName);
  }, [sopDocument.companyName]);

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
            <Label htmlFor="logo" className="text-zinc-300">Logo (Optional)</Label>
            {sopDocument.logo ? (
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                  <img src={sopDocument.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <Input
                  id="logo"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          const { setLogo } = useSopContext();
                          setLogo(event.target.result as string);
                        }
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                  className="bg-zinc-800 border-zinc-700 text-white flex-1"
                  accept="image/*"
                />
              </div>
            ) : (
              <Input
                id="logo"
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        const { setLogo } = useSopContext();
                        setLogo(event.target.result as string);
                      }
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
                className="bg-zinc-800 border-zinc-700 hover:border-zinc-600 focus:border-[#007AFF] transition-all text-white"
                accept="image/*"
              />
            )}
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
