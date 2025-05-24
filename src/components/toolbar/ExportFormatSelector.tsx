import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Download, 
  Globe, 
  Archive, 
  GraduationCap,
  Settings,
  Image,
  PaletteIcon,
  Zap,
  CheckCircle2,
  Clock,
  User
} from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";

export interface ExportOptions {
  format: 'pdf' | 'html' | 'training-module' | 'web-bundle';
  quality: 'draft' | 'standard' | 'high' | 'print';
  theme: 'light' | 'dark' | 'auto' | 'brand';
  includeImages: boolean;
  includeCallouts: boolean;
  includeTags: boolean;
  includeResources: boolean;
  includeProgress: boolean;
  enableInteractive: boolean;
  compressionLevel: number;
  pageSize: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation: 'portrait' | 'landscape';
  // Training Module specific options
  trainingMode: boolean;
  quizEnabled: boolean;
  trackingEnabled: boolean;
  certificateEnabled: boolean;
  adminAccess: boolean;
}

interface ExportFormatSelectorProps {
  onExport: (options: ExportOptions) => void;
  isExporting?: boolean;
  sopTitle?: string;
  stepCount?: number;
  // Legacy props for backward compatibility
  format?: string;
  onFormatChange?: (format: string) => void;
  disabled?: boolean;
}

