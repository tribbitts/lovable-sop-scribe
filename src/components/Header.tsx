
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSopContext } from "@/context/SopContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const Header = () => {
  const { sopDocument, setSopTitle, setSopTopic, setSopDate, setSopVersion, setSopLastRevised, setLogo } = useSopContext();
  const [logoPreview, setLogoPreview] = useState<string | null>(sopDocument.logo);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogo(result);
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  return (
    <Card className="mb-6 bg-[#1E1E1E] border-zinc-800 rounded-2xl overflow-hidden">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col space-y-4 md:col-span-2 order-2 md:order-1">
            <div>
              <Label htmlFor="sop-title" className="mb-1 block text-zinc-300">SOP Title*</Label>
              <Input 
                id="sop-title" 
                value={sopDocument.title} 
                onChange={(e) => setSopTitle(e.target.value)}
                placeholder="Enter SOP Title"
                required
                className="bg-[#2C2C2E] border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl"
              />
            </div>
            
            <div>
              <Label htmlFor="sop-topic" className="mb-1 block text-zinc-300">Topic*</Label>
              <Input 
                id="sop-topic" 
                value={sopDocument.topic} 
                onChange={(e) => setSopTopic(e.target.value)}
                placeholder="Enter Topic"
                required
                className="bg-[#2C2C2E] border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sop-date" className="mb-1 block text-zinc-400 text-xs">Date</Label>
                <Input 
                  id="sop-date" 
                  type="date" 
                  value={sopDocument.date} 
                  onChange={(e) => setSopDate(e.target.value)}
                  className="bg-[#2C2C2E] border-zinc-700 text-white text-sm h-8 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="sop-version" className="mb-1 block text-zinc-400 text-xs">Version</Label>
                <Input 
                  id="sop-version" 
                  value={sopDocument.version || ""} 
                  onChange={(e) => setSopVersion(e.target.value)}
                  placeholder="e.g., 1.0"
                  className="bg-[#2C2C2E] border-zinc-700 text-white text-sm h-8 rounded-xl placeholder:text-zinc-500"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sop-last-revised" className="mb-1 block text-zinc-400 text-xs">Last Revised</Label>
              <Input 
                id="sop-last-revised" 
                type="date" 
                value={sopDocument.lastRevised || ""} 
                onChange={(e) => setSopLastRevised(e.target.value)}
                className="bg-[#2C2C2E] border-zinc-700 text-white text-sm h-8 rounded-xl"
              />
            </div>
          </div>

          <div className="flex flex-col md:items-end justify-start space-y-4 order-1 md:order-2">
            {logoPreview ? (
              <div className="relative w-40 h-40 mb-2">
                <img 
                  src={logoPreview} 
                  alt="Company Logo" 
                  className="w-40 h-40 object-contain border border-zinc-700 rounded-xl bg-[#2C2C2E]"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleRemoveLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="w-40 h-40 border border-dashed border-zinc-600 rounded-xl flex items-center justify-center bg-[#2C2C2E] mb-2">
                <span className="text-sm text-zinc-500">LOGO</span>
              </div>
            )}
            
            <Label htmlFor="logo-upload" className="cursor-pointer text-sm text-[#007AFF]">
              {logoPreview ? "Change Logo" : "Upload Logo"}
              <Input 
                id="logo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleLogoChange}
              />
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Header;
