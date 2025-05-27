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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  X, 
  Download, 
  FileText, 
  Globe, 
  Loader2,
  Settings,
  Printer,
  ExternalLink
} from "lucide-react";
import { SopDocument, ExportFormat, ExportOptions } from "@/types/sop";
import PdfExportOptions from "@/components/PdfExportOptions";

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
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("html");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPdfExportOptions, setShowPdfExportOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    theme: "auto",
    includeTableOfContents: true,
    includeProgressInfo: false,
    quality: "high",
    mode: "standalone"
  });

  const exportFormats = [
    {
      id: "html" as const,
      title: "HTML SOP (Recommended)",
      description: "Interactive HTML that can be viewed in any browser and printed as PDF",
      icon: Globe,
      badge: "Best Quality",
      badgeColor: "bg-gradient-to-r from-blue-600 to-green-600",
      features: ["Browser Compatible", "Print-to-PDF Ready", "Perfect Styling", "Offline Capable"],
      primary: true
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
    { id: "auto", name: "Smart Theme", description: "Automatically adapts to content type" },
    { id: "light", name: "Professional Light", description: "Clean, business-focused light theme" },
    { id: "dark", name: "Modern Dark", description: "Contemporary dark theme" }
  ];

  const handleExport = () => {
    if (selectedFormat === "pdf") {
      setShowPdfExportOptions(true);
    } else {
      // HTML export with clean options
      const htmlOptions: ExportOptions = {
        ...exportOptions,
        mode: 'standalone',
        enhanced: false // Keep it simple
      };
      onExport(selectedFormat, htmlOptions);
    }
  };

  const handlePdfExportOptionsComplete = (pdfOptions: any) => {
    setShowPdfExportOptions(false);
    onExport("pdf", pdfOptions);
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
                Export as HTML first, then use your browser's "Print to PDF" (Ctrl+P or Cmd+P) for the highest quality PDF output with perfect styling and formatting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Format Selection */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Choose Export Format</h3>
          
          {exportFormats.map((format) => (
            <Card
              key={format.id}
              className={`cursor-pointer transition-all ${
                selectedFormat === format.id
                  ? "bg-blue-900/30 border-blue-600/50"
                  : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/80"
              }`}
              onClick={() => setSelectedFormat(format.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
                    format.id === "html" ? "from-blue-600 to-green-600" : "from-gray-600 to-gray-700"
                  } flex items-center justify-center flex-shrink-0`}>
                    <format.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold">{format.title}</h4>
                      <Badge className={format.badgeColor}>
                        {format.badge}
                      </Badge>
                    </div>
                    <p className="text-zinc-400 text-sm mb-3">{format.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {format.features.map((feature, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-zinc-700/50 rounded text-zinc-300">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedFormat === format.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-zinc-600"
                  }`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Options */}
        {selectedFormat === "html" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">HTML Options</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-zinc-400 hover:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvanced ? "Hide" : "Show"} Advanced
              </Button>
            </div>

            <div className="space-y-4">
              {/* Theme Selection */}
              <div>
                <Label className="text-zinc-300 text-sm font-medium mb-2 block">
                  Theme
                </Label>
                <Select
                  value={exportOptions.theme}
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, theme: value as "auto" | "light" | "dark" }))}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
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

              {/* Basic Options */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300 text-sm font-medium">
                    Include Table of Contents
                  </Label>
                  <p className="text-xs text-zinc-500">Add navigation menu to your SOP</p>
                </div>
                <Switch
                  checked={exportOptions.includeTableOfContents}
                  onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, includeTableOfContents: checked }))}
                />
              </div>

              {showAdvanced && (
                <>
                  <Separator className="bg-zinc-700" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-zinc-300 text-sm font-medium">
                        High Quality Images
                      </Label>
                      <p className="text-xs text-zinc-500">Export with full resolution images</p>
                    </div>
                    <Switch
                      checked={exportOptions.quality === "high"}
                      onCheckedChange={(checked) => setExportOptions(prev => ({ 
                        ...prev, 
                        quality: checked ? "high" : "medium" 
                      }))}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Export Tips */}
        <div className="mt-6 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
          <h4 className="text-white font-medium text-sm mb-2">💡 Export Tips</h4>
          <ul className="text-zinc-400 text-xs space-y-1">
            {selectedFormat === "html" ? (
              <>
                <li>• Open the HTML file in any browser to view your SOP</li>
                <li>• Use Ctrl+P (or Cmd+P) to print as PDF with perfect formatting</li>
                <li>• HTML files work offline and can be shared easily</li>
                <li>• All images and styling are embedded in the file</li>
              </>
            ) : (
              <>
                <li>• PDF files are immediately ready for printing</li>
                <li>• Works on all devices and platforms</li>
                <li>• Perfect for sharing via email or document systems</li>
                <li>• Maintains consistent formatting across devices</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-zinc-800">
        <Button
          onClick={handleExport}
          disabled={!canExport || isExporting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          size="lg"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {exportProgress || "Exporting..."}
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export as {selectedFormat.toUpperCase()}
            </>
          )}
        </Button>
      </div>

      {/* PDF Export Options Dialog */}
      <Dialog open={showPdfExportOptions} onOpenChange={setShowPdfExportOptions}>
        <DialogContent className="bg-[#1E1E1E] border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">PDF Export Options</DialogTitle>
          </DialogHeader>
          <PdfExportOptions
            sopDocument={document}
            onClose={() => setShowPdfExportOptions(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExportPanel;
