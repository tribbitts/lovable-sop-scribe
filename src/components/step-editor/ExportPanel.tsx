
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
  Eye, 
  Package,
  Loader2,
  Settings,
  Palette,
  Shield,
  BookOpen,
  Zap,
  Printer,
  ExternalLink
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
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | "bundle">("html");
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
    bundleName: document.title || "SOP-Package",
    includeStyleGuide: true,
    includeQuickReference: true,
    generateThumbnails: true,
    createFolderStructure: true
  });

  const exportFormats = [
    {
      id: "html" as const,
      title: "Interactive HTML SOP",
      description: "Rich, interactive SOP that can be viewed in any browser and printed as PDF",
      icon: Globe,
      badge: "Recommended",
      badgeColor: "bg-gradient-to-r from-blue-600 to-green-600",
      features: ["Browser Compatible", "Print-to-PDF Ready", "Interactive Elements", "Offline Capable"],
      primary: true
    },
    {
      id: "bundle" as const,
      title: "Complete SOP Package",
      description: "Comprehensive package with HTML SOP + PDF manual + resources",
      icon: Package,
      badge: "Complete",
      badgeColor: "bg-gradient-to-r from-purple-600 to-blue-600",
      features: ["HTML SOP", "PDF Manual", "Resource Files", "Professional Structure"]
    },
    {
      id: "pdf" as const,
      title: "Direct PDF Export",
      description: "Traditional PDF document for immediate download",
      icon: FileText,
      badge: "Classic",
      badgeColor: "bg-gray-600",
      features: ["Instant Download", "Print-Ready", "Universal Compatibility", "Traditional Format"]
    }
  ];

  const htmlThemes = [
    { id: "auto", name: "Smart Theme", description: "Automatically adapts to content and user preference" },
    { id: "light", name: "Professional Light", description: "Clean, business-focused light theme" },
    { id: "dark", name: "Modern Dark", description: "Contemporary dark theme with rich colors" }
  ];

  const handleExport = () => {
    if (selectedFormat === "bundle") {
      // For bundle exports, pass comprehensive options
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
            theme: exportOptions.theme,
            includeTableOfContents: exportOptions.includeTableOfContents,
            includeProgressInfo: exportOptions.includeProgressInfo
          },
          includeResources: bundleOptions.includeResources,
          bundleName: bundleOptions.bundleName
        },
        includeStyleGuide: bundleOptions.includeStyleGuide,
        includeQuickReference: bundleOptions.includeQuickReference,
        generateThumbnails: bundleOptions.generateThumbnails,
        createFolderStructure: bundleOptions.createFolderStructure
      };
      
      console.log('🎯 ExportPanel sending bundle options:', bundleExportOptions);
      onExport(selectedFormat, bundleExportOptions as any);
    } else if (selectedFormat === "pdf") {
      // Show PDF export options modal
      setShowPdfExportOptions(true);
    } else if (selectedFormat === "html") {
      // For HTML exports, use enhanced options for interactivity
      const htmlOptions: ExportOptions = {
        ...exportOptions,
        mode: 'standalone',
        enhanced: true,
        enhancedOptions: {
          theme: exportOptions.theme,
          features: {
            enableNotes: true,
            enableBookmarks: true,
            enableSearch: true,
            enableProgressTracking: exportOptions.includeProgressInfo
          }
        }
      };
      onExport(selectedFormat, htmlOptions);
    } else {
      onExport(selectedFormat, exportOptions);
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
            Export SOP
          </h2>
        </div>
        
        {!canExport && (
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3 mb-4">
            <p className="text-amber-300 text-sm">
              Please add a title, topic, and at least one step before exporting.
            </p>
          </div>
        )}

        {/* HTML Export Highlight */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Printer className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-blue-300 font-medium text-sm mb-1">Best PDF Quality</h3>
              <p className="text-blue-200 text-xs leading-relaxed">
                Export as Interactive HTML, then use your browser's "Print to PDF" (Ctrl+P) for the highest quality PDF output with perfect styling.
              </p>
            </div>
          </div>
        </div>
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
                } ${format.primary ? "ring-2 ring-blue-500/30" : ""}`}
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
                      {format.primary && (
                        <Badge className="bg-green-600 text-white text-xs">
                          Best Quality
                        </Badge>
                      )}
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

        {/* Format-Specific Options */}
        {selectedFormat === "html" && (
          <div className="space-y-6 mb-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Interactive HTML Options
            </h3>
            
            {/* Theme Selection */}
            <div>
              <Label className="text-sm font-medium text-zinc-300 mb-2 block">
                Visual Theme
              </Label>
              <Select value={exportOptions.theme} onValueChange={(value: "light" | "dark" | "auto") => setExportOptions(prev => ({ ...prev, theme: value }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {htmlThemes.map((theme) => (
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

            {/* Print-to-PDF Guidance */}
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Printer className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-green-300 font-medium text-sm mb-2">Perfect PDF Creation</h4>
                  <div className="text-green-200 text-xs space-y-1">
                    <p>1. Export as Interactive HTML</p>
                    <p>2. Open the HTML file in your browser</p>
                    <p>3. Press Ctrl+P (or Cmd+P on Mac)</p>
                    <p>4. Select "Save as PDF" for professional quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedFormat === "bundle" && (
          <div className="space-y-6 mb-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Package className="h-5 w-5" />
              Complete Package Options
            </h3>
            
            {/* Package Name */}
            <div>
              <Label htmlFor="bundleName" className="text-sm font-medium text-zinc-300 mb-2 block">
                Package Name
              </Label>
              <Input
                id="bundleName"
                value={bundleOptions.bundleName}
                onChange={(e) => setBundleOptions(prev => ({ ...prev, bundleName: e.target.value }))}
                placeholder="SOP Package Name"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            {/* Package Contents */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Package Contents
              </h4>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-zinc-300">Resource Files</Label>
                    <p className="text-xs text-zinc-500">Include screenshots and media files</p>
                  </div>
                  <Switch
                    checked={bundleOptions.includeResources}
                    onCheckedChange={(checked) => setBundleOptions(prev => ({ ...prev, includeResources: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-zinc-300">Quick Reference</Label>
                    <p className="text-xs text-zinc-500">Generate a condensed summary document</p>
                  </div>
                  <Switch
                    checked={bundleOptions.includeQuickReference}
                    onCheckedChange={(checked) => setBundleOptions(prev => ({ ...prev, includeQuickReference: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-zinc-300">Organized Structure</Label>
                    <p className="text-xs text-zinc-500">Create professional folder organization</p>
                  </div>
                  <Switch
                    checked={bundleOptions.createFolderStructure}
                    onCheckedChange={(checked) => setBundleOptions(prev => ({ ...prev, createFolderStructure: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Common Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Export Settings</h3>
          
          <div className="grid gap-4">
            {/* Quality */}
            <div>
              <Label className="text-sm font-medium text-zinc-300 mb-2 block">Quality</Label>
              <Select value={exportOptions.quality} onValueChange={(value: "low" | "medium" | "high") => setExportOptions(prev => ({ ...prev, quality: value }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Fast (Lower Quality)</SelectItem>
                  <SelectItem value="medium">Balanced (Good Quality)</SelectItem>
                  <SelectItem value="high">Best (Highest Quality)</SelectItem>
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

            {/* Include Progress Tracking */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-zinc-300">Step Progress</Label>
                <p className="text-xs text-zinc-500">Enable step completion tracking</p>
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
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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
        
        {selectedFormat === "html" && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-zinc-400 text-center">
              Interactive HTML SOP with browser print-to-PDF capability
            </div>
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Interactive</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Print-Ready</span>
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Professional</span>
              </div>
            </div>
          </div>
        )}

        {selectedFormat === "bundle" && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Estimated size:</span>
              <span className="font-mono">{document.steps.length > 10 ? '15-25 MB' : '5-15 MB'}</span>
            </div>
            <div className="text-xs text-zinc-500 text-center">
              Complete SOP package with HTML, PDF, and resources
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
