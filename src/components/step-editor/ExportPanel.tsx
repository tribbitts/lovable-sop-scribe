import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Download, 
  Globe, 
  Loader2,
  Printer,
  Sparkles,
  Info
} from "lucide-react";
import { SopDocument, ExportFormat, ExportOptions } from "@/types/sop";
import { downloadPDFWithBrowserPrint } from "@/lib/pdf-generator";
import { toast } from "sonner";

interface ExportPanelProps {
  document: SopDocument;
  onExport: (format: ExportFormat, options?: ExportOptions) => void;
  isExporting?: boolean;
  exportProgress?: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  document,
  onExport,
  isExporting = false,
  exportProgress = ""
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    theme: "auto",
    includeTableOfContents: true,
    includeProgressInfo: false,
    quality: "high",
    mode: "standalone",
    customization: {
      primaryColor: "#007AFF",
      accentColor: "#5856D6",
      fontFamily: "system",
      headerStyle: "modern",
      layout: "standard"
    }
  });

  const handleHtmlExport = () => {
    const htmlOptions: ExportOptions = {
      ...exportOptions,
      mode: 'standalone',
      enhanced: false
    };
    onExport("html", htmlOptions);
  };

  const handlePrintToPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadPDFWithBrowserPrint(document);
      toast.success("Print window opened! Use 'Save as PDF' in the print dialog for best results.");
    } catch (error) {
      console.error("Print-to-PDF generation failed:", error);
      toast.error("Print generation failed. Please ensure popups are allowed for this site.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const canExport = document.title && document.topic && document.steps.length > 0;

  return (
    <div className="w-full h-full bg-[#1E1E1E] text-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-zinc-800">
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
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Professional HTML Export */}
        <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-600/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              Professional HTML Export
            </CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium Quality
              </Badge>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Print-to-PDF Ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-blue-200 text-sm leading-relaxed">
              Beautiful, professional HTML document with stunning gradients, perfect typography, and business-grade styling. 
              Includes all screenshots and callouts with pixel-perfect rendering.
            </p>
            
            {/* Business Tier Customization */}
            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-600/50 rounded-lg">
              <h4 className="text-purple-200 font-medium text-sm mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Professional Customization
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Primary Color */}
                <div className="space-y-2">
                  <Label className="text-purple-200 text-xs font-medium">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={exportOptions.customization?.primaryColor || "#007AFF"}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        customization: {
                          ...prev.customization,
                          primaryColor: e.target.value
                        }
                      }))}
                      className="w-10 h-8 rounded border border-zinc-600 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs text-purple-300 font-mono">
                      {exportOptions.customization?.primaryColor || "#007AFF"}
                    </span>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                  <Label className="text-purple-200 text-xs font-medium">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={exportOptions.customization?.accentColor || "#5856D6"}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        customization: {
                          ...prev.customization,
                          accentColor: e.target.value
                        }
                      }))}
                      className="w-10 h-8 rounded border border-zinc-600 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs text-purple-300 font-mono">
                      {exportOptions.customization?.accentColor || "#5856D6"}
                    </span>
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                  <Label className="text-purple-200 text-xs font-medium">Font Style</Label>
                  <Select
                    value={exportOptions.customization?.fontFamily || "system"}
                    onValueChange={(value) => setExportOptions(prev => ({
                      ...prev,
                      customization: {
                        ...prev.customization,
                        fontFamily: value as any
                      }
                    }))}
                  >
                    <SelectTrigger className="h-8 bg-zinc-800 border-zinc-700 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="system" className="text-white hover:bg-zinc-700 text-xs">Helvetica (Recommended)</SelectItem>
                      <SelectItem value="serif" className="text-white hover:bg-zinc-700 text-xs">Serif (Traditional)</SelectItem>
                      <SelectItem value="sans-serif" className="text-white hover:bg-zinc-700 text-xs">Sans Serif (Clean)</SelectItem>
                      <SelectItem value="monospace" className="text-white hover:bg-zinc-700 text-xs">Monospace (Technical)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Header Style */}
                <div className="space-y-2">
                  <Label className="text-purple-200 text-xs font-medium">Header Style</Label>
                  <Select
                    value={exportOptions.customization?.headerStyle || "modern"}
                    onValueChange={(value) => setExportOptions(prev => ({
                      ...prev,
                      customization: {
                        ...prev.customization,
                        headerStyle: value as any
                      }
                    }))}
                  >
                    <SelectTrigger className="h-8 bg-zinc-800 border-zinc-700 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="modern" className="text-white hover:bg-zinc-700 text-xs">Modern (Gradient)</SelectItem>
                      <SelectItem value="classic" className="text-white hover:bg-zinc-700 text-xs">Classic (Traditional)</SelectItem>
                      <SelectItem value="minimal" className="text-white hover:bg-zinc-700 text-xs">Minimal (Clean)</SelectItem>
                      <SelectItem value="corporate" className="text-white hover:bg-zinc-700 text-xs">Corporate (Professional)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Layout Style */}
              <div className="mt-4 space-y-2">
                <Label className="text-purple-200 text-xs font-medium">Document Layout</Label>
                <Select
                  value={exportOptions.customization?.layout || "standard"}
                  onValueChange={(value) => setExportOptions(prev => ({
                    ...prev,
                    customization: {
                      ...prev.customization,
                      layout: value as any
                    }
                  }))}
                >
                  <SelectTrigger className="h-8 bg-zinc-800 border-zinc-700 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="standard" className="text-white hover:bg-zinc-700 text-xs">Standard (Balanced)</SelectItem>
                    <SelectItem value="compact" className="text-white hover:bg-zinc-700 text-xs">Compact (Space-efficient)</SelectItem>
                    <SelectItem value="spacious" className="text-white hover:bg-zinc-700 text-xs">Spacious (Generous spacing)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table of Contents Toggle */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-600/30">
                <div>
                  <Label className="text-purple-200 text-xs font-medium">Table of Contents</Label>
                  <p className="text-xs text-purple-300/70">Add navigation menu to document</p>
                </div>
                <Switch
                  checked={exportOptions.includeTableOfContents}
                  onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeTableOfContents: checked }))}
                />
              </div>
            </div>

            {/* Export Actions */}
            <div className="space-y-4">
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Printer className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-green-200 text-sm">
                    <p className="font-medium mb-2">Perfect PDF Workflow:</p>
                    <div className="space-y-1 text-xs">
                      <p>1. Export HTML → Opens beautiful document in browser</p>
                      <p>2. Press Ctrl+P (Cmd+P) → Opens print dialog</p>
                      <p>3. Select "Save as PDF" → Perfect professional PDF</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={handleHtmlExport}
                  disabled={!canExport || isExporting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Export HTML
                    </>
                  )}
                </Button>

                <Button
                  onClick={handlePrintToPdf}
                  disabled={!canExport || isGeneratingPdf}
                  variant="outline"
                  className="border-purple-600/50 text-purple-300 hover:bg-purple-600/10"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Quick Print
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Highlight */}
        <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            What's Included
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-300">
            <div className="space-y-2">
              <p>✨ Beautiful gradient headers</p>
              <p>📸 Perfect screenshot rendering</p>
              <p>🎯 Precise callout positioning</p>
              <p>🎨 Full color customization</p>
            </div>
            <div className="space-y-2">
              <p>📱 Mobile-responsive design</p>
              <p>🖨️ Print-optimized layouts</p>
              <p>🏢 Professional business styling</p>
              <p>⚡ Lightning-fast generation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
