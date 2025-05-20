
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSopContext } from "@/context/SopContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const Header = () => {
  const { sopDocument, setSopTitle, setSopTopic, setSopDate, setLogo } = useSopContext();
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
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center">
            {logoPreview ? (
              <div className="relative w-32 h-32 mb-2">
                <img 
                  src={logoPreview} 
                  alt="Company Logo" 
                  className="w-32 h-32 object-contain border border-gray-200 rounded-md"
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
              <div className="w-32 h-32 border border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50 mb-2">
                <span className="text-sm text-gray-500">LOGO</span>
              </div>
            )}
            
            <Label htmlFor="logo-upload" className="cursor-pointer text-sm text-primary">
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

          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="sop-title" className="mb-1 block">SOP Title*</Label>
              <Input 
                id="sop-title" 
                value={sopDocument.title} 
                onChange={(e) => setSopTitle(e.target.value)}
                placeholder="Enter SOP Title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="sop-topic" className="mb-1 block">Topic*</Label>
              <Input 
                id="sop-topic" 
                value={sopDocument.topic} 
                onChange={(e) => setSopTopic(e.target.value)}
                placeholder="Enter Topic"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sop-date" className="mb-1 block">Date</Label>
            <Input 
              id="sop-date" 
              type="date" 
              value={sopDocument.date} 
              onChange={(e) => setSopDate(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Header;
