
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette, Building2, Save, Eye } from "lucide-react";

interface HealthcareThemeConfig {
  id: string;
  organizationName: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isDefault: boolean;
}

const AdminThemeConfig: React.FC = () => {
  const [themeConfig, setThemeConfig] = useState<HealthcareThemeConfig>({
    id: "healthcare-default",
    organizationName: "",
    logo: null,
    primaryColor: "#007AFF",
    secondaryColor: "#1E1E1E", 
    accentColor: "#28A745",
    isDefault: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Save to backend when Supabase is integrated
    console.log("Saving healthcare theme config:", themeConfig);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setThemeConfig(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-[#1E1E1E] border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            Healthcare Organization Theme Settings
            <Badge className="bg-green-600 text-white">Healthcare Focused</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName" className="text-zinc-300">Organization Name</Label>
                <Input
                  id="orgName"
                  value={themeConfig.organizationName}
                  onChange={(e) => setThemeConfig(prev => ({ ...prev, organizationName: e.target.value }))}
                  placeholder="e.g., City General Hospital"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="logo" className="text-zinc-300">Organization Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                {themeConfig.logo && (
                  <div className="mt-2 p-2 bg-zinc-800 rounded border border-zinc-700">
                    <img src={themeConfig.logo} alt="Logo preview" className="h-12 object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* Color Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Healthcare Brand Colors
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-zinc-300">Primary Color (SOPify Blue)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={themeConfig.primaryColor}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10 rounded border-zinc-700"
                    />
                    <Input
                      value={themeConfig.primaryColor}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-zinc-300">Secondary Color (Dark)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={themeConfig.secondaryColor}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-16 h-10 rounded border-zinc-700"
                    />
                    <Input
                      value={themeConfig.secondaryColor}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-zinc-300">Accent Color (Healthcare Green)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={themeConfig.accentColor}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-16 h-10 rounded border-zinc-700"
                    />
                    <Input
                      value={themeConfig.accentColor}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-700">
            <h4 className="text-white font-medium mb-3">Preview: Healthcare SOP Header</h4>
            <div className="p-4 bg-white rounded-lg" style={{ borderTop: `4px solid ${themeConfig.primaryColor}` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {themeConfig.logo && (
                    <img src={themeConfig.logo} alt="Logo" className="h-8 object-contain" />
                  )}
                  <div>
                    <h5 className="font-semibold" style={{ color: themeConfig.secondaryColor }}>
                      {themeConfig.organizationName || "Your Organization"}
                    </h5>
                    <p className="text-sm text-gray-600">Standard Operating Procedure</p>
                  </div>
                </div>
                <div 
                  className="px-3 py-1 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: themeConfig.accentColor }}
                >
                  Healthcare Certified
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-zinc-400">
              This theme will be applied to all PDFs and Interactive Training Modules
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Theme"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminThemeConfig;
