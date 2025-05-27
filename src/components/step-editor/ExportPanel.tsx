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
  Settings,
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
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  const htmlThemes = [
    { id: "auto", name: "Smart Theme", description: "Automatically adapts to content type" },
    { id: "light", name: "Professional Light", description: "Clean, business-focused light theme" },
    { id: "dark", name: "Modern Dark", description: "Contemporary dark theme" }
  ];

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
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800">
        {/* HTML Export Section */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">HTML Export (Recommended)</h3>
          
          <Card className="bg-blue-900/20 border-blue-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-400" />
                </div>
                Interactive HTML Document
              </CardTitle>
              <div className="flex gap-2">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  Best Quality
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Print-to-PDF Ready
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-blue-200 text-sm">
                Professional HTML document that opens in any browser. Use Ctrl+P (Cmd+P) to print as PDF with perfect styling and formatting.
              </p>
              
              <div className="space-y-3">
                <h4 className="text-white font-medium text-sm">Features:</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Perfect browser compatibility</li>
                  <li>• Optimized for print-to-PDF workflow</li>
                  <li>• Professional styling and layout</li>
                  <li>• Works offline and easy to share</li>
                  <li>• All images and styling embedded</li>
                </ul>
              </div>

              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Printer className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-green-200 text-xs">
                    <p className="font-medium mb-1">Best PDF Workflow:</p>
                    <p>1. Export as HTML → 2. Open in browser → 3. Press Ctrl+P → 4. Save as PDF</p>
                  </div>
                </div>
              </div>

              {/* HTML Options */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-blue-200 text-sm font-medium">Theme</Label>
                  <Select
                    value={exportOptions.theme}
                    onValueChange={(value) => setExportOptions(prev => ({ ...prev, theme: value as "auto" | "light" | "dark" }))}
                  >
                    <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {htmlThemes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id} className="text-white hover:bg-zinc-700">
                          <div>
                            <div className="font-medium">{theme.name}</div>
                            <div className="text-xs text-zinc-400">{theme.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-blue-200 text-sm font-medium">Table of Contents</Label>
                    <p className="text-xs text-blue-300/70">Add navigation menu</p>
                  </div>
                  <Switch
                    checked={exportOptions.includeTableOfContents}
                    onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeTableOfContents: checked }))}
                  />
                </div>

                {showAdvanced && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-blue-200 text-sm font-medium">High Quality Images</Label>
                        <p className="text-xs text-blue-300/70">Full resolution export</p>
                      </div>
                      <Switch
                        checked={exportOptions.quality === "high"}
                        onCheckedChange={(checked) => setExportOptions(prev => ({ 
                          ...prev, 
                          quality: checked ? "high" : "medium" 
                        }))}
                      />
                    </div>

                    {/* HTML Customization Section */}
                    <div className="mt-4 p-4 bg-blue-900/10 border border-blue-600/30 rounded-lg">
                      <h4 className="text-blue-200 font-medium text-sm mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        HTML Customization
                      </h4>
                      
                      <div className="space-y-3">
                        {/* Primary Color */}
                        <div className="flex items-center justify-between">
                          <Label className="text-blue-200 text-xs">Primary Color</Label>
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
                            <span className="text-xs text-blue-300">
                              {exportOptions.customization?.primaryColor || "#007AFF"}
                            </span>
                          </div>
                        </div>

                        {/* Accent Color */}
                        <div className="flex items-center justify-between">
                          <Label className="text-blue-200 text-xs">Accent Color</Label>
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
                              className="w-8 h-6 rounded border border-zinc-600 bg-transparent cursor-pointer"
                            />
                            <span className="text-xs text-blue-300">
                              {exportOptions.customization?.accentColor || "#5856D6"}
                            </span>
                          </div>
                        </div>

                        {/* Font Family */}
                        <div className="flex items-center justify-between">
                          <Label className="text-blue-200 text-xs">Font Style</Label>
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
                            <SelectTrigger className="w-32 h-8 bg-zinc-800 border-zinc-700 text-white text-xs">
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
                        <div className="flex items-center justify-between">
                          <Label className="text-blue-200 text-xs">Header Style</Label>
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
                            <SelectTrigger className="w-32 h-8 bg-zinc-800 border-zinc-700 text-white text-xs">
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
                        <div className="flex items-center justify-between">
                          <Label className="text-blue-200 text-xs">Layout</Label>
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
                            <SelectTrigger className="w-32 h-8 bg-zinc-800 border-zinc-700 text-white text-xs">
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
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-blue-300 hover:text-blue-200"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showAdvanced ? "Hide" : "Show"} Advanced
                  </Button>

                  <Button
                    onClick={handleHtmlExport}
                    disabled={!canExport || isExporting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-zinc-700 my-6" />

        {/* PDF Export Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-3">Direct PDF Export</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Standard PDF */}
            <Card className="bg-zinc-800/50 border-zinc-700 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  Standard PDF Export
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    <Zap className="h-3 w-3 mr-1" />
                    Fast
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                    Reliable
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-zinc-300 text-sm">
                  Programmatic PDF generation with consistent SOPify styling. Downloads automatically with no additional steps.
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm">Features:</h4>
                  <ul className="text-zinc-400 text-sm space-y-1">
                    <li>• Automatic download</li>
                    <li>• Consistent SOPify branding</li>
                    <li>• Professional business styling</li>
                    <li>• Works in all browsers</li>
                  </ul>
                </div>

                <Button
                  onClick={handleStandardPdfGeneration}
                  disabled={!canExport || isGeneratingPdf === 'standard'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isGeneratingPdf === 'standard' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Standard PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Demo-Style PDF */}
            <Card className="bg-zinc-800/50 border-zinc-700 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Printer className="h-5 w-5 text-purple-400" />
                  </div>
                  Demo-Style PDF Export
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Exact Demo Match
                  </Badge>
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    Browser Print
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-zinc-300 text-sm">
                  Uses browser's native print to preserve exact demo styling. Perfect pixel-perfect reproduction.
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm">Features:</h4>
                  <ul className="text-zinc-400 text-sm space-y-1">
                    <li>• Exact demo HTML styling</li>
                    <li>• Perfect font rendering</li>
                    <li>• Native browser print quality</li>
                    <li>• Preserves all CSS styling</li>
                  </ul>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-amber-200 text-xs">
                      <p className="font-medium mb-1">How it works:</p>
                      <p>Opens print window with styled document. Use "Save as PDF" in print dialog.</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleHtmlToPdfGeneration}
                  disabled={!canExport || isGeneratingPdf === 'html'}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isGeneratingPdf === 'html' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Opening Print Window...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Generate Demo-Style PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recommendation */}
          <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Recommendation
            </h4>
            <p className="text-zinc-300 text-sm">
              For best quality, use <strong>HTML Export</strong> then print to PDF in your browser. 
              For quick downloads, use <strong>Standard PDF Export</strong>. 
              For exact demo styling, use <strong>Demo-Style PDF Export</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
