import { useState } from "react";
import { useSopContext } from "@/context/SopContext";
import { usePdfExport } from "@/hooks/pdf-export";
import { useHtmlExport } from "@/hooks/useHtmlExport";
import { ExportFormat } from "@/types/sop";
import PreviewButton from "./PreviewButton";
import ExportButton from "./ExportButton";
import PdfPreviewDialog from "./PdfPreviewDialog";
import PdfExportError from "./PdfExportError";
import ExportFormatSelector from "./ExportFormatSelector";
import HtmlExportOptions from "./HtmlExportOptions";
import EnhancedHtmlExportOptions, { EnhancedHtmlExportSettings } from "./EnhancedHtmlExportOptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Settings, Sparkles } from "lucide-react";

// Extended format type
type ExtendedExportFormat = ExportFormat | "enhanced-html";

const ExportManager = () => {
  const { sopDocument } = useSopContext();
  const [format, setFormat] = useState<ExtendedExportFormat>("pdf");
  
  // Enhanced HTML settings
  const [enhancedSettings, setEnhancedSettings] = useState<EnhancedHtmlExportSettings>({
    passwordProtection: {
      enabled: false,
      password: "",
      hint: ""
    },
    lmsFeatures: {
      enableNotes: true,
      enableBookmarks: true,
      enableSearch: true,
      enableProgressTracking: true
    },
    theme: 'auto',
    branding: {
      companyColors: {
        primary: '#007AFF',
        secondary: '#1E1E1E'
      }
    }
  });
  
  const {
    isExporting: isPdfExporting,
    exportProgress: pdfExportProgress,
    pdfPreviewUrl,
    exportError: pdfExportError,
    isPreviewOpen,
    setIsPreviewOpen,
    handleExport: handlePdfExport,
    handlePreview
  } = usePdfExport();
  
  const {
    isExporting: isHtmlExporting,
    exportProgress: htmlExportProgress,
    exportError: htmlExportError,
    exportMode,
    setExportMode,
    handleExportHtml
  } = useHtmlExport();
  
  const isExporting = isPdfExporting || isHtmlExporting;
  const exportProgress = pdfExportProgress || htmlExportProgress;
  const exportError = pdfExportError || htmlExportError;
  
  const onExport = () => {
    if (format === "pdf") {
      handlePdfExport(sopDocument);
    } else if (format === "html") {
      handleExportHtml(sopDocument, { mode: exportMode });
    } else if (format === "enhanced-html") {
      // Use enhanced HTML export
      handleExportHtml(sopDocument, { 
        mode: 'standalone',
        enhanced: true,
        enhancedOptions: enhancedSettings
      });
    }
  };
  
  const onPreview = () => handlePreview(sopDocument);
  
  // Convert exportError to string for display
  const displayError = exportError ? 
    (exportError instanceof Error ? exportError.message : String(exportError)) 
    : null;
  
  return (
    <div className="flex flex-col gap-6">
      {/* Format Selection */}
      <Card className="bg-[#1E1E1E] border-zinc-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Export Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExportFormatSelector format={format} onFormatChange={setFormat} />
          
          {/* Standard HTML Export Options */}
          {format === "html" && (
            <HtmlExportOptions
              exportMode={exportMode}
              onExportModeChange={setExportMode}
              disabled={isExporting}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Enhanced HTML Options */}
      {format === "enhanced-html" && (
        <Card className="bg-[#1E1E1E] border-zinc-700 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-green-400" />
              Training Module Configuration
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">ENHANCED</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedHtmlExportOptions
              settings={enhancedSettings}
              onSettingsChange={setEnhancedSettings}
              disabled={isExporting}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Export Actions */}
      <Card className="bg-[#1E1E1E] border-zinc-700">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            {format === "pdf" && (
              <PreviewButton 
                onClick={onPreview} 
                disabled={sopDocument.steps.length === 0} 
                isExporting={isExporting}
                exportProgress={exportProgress}
              />
            )}
            
            <ExportButton 
              onClick={onExport} 
              isExporting={isExporting} 
              exportProgress={exportProgress} 
              disabled={sopDocument.steps.length === 0}
              format={format === "enhanced-html" ? "html" : format}
            />
            
            {format === "enhanced-html" && !isExporting && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <BookOpen className="h-4 w-4" />
                <span>Creates self-contained training module</span>
              </div>
            )}
          </div>
          
          {/* Progress or Error Display */}
          {isExporting && exportProgress && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">{exportProgress}</p>
            </div>
          )}
          
          {!isPreviewOpen && <PdfExportError error={displayError} />}
        </CardContent>
      </Card>
      
      {/* PDF Preview Dialog */}
      <PdfPreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        isExporting={isExporting}
        exportProgress={exportProgress}
        pdfPreviewUrl={pdfPreviewUrl}
        exportError={displayError}
      />
    </div>
  );
};

export default ExportManager;
