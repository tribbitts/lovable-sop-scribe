import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal } from "@/components/ui/dialog";
import { 
  X, 
  Download, 
  FileText, 
  Globe, 
  GraduationCap, 
  Package,
  Loader2,
  Settings,
  Palette,
  Shield,
  BookOpen,
  Zap
} from "lucide-react";
import { SopDocument, ExportFormat, ExportOptions } from "@/types/sop";
import PdfExportOptions from "@/components/PdfExportOptions";

interface ExportPanelProps {
  document: SopDocument;
  onExport: (format: ExportFormat | "bundle", options?: ExportOptions) => void;
  isExporting?: boolean;
  exportProgress?: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  document,
  onExport,
  isExporting = false,
  exportProgress = ""
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | "bundle">("bundle");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPdfExportOptions, setShowPdfExportOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    theme: "auto",
    includeTableOfContents: true,
    includeProgressInfo: true,
    quality: "high",
    mode: "standalone"
  });

  const [bundleOptions, setBundleOptions] = useState({
    pdfTheme: "professional",
    customPrimaryColor: "#007AFF",
    customSecondaryColor: "#1E1E1E",
    includeResources: true,
    bundleName: document.title || "Training-Package",
    includeStyleGuide: true,
    includeQuickReference: true,
    includeVideoPlaceholders: false,
    generateThumbnails: true,
    createFolderStructure: true
  });

  const exportFormats = [
    {
      id: "bundle" as const,
      title: "Bundled Training Package",
      description: "Complete training solution with PDF manual + interactive HTML module",
      icon: Package,
      badge: "Recommended",
      badgeColor: "bg-gradient-to-r from-purple-600 to-blue-600",
      features: ["Professional PDF Manual", "Interactive HTML Module", "Offline Capable", "Resource Files"]
    },
    {
      id: "pdf" as const,
      title: "PDF Manual",
      description: "Professional training manual for printing and reference",
      icon: FileText,
      badge: "Classic",
      badgeColor: "bg-gray-600",
      features: ["Print-Ready", "Professional Layout", "Comprehensive", "Portable"]
    },
    {
      id: "html" as const,
      title: "Interactive Module",
      description: "Web-based training with progress tracking and interactivity",
      icon: Globe,
      badge: "Interactive",
      badgeColor: "bg-green-600",
      features: ["Progress Tracking", "Interactive Elements", "Modern Design", "Self-Contained"]
    },
    {
      id: "training-module" as const,
      title: "Enhanced Training Module",
      description: "Advanced interactive training with LMS features",
      icon: GraduationCap,
      badge: "Advanced",
      badgeColor: "bg-orange-600",
      features: ["LMS Integration", "Advanced Analytics", "Custom Branding", "Password Protection"]
    }
  ];

  const pdfThemes = [
    { id: "professional", name: "Professional", description: "Clean, business-focused design" },
    { id: "elegant", name: "Elegant", description: "Sophisticated purple and gold styling" },
    { id: "technical", name: "Technical", description: "Clean, engineering-focused design" },
    { id: "modern", name: "Modern", description: "Contemporary styling with bold accents" },
    { id: "corporate", name: "Corporate", description: "Traditional, formal appearance" },
    { id: "custom", name: "Custom", description: "Use your brand colors" }
  ];

  const handleExport = () => {
    if (selectedFormat === "bundle") {
      // For bundle exports, pass the options in a format the DocumentManager expects
      const bundleExportOptions = {
        bundleOptions: {
          pdfOptions: {
            theme: bundleOptions.pdfTheme,
            customColors: bundleOptions.pdfTheme === "custom" ? {
              primary: bundleOptions.customPrimaryColor,
              secondary: bundleOptions.customSecondaryColor
            } : undefined,
            includeTableOfContents: exportOptions.includeTableOfContents,
            includeProgressInfo: exportOptions.includeProgressInfo,
            quality: exportOptions.quality
          },
          htmlOptions: {
            mode: exportOptions.mode,
            enhanced: true,
            enhancedOptions: {
              theme: exportOptions.theme,
              lmsFeatures: {
                enableNotes: true,
                enableBookmarks: true,
                enableSearch: true,
                enableProgressTracking: exportOptions.includeProgressInfo
              }
            }
          },
          includeResources: bundleOptions.includeResources,
          bundleName: bundleOptions.bundleName
        },
        // Add bundle-specific options at root level for easier access
        includeStyleGuide: bundleOptions.includeStyleGuide,
        includeQuickReference: bundleOptions.includeQuickReference,
        generateThumbnails: bundleOptions.generateThumbnails,
        createFolderStructure: bundleOptions.createFolderStructure
      };
      
      console.log('🎯 ExportPanel sending bundle options:', bundleExportOptions);
      onExport(selectedFormat, bundleExportOptions as any);
    } else if (selectedFormat === "pdf") {
      // Show PDF export options modal for user to choose between Standard and Demo-Style
      setShowPdfExportOptions(true);
    } else {
      // For other formats, use the original structure
      const options: ExportOptions = {
        ...exportOptions
      };
      onExport(selectedFormat, options);
    }
  };

  const canExport = document.title && document.topic && document.steps.length > 0;

  return (
    <div className="w-full h-full bg-[#1E1E1E] text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Training Module
          </h2>
        </div>
        
        {!canExport && (
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3 mb-4">
            <p className="text-amber-300 text-sm">
              Please add a title, topic, and at least one step before exporting.
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Format Selection */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium">Choose Export Format</h3>
          
          <div className="grid gap-3">
            {exportFormats.map((format) => (
              <motion.div
                key={format.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedFormat === format.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }`}
                onClick={() => setSelectedFormat(format.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${format.badgeColor} flex items-center justify-center flex-shrink-0`}>
                    <format.icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{format.title}</h4>
                      <Badge className={`${format.badgeColor} text-white text-xs`}>
                        {format.badge}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-zinc-400 mb-2">{format.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {format.features.map((feature, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-zinc-700/50 rounded text-zinc-300">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedFormat === format.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-zinc-600"
                  }`}>
                    {selectedFormat === format.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Separator className="bg-zinc-700 my-6" />

        {/* Bundle-Specific Options */}
        {selectedFormat === "bundle" && (
          <div className="space-y-6 mb-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Bundle Configuration
            </h3>
            
            {/* Bundle Name */}
            <div>
              <Label htmlFor="bundleName" className="text-sm font-medium text-zinc-300 mb-2 block">
                Bundle Name
              </Label>
              <Input
                id="bundleName"
                value={bundleOptions.bundleName}
                onChange={(e) => setBundleOptions(prev => ({ ...prev, bundleName: e.target.value }))}
                placeholder="Training Package Name"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            {/* PDF Theme Selection */}
            <div>
              <Label className="text-sm font-medium text-zinc-300 mb-2 block">
                PDF Manual Theme
              </Label>
              <Select value={bundleOptions.pdfTheme} onValueChange={(value) => setBundleOptions(prev => ({ ...prev, pdfTheme: value }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pdfThemes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      <div>
                        <div className="font-medium">{theme.name}</div>
                        <div className="text-sm text-zinc-400">{theme.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Colors */}
            {bundleOptions.pdfTheme === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-zinc-300 mb-2 block">
                    Primary Color
                  </Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded border border-zinc-700"
                      style={{ backgroundColor: bundleOptions.customPrimaryColor }}
                    />
                    <Input
                      type="color"
                      value={bundleOptions.customPrimaryColor}
                      onChange={(e) => setBundleOptions(prev => ({ ...prev, customPrimaryColor: e.target.value }))}
                      className="flex-1 bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-zinc-300 mb-2 block">
                    Secondary Color
                  </Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded border border-zinc-700"
                      style={{ backgroundColor: bundleOptions.customSecondaryColor }}
                    />
                    <Input
                      type="color"
                      value={bundleOptions.customSecondaryColor}
                      onChange={(e) => setBundleOptions(prev => ({ ...prev, customSecondaryColor: e.target.value }))}
                      className="flex-1 bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Bundle Options */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Bundle Contents
              </h4>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-zinc-300">Include Resources</Label>
                    <p className="text-xs text-zinc-500">Add logos, backgrounds, and media files</p>
                  </div>
                  <Switch
                    checked={bundleOptions.includeResources}
                    onCheckedChange={(checked) => setBundleOptions(prev => ({ ...prev, includeResources: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-zinc-300">Style Guide</Label>
                    <p className="text-xs text-zinc-500">Generate a visual style guide document</p>
                  </div>
                  <Switch
                    checked={bundleOptions.includeStyleGuide}
                    onCheckedChange={(checked) => setBundleOptions(prev => ({ ...prev, includeStyleGuide: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-zinc-300">Quick Reference</Label>
                    <p className="text-xs text-zinc-500">Create a condensed cheat sheet</p>
                  </div>
                  <Switch
                    checked={bundleOptions.includeQuickReference}
                    onCheckedChange={(checked) => setBundleOptions(prev => ({ ...prev, includeQuickReference: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-zinc-300">Organized Folders</Label>
                    <p className="text-xs text-zinc-500">Structure content in professional folders</p>
                  </div>
                  <Switch
                    checked={bundleOptions.createFolderStructure}
                    onCheckedChange={(checked) => setBundleOptions(prev => ({ ...prev, createFolderStructure: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-zinc-300">Generate Thumbnails</Label>
                    <p className="text-xs text-zinc-500">Create preview images for all screenshots</p>
                  </div>
                  <Switch
                    checked={bundleOptions.generateThumbnails}
                    onCheckedChange={(checked) => setBundleOptions(prev => ({ ...prev, generateThumbnails: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Common Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Export Options</h3>
          
          <div className="grid gap-4">
            {/* Quality */}
            <div>
              <Label className="text-sm font-medium text-zinc-300 mb-2 block">Quality</Label>
              <Select value={exportOptions.quality} onValueChange={(value: "low" | "medium" | "high") => setExportOptions(prev => ({ ...prev, quality: value }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Faster)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (Best Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Include Table of Contents */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-zinc-300">Table of Contents</Label>
                <p className="text-xs text-zinc-500">Add navigation overview</p>
              </div>
              <Switch
                checked={exportOptions.includeTableOfContents}
                onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeTableOfContents: checked }))}
              />
            </div>

            {/* Include Progress Info */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-zinc-300">Progress Tracking</Label>
                <p className="text-xs text-zinc-500">Enable completion tracking</p>
              </div>
              <Switch
                checked={exportOptions.includeProgressInfo}
                onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeProgressInfo: checked }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-zinc-800">
        {isExporting && exportProgress && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              <span className="text-sm text-blue-300">{exportProgress}</span>
            </div>
          </div>
        )}
        
        <Button
          onClick={handleExport}
          disabled={!canExport || isExporting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export {exportFormats.find(f => f.id === selectedFormat)?.title}
            </>
          )}
        </Button>
        
        {selectedFormat === "bundle" && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Estimated size:</span>
              <span className="font-mono">{document.steps.length > 10 ? '15-25 MB' : '5-15 MB'}</span>
            </div>
            <div className="text-xs text-zinc-500 text-center">
              Complete training package with PDF manual, interactive module, and resources
            </div>
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>PDF Manual</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Interactive Module</span>
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Resources</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* PDF Export Options Modal */}
      <Dialog open={showPdfExportOptions} onOpenChange={setShowPdfExportOptions}>
        <DialogPortal>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto z-[9999]" style={{ zIndex: 9999 }}>
            <DialogHeader>
              <DialogTitle className="text-white">PDF Export Options</DialogTitle>
            </DialogHeader>
            <PdfExportOptions 
              sopDocument={document}
              onClose={() => setShowPdfExportOptions(false)}
            />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default ExportPanel;
