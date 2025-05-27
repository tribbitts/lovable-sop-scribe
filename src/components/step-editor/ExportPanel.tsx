import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  X, 
  Download, 
  FileText, 
  Globe, 
  Loader2,
  Printer,
  Sparkles,
  Zap,
  Info
} from "lucide-react";
import { SopDocument, ExportFormat, ExportOptions } from "@/types/sop";
import { generatePDF, downloadPDFWithBrowserPrint } from "@/lib/pdf-generator";
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);
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

  const handleStandardPdfGeneration = async () => {
    setIsGeneratingPdf('standard');
    try {
      await generatePDF(document);
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("PDF generation failed. Please try again.");
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  const handleHtmlToPdfGeneration = async () => {
    setIsGeneratingPdf('html');
    try {
      await downloadPDFWithBrowserPrint(document);
      toast.success("PDF generation window opened! Use your browser's print dialog to save as PDF.");
    } catch (error) {
      console.error("HTML-to-PDF generation failed:", error);
      toast.error("PDF generation failed. Please ensure popups are allowed for this site.");
    } finally {
      setIsGeneratingPdf(null);
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
        
        {/* HTML Export - Primary Option */}
        <Card className="bg-blue-900/20 border-blue-600/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              HTML Export
            </CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Recommended
              </Badge>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Print-to-PDF Ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-200 text-sm">
              Professional HTML document that opens in any browser. Perfect for sharing and printing to PDF.
            </p>
            
            {/* Business Tier Customization */}
            <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/50 rounded-lg">
              <h4 className="text-purple-200 font-medium text-sm mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Business Customization
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Primary Color */}
                <div className="space-y-1">
                  <Label className="text-purple-200 text-xs">Primary Color</Label>
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
                      className="w-8 h-6 rounded border border-zinc-600 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs text-purple-300">
                      {exportOptions.customization?.primaryColor || "#007AFF"}
                    </span>
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-1">
                  <Label className="text-purple-200 text-xs">Font Style</Label>
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
                      <SelectItem value="system" className="text-white hover:bg-zinc-700 text-xs">System</SelectItem>
                      <SelectItem value="serif" className="text-white hover:bg-zinc-700 text-xs">Serif</SelectItem>
                      <SelectItem value="sans-serif" className="text-white hover:bg-zinc-700 text-xs">Sans Serif</SelectItem>
                      <SelectItem value="monospace" className="text-white hover:bg-zinc-700 text-xs">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Header Style */}
                <div className="space-y-1">
                  <Label className="text-purple-200 text-xs">Header Style</Label>
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
                      <SelectItem value="modern" className="text-white hover:bg-zinc-700 text-xs">Modern</SelectItem>
                      <SelectItem value="classic" className="text-white hover:bg-zinc-700 text-xs">Classic</SelectItem>
                      <SelectItem value="minimal" className="text-white hover:bg-zinc-700 text-xs">Minimal</SelectItem>
                      <SelectItem value="corporate" className="text-white hover:bg-zinc-700 text-xs">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Layout Style */}
                <div className="space-y-1">
                  <Label className="text-purple-200 text-xs">Layout</Label>
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
                      <SelectItem value="standard" className="text-white hover:bg-zinc-700 text-xs">Standard</SelectItem>
                      <SelectItem value="compact" className="text-white hover:bg-zinc-700 text-xs">Compact</SelectItem>
                      <SelectItem value="spacious" className="text-white hover:bg-zinc-700 text-xs">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table of Contents Toggle */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-600/30">
                <div>
                  <Label className="text-purple-200 text-xs font-medium">Table of Contents</Label>
                  <p className="text-xs text-purple-300/70">Add navigation menu</p>
                </div>
                <Switch
                  checked={exportOptions.includeTableOfContents}
                  onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeTableOfContents: checked }))}
                />
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Printer className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-green-200 text-xs">
                  <p className="font-medium mb-1">Best PDF Workflow:</p>
                  <p>1. Export HTML → 2. Open in browser → 3. Ctrl+P → 4. Save as PDF</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleHtmlExport}
              disabled={!canExport || isExporting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
          </CardContent>
        </Card>

        <Separator className="bg-zinc-700" />

        {/* PDF Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Direct PDF Export</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard PDF */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-blue-400" />
                  Standard PDF
                </CardTitle>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 w-fit">
                  <Zap className="h-3 w-3 mr-1" />
                  Fast & Reliable
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-zinc-300 text-sm">
                  Clean, simple PDF with consistent styling. Downloads automatically.
                </p>
                
                <Button
                  onClick={handleStandardPdfGeneration}
                  disabled={!canExport || isGeneratingPdf === 'standard'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {isGeneratingPdf === 'standard' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Demo-Style PDF */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Printer className="h-4 w-4 text-purple-400" />
                  Demo-Style PDF
                </CardTitle>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 w-fit">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Exact Styling
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-zinc-300 text-sm">
                  Uses browser print for pixel-perfect reproduction of demo styling.
                </p>
                
                <Button
                  onClick={handleHtmlToPdfGeneration}
                  disabled={!canExport || isGeneratingPdf === 'html'}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  {isGeneratingPdf === 'html' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Print to PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