const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({
  onExport,
  isExporting = false,
  sopTitle = "Current SOP",
  stepCount = 1,
  // Legacy support
  format: legacyFormat,
  onFormatChange: legacyOnFormatChange,
  disabled = false
}) => {
  const { tier, isAdmin, canUseHtmlExport } = useSubscription();
  const { user } = useAuth();
  
  // Determine user role - enhanced logic for admin detection
  const userRole: 'admin' | 'user' | 'editor' = 
    isAdmin || 
    user?.email?.toLowerCase().includes('timothyholsborg') ||
    user?.email?.toLowerCase().includes('primarypartnercare') ||
    user?.email === 'tribbit@tribbit.gg' ||
    user?.email === 'Onoki82@gmail.com'
      ? 'admin' 
      : canUseHtmlExport 
        ? 'editor' 
        : 'user';
  
  const [selectedFormat, setSelectedFormat] = useState<ExportOptions['format']>('pdf');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    quality: 'standard',
    theme: 'light',
    includeImages: true,
    includeCallouts: true,
    includeTags: true,
    includeResources: true,
    includeProgress: true,
    enableInteractive: false,
    compressionLevel: 50,
    pageSize: 'A4',
    orientation: 'portrait',
    trainingMode: false,
    quizEnabled: false,
    trackingEnabled: false,
    certificateEnabled: false,
    adminAccess: userRole === 'admin'
  });

  // Debug logging
  console.log('🔍 Enhanced Export Format Selector Debug:', {
    userEmail: user?.email,
    tier,
    isAdmin,
    canUseHtmlExport,
    determinedRole: userRole,
    adminAccess: options.adminAccess
  });

  const formatOptions = [
    {
      id: 'pdf',
      title: 'PDF Document',
      description: 'Static document format for printing and sharing',
      icon: FileText,
      badge: 'Popular',
      color: 'text-red-500',
      features: ['Print ready', 'Universal compatibility', 'File archival'],
      requiresAdmin: false
    },
    {
      id: 'html',
      title: 'Interactive HTML',
      description: 'Web-ready format with interactive elements',
      icon: Globe,
      badge: 'Interactive',
      color: 'text-blue-500',
      features: ['Web deployment', 'Interactive callouts', 'Responsive design'],
      requiresAdmin: false
    },
    {
      id: 'training-module',
      title: 'Training Module',
      description: 'Complete learning experience with progress tracking',
      icon: GraduationCap,
      badge: userRole === 'admin' ? 'Admin Access' : 'Available',
      color: 'text-purple-500',
      features: ['Progress tracking', 'Quiz integration', 'Certificates', 'Analytics'],
      requiresAdmin: false, // Always show, but with proper indicators
      isNew: true
    },
    {
      id: 'web-bundle',
      title: 'Web Bundle',
      description: 'Complete website package for hosting',
      icon: Archive,
      badge: 'Complete',
      color: 'text-green-500',
      features: ['Self-contained', 'Offline capable', 'Custom branding'],
      requiresAdmin: false
    }
  ];

  const qualityOptions = [
    { value: 'draft', label: 'Draft (Fast)', description: 'Quick preview quality' },
    { value: 'standard', label: 'Standard', description: 'Balanced quality and size' },
    { value: 'high', label: 'High Quality', description: 'Best for presentation' },
    { value: 'print', label: 'Print Ready', description: 'Maximum quality for printing' }
  ];

  const themeOptions = [
    { value: 'light', label: 'Light Theme', icon: '☀️' },
    { value: 'dark', label: 'Dark Theme', icon: '🌙' },
    { value: 'auto', label: 'Auto (System)', icon: '⚡' },
    { value: 'brand', label: 'Brand Colors', icon: '🎨' }
  ];

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleFormatSelect = (format: ExportOptions['format']) => {
    setSelectedFormat(format);
    updateOption('format', format);
    
    // Legacy support
    if (legacyOnFormatChange) {
      legacyOnFormatChange(format === 'training-module' ? 'enhanced-html' : format);
    }
    
    // Auto-configure options based on format
    if (format === 'training-module') {
      updateOption('enableInteractive', true);
      updateOption('trainingMode', true);
      updateOption('trackingEnabled', true);
    } else if (format === 'html') {
      updateOption('enableInteractive', true);
      updateOption('trainingMode', false);
    } else if (format === 'pdf') {
      updateOption('enableInteractive', false);
      updateOption('trainingMode', false);
    }
  };

  const getEstimatedSize = () => {
    const baseSize = stepCount * 0.5; // MB per step
    const qualityMultiplier = {
      draft: 0.3,
      standard: 1,
      high: 2.5,
      print: 4
    }[options.quality];
    
    const includeMultiplier = 
      (options.includeImages ? 1.5 : 0.8) *
      (options.includeCallouts ? 1.2 : 1) *
      (options.enableInteractive ? 1.8 : 1);
    
    return Math.max(0.1, baseSize * qualityMultiplier * includeMultiplier).toFixed(1);
  };

  const handleExport = () => {
    onExport(options);
  };

  // If in legacy mode (old props), show simplified interface
  if (legacyFormat && legacyOnFormatChange) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-white">Choose Export Format</h3>
          {userRole === 'admin' && (
            <Badge className="bg-purple-600 text-white">
              <GraduationCap className="h-3 w-3 mr-1" />
              Admin Access - All features available
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {formatOptions.map((format) => {
            const Icon = format.icon;
            const isSelected = selectedFormat === format.id;
            
            return (
              <motion.div
                key={format.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-[#007AFF] bg-[#007AFF]/10 shadow-lg shadow-[#007AFF]/20' 
                      : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
                  }`}
                  onClick={() => handleFormatSelect(format.id as ExportOptions['format'])}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${format.color}`} />
                        <div>
                          <CardTitle className="text-sm text-white">{format.title}</CardTitle>
                          <CardDescription className="text-xs text-zinc-400">
                            {format.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={isSelected ? "default" : "secondary"}
                        className={`text-xs ${
                          isSelected 
                            ? "bg-[#007AFF] text-white" 
                            : format.id === 'training-module' 
                              ? "bg-purple-600 text-white"
                              : ""
                        }`}
                      >
                        {format.badge}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      {format.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-zinc-600 text-zinc-300">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 flex items-center gap-2 text-xs text-[#007AFF]"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Selected
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          variant="outline"
          className="w-full border-zinc-600 text-zinc-300"
        >
          <Settings className="h-4 w-4 mr-2" />
          {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
        </Button>

        {showAdvancedOptions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="border-zinc-700 bg-zinc-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white">Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-300">Quality</Label>
                    <Select value={options.quality} onValueChange={(value) => updateOption('quality', value as ExportOptions['quality'])}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-600 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityOptions.map((quality) => (
                          <SelectItem key={quality.value} value={quality.value}>
                            {quality.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-300">Theme</Label>
                    <Select value={options.theme} onValueChange={(value) => updateOption('theme', value as ExportOptions['theme'])}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-600 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {themeOptions.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value}>
                            {theme.icon} {theme.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs text-zinc-300">Include Content</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'includeImages' as const, label: 'Images' },
                      { key: 'includeCallouts' as const, label: 'Callouts' },
                      { key: 'includeTags' as const, label: 'Tags' },
                      { key: 'includeResources' as const, label: 'Resources' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-xs text-zinc-200">{label}</Label>
                        <Switch
                          checked={options[key]}
                          onCheckedChange={(checked) => updateOption(key, checked)}
                          className="scale-75"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {selectedFormat === 'training-module' && (
                  <>
                    <Separator className="border-zinc-700" />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                        <Label className="text-xs text-white">Training Features</Label>
                        {userRole === 'admin' && (
                          <Badge className="bg-purple-600 text-white text-xs">Admin</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { key: 'quizEnabled' as const, label: 'Interactive Quizzes' },
                          { key: 'trackingEnabled' as const, label: 'Progress Tracking' },
                          { key: 'certificateEnabled' as const, label: 'Certificates' },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center justify-between">
                            <Label className="text-xs text-zinc-200">{label}</Label>
                            <Switch
                              checked={options[key]}
                              onCheckedChange={(checked) => updateOption(key, checked)}
                              className="scale-75"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    );
  }

  // Full interface when used with new props
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Export SOP</h2>
        <p className="text-zinc-400">
          Choose your export format for "{sopTitle}" ({stepCount} steps)
        </p>
        {userRole === 'admin' && (
          <Badge className="bg-purple-600 text-white">
            <GraduationCap className="h-3 w-3 mr-1" />
            Admin Access - All features available
          </Badge>
        )}
      </div>

      {/* Format Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formatOptions.map((format) => {
          const Icon = format.icon;
          const isSelected = selectedFormat === format.id;
          
          return (
            <motion.div
              key={format.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-[#007AFF] bg-[#007AFF]/10 shadow-lg shadow-[#007AFF]/20' 
                    : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
                }`}
                onClick={() => handleFormatSelect(format.id as ExportOptions['format'])}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 ${format.color}`} />
                      <div>
                        <CardTitle className="text-lg text-white">{format.title}</CardTitle>
                        <CardDescription className="text-zinc-400 text-sm">
                          {format.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant={isSelected ? "default" : "secondary"}
                        className={`${
                          isSelected 
                            ? "bg-[#007AFF] text-white" 
                            : format.id === 'training-module' 
                              ? "bg-purple-600 text-white"
                              : ""
                        }`}
                      >
                        {format.badge}
                      </Badge>
                      {format.isNew && (
                        <Badge className="bg-green-600 text-white text-xs">NEW</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1">
                    {format.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-zinc-600 text-zinc-300">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 flex items-center gap-2 text-sm text-[#007AFF]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Selected
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Export Summary & Button */}
      {selectedFormat && (
        <Card className="border-zinc-700 bg-zinc-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-white font-medium">Ready to Export</h3>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>~{getEstimatedSize()} MB</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{stepCount} steps</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleExport}
                disabled={isExporting || disabled}
                className="bg-[#007AFF] hover:bg-[#0069D9] text-white px-8"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {formatOptions.find(f => f.id === selectedFormat)?.title}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExportFormatSelector; 