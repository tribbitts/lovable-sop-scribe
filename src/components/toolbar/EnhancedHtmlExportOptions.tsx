import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Bookmark, 
  Search, 
  FileText, 
  Clock, 
  Palette,
  Shield,
  BookOpen,
  Eye,
  Info
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface EnhancedHtmlExportSettings {
  passwordProtection: {
    enabled: boolean;
    password: string;
    hint: string;
  };
  lmsFeatures: {
    enableNotes: boolean;
    enableBookmarks: boolean;
    enableSearch: boolean;
    enableProgressTracking: boolean;
  };
  theme: 'auto' | 'light' | 'dark';
  branding: {
    companyColors: {
      primary: string;
      secondary: string;
    };
  };
}

interface EnhancedHtmlExportOptionsProps {
  settings: EnhancedHtmlExportSettings;
  onSettingsChange: (settings: EnhancedHtmlExportSettings) => void;
  disabled?: boolean;
}

const EnhancedHtmlExportOptions: React.FC<EnhancedHtmlExportOptionsProps> = ({
  settings,
  onSettingsChange,
  disabled = false
}) => {
  const updateSettings = (updates: Partial<EnhancedHtmlExportSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const updatePasswordProtection = (updates: Partial<typeof settings.passwordProtection>) => {
    updateSettings({
      passwordProtection: { ...settings.passwordProtection, ...updates }
    });
  };

  const updateLmsFeatures = (updates: Partial<typeof settings.lmsFeatures>) => {
    updateSettings({
      lmsFeatures: { ...settings.lmsFeatures, ...updates }
    });
  };

  const updateBranding = (updates: Partial<typeof settings.branding>) => {
    updateSettings({
      branding: { ...settings.branding, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-[#007AFF]" />
        <div>
          <h3 className="text-lg font-semibold text-white">Enhanced Training Module</h3>
          <p className="text-sm text-zinc-400">Create interactive, self-contained training experiences</p>
        </div>
      </div>

      {/* Password Protection */}
      <Card className="bg-[#1E1E1E] border-zinc-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" />
            Password Protection
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-zinc-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">
                    Add client-side password protection to restrict access to your training module
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="password-enabled" className="text-sm text-zinc-300">
              Enable password protection
            </Label>
            <Switch
              id="password-enabled"
              checked={settings.passwordProtection.enabled}
              onCheckedChange={(enabled) => updatePasswordProtection({ enabled })}
              disabled={disabled}
            />
          </div>
          
          {settings.passwordProtection.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-zinc-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={settings.passwordProtection.password}
                  onChange={(e) => updatePasswordProtection({ password: e.target.value })}
                  placeholder="Enter training password"
                  className="bg-zinc-800 border-zinc-600 text-white"
                  disabled={disabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-hint" className="text-sm text-zinc-300">
                  Password Hint (Optional)
                </Label>
                <Input
                  id="password-hint"
                  value={settings.passwordProtection.hint}
                  onChange={(e) => updatePasswordProtection({ hint: e.target.value })}
                  placeholder="e.g., Company founding year"
                  className="bg-zinc-800 border-zinc-600 text-white"
                  disabled={disabled}
                />
              </div>
              
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-300 flex items-start gap-2">
                  <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  Client-side protection is suitable for internal training materials. 
                  For sensitive content, consider server-side authentication.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* LMS Features */}
      <Card className="bg-[#1E1E1E] border-zinc-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Learning Management Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-400" />
                <Label htmlFor="progress-tracking" className="text-sm text-zinc-300">
                  Progress Tracking
                </Label>
              </div>
              <Switch
                id="progress-tracking"
                checked={settings.lmsFeatures.enableProgressTracking}
                onCheckedChange={(enabled) => updateLmsFeatures({ enableProgressTracking: enabled })}
                disabled={disabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-400" />
                <Label htmlFor="notes" className="text-sm text-zinc-300">
                  User Notes
                </Label>
              </div>
              <Switch
                id="notes"
                checked={settings.lmsFeatures.enableNotes}
                onCheckedChange={(enabled) => updateLmsFeatures({ enableNotes: enabled })}
                disabled={disabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-zinc-400" />
                <Label htmlFor="bookmarks" className="text-sm text-zinc-300">
                  Bookmarks
                </Label>
              </div>
              <Switch
                id="bookmarks"
                checked={settings.lmsFeatures.enableBookmarks}
                onCheckedChange={(enabled) => updateLmsFeatures({ enableBookmarks: enabled })}
                disabled={disabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-zinc-400" />
                <Label htmlFor="search" className="text-sm text-zinc-300">
                  Content Search
                </Label>
              </div>
              <Switch
                id="search"
                checked={settings.lmsFeatures.enableSearch}
                onCheckedChange={(enabled) => updateLmsFeatures({ enableSearch: enabled })}
                disabled={disabled}
              />
            </div>
          </div>
          
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-300">
              All progress, notes, and bookmarks are saved locally in the user's browser
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme & Branding */}
      <Card className="bg-[#1E1E1E] border-zinc-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Theme & Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-zinc-300">Default Theme</Label>
            <div className="flex gap-2">
              {[
                { value: 'auto', label: 'Auto', description: 'Follows system preference' },
                { value: 'light', label: 'Light', description: 'Always light mode' },
                { value: 'dark', label: 'Dark', description: 'Always dark mode' }
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSettings({ theme: theme.value as any })}
                  className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                    settings.theme === theme.value
                      ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                      : 'border-zinc-600 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500'
                  }`}
                  disabled={disabled}
                >
                  <div className="font-medium text-sm">{theme.label}</div>
                  <div className="text-xs opacity-70">{theme.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          <Separator className="bg-zinc-700" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color" className="text-sm text-zinc-300">
                Primary Color
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="primary-color"
                  type="color"
                  value={settings.branding.companyColors.primary}
                  onChange={(e) => updateBranding({ 
                    companyColors: { 
                      ...settings.branding.companyColors, 
                      primary: e.target.value 
                    }
                  })}
                  className="w-12 h-8 p-1 bg-zinc-800 border-zinc-600"
                  disabled={disabled}
                />
                <Input
                  value={settings.branding.companyColors.primary}
                  onChange={(e) => updateBranding({ 
                    companyColors: { 
                      ...settings.branding.companyColors, 
                      primary: e.target.value 
                    }
                  })}
                  className="flex-1 bg-zinc-800 border-zinc-600 text-white text-sm"
                  disabled={disabled}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondary-color" className="text-sm text-zinc-300">
                Secondary Color
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="secondary-color"
                  type="color"
                  value={settings.branding.companyColors.secondary}
                  onChange={(e) => updateBranding({ 
                    companyColors: { 
                      ...settings.branding.companyColors, 
                      secondary: e.target.value 
                    }
                  })}
                  className="w-12 h-8 p-1 bg-zinc-800 border-zinc-600"
                  disabled={disabled}
                />
                <Input
                  value={settings.branding.companyColors.secondary}
                  onChange={(e) => updateBranding({ 
                    companyColors: { 
                      ...settings.branding.companyColors, 
                      secondary: e.target.value 
                    }
                  })}
                  className="flex-1 bg-zinc-800 border-zinc-600 text-white text-sm"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Features */}
      <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-300 mb-1">Enhanced Training Features</h4>
            <ul className="text-sm text-green-200/80 space-y-1">
              <li>• Self-contained HTML file with all assets embedded</li>
              <li>• Interactive navigation with step-by-step progress</li>
              <li>• Local data persistence (progress saved in browser)</li>
              <li>• Responsive design for desktop and mobile</li>
              <li>• Print-friendly layout for offline reference</li>
              <li>• No server required - works anywhere</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHtmlExportOptions; 