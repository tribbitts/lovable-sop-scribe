import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Code, BookOpen, Users, Zap } from "lucide-react";
import { ExportFormat } from "@/types/sop";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";

// Extended format type to include enhanced training
export type ExtendedExportFormat = ExportFormat | "enhanced-html";

interface ExportFormatSelectorProps {
  format: ExtendedExportFormat;
  onFormatChange: (format: ExtendedExportFormat) => void;
  disabled?: boolean;
}

const ExportFormatSelector = ({
  format,
  onFormatChange,
  disabled = false
}: ExportFormatSelectorProps) => {
  const { tier, isAdmin, canUseHtmlExport } = useSubscription();
  const { user } = useAuth();
  
  // Debug logging for Timothy
  console.log('🔍 Export Format Selector Debug:', {
    userEmail: user?.email,
    tier,
    isAdmin,
    canUseHtmlExport
  });
  
    // Define canUseEnhancedHtml - allow for admins, HTML export users, and specific test users  const canUseEnhancedHtml = isAdmin || canUseHtmlExport ||     user?.email?.toLowerCase().includes('timothyholsborg') ||    user?.email?.toLowerCase().includes('primarypartnercare') ||    user?.email === 'tribbit@tribbit.gg' ||    user?.email === 'Onoki82@gmail.com';

  const formats = [
    {
      value: "pdf" as ExtendedExportFormat,
      icon: FileText,
      title: "PDF Document",
      description: "Professional, print-ready format",
      features: ["Print optimized", "Consistent layout", "Professional appearance"],
      badge: "Standard"
    },
    {
      value: "html" as ExtendedExportFormat,
      icon: Code,
      title: "HTML Package",
      description: "Interactive web-ready format",
      features: ["Interactive elements", "Responsive design", "Web sharing"],
      badge: "Interactive"
    },
    {
      value: "enhanced-html" as ExtendedExportFormat,
      icon: BookOpen,
      title: "Training Module",
      description: "Self-contained learning experience with LMS features",
      features: ["Password protection", "Progress tracking", "User notes", "Bookmarks", "Search"],
      badge: "Enhanced",
      isNew: true,
      requiresPermission: !canUseEnhancedHtml
    }
  ];

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-zinc-300">Export Format</Label>
      <RadioGroup value={format} onValueChange={onFormatChange}>
        <div className="space-y-3">
          {formats.map((formatOption) => {
            const Icon = formatOption.icon;
            // Show all formats for now, but add visual indicator if permission required
            return (
              <div key={formatOption.value} className="relative">
                <div className={`p-4 border rounded-lg transition-all cursor-pointer ${
                  format === formatOption.value
                    ? 'border-[#007AFF] bg-[#007AFF]/10'
                    : 'border-zinc-700 hover:border-zinc-600'
                } ${formatOption.requiresPermission ? 'opacity-75' : ''}`}>
                  <RadioGroupItem 
                    value={formatOption.value} 
                    id={formatOption.value}
                    className="sr-only"
                    disabled={disabled}
                  />
                  <label 
                    htmlFor={formatOption.value} 
                    className="cursor-pointer block"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        format === formatOption.value
                          ? 'bg-[#007AFF] text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white text-sm">
                            {formatOption.title}
                          </h4>
                          <Badge className={`text-xs ${
                            formatOption.isNew
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-zinc-700 text-zinc-300 border-zinc-700'
                          }`}>
                            {formatOption.badge}
                          </Badge>
                          {formatOption.isNew && (
                            <Badge className="text-xs bg-amber-600 text-white border-amber-600">
                              NEW
                            </Badge>
                          )}
                          {formatOption.requiresPermission && (
                            <Badge className="text-xs bg-orange-600 text-white border-orange-600">
                              TEST MODE
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-zinc-400 text-sm mb-3">
                          {formatOption.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          {formatOption.features.map((feature, index) => (
                            <span 
                              key={index}
                              className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
                
                {formatOption.isNew && (
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      NEW
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </RadioGroup>
      
      {format === "enhanced-html" && (
        <div className="p-3 bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-medium mb-1">
                Perfect for Training & Onboarding
              </p>
              <p className="text-xs text-blue-200/80">
                Creates a complete learning experience that works anywhere - no server required!
              </p>
              {canUseEnhancedHtml && user?.email?.toLowerCase().includes('timothyholsborg') && (
                <p className="text-xs text-green-300 mt-2">
                  ✅ Test access enabled for development
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportFormatSelector;
