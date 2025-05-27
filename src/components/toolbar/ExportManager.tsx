import { useState } from "react";
import { useSopContext } from "@/context/SopContext";
import { usePdfExport } from "@/hooks/pdf-export";
import { useHtmlExport } from "@/hooks/useHtmlExport";
import { ExportFormat } from "@/types/sop";
import PreviewButton from "./PreviewButton";
import ExportButton from "./ExportButton";
import PdfPreviewDialog from "./PdfPreviewDialog";
import PdfExportError from "./PdfExportError";
import ExportFormatSelector, { ExportOptions } from "./ExportFormatSelector";
import HtmlExportOptions from "./HtmlExportOptions";
import EnhancedHtmlExportOptions, { EnhancedHtmlExportSettings } from "./EnhancedHtmlExportOptions";
import PdfExportOptions from "@/components/PdfExportOptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Settings, Sparkles, Download, FileText } from "lucide-react";

// Extended format type
type ExtendedExportFormat = ExportFormat | "enhanced-html";

const ExportManager = () => {
  const { sopDocument } = useSopContext();
  const [showLegacyInterface, setShowLegacyInterface] = useState(false);
  const [format, setFormat] = useState<ExtendedExportFormat>("pdf");
  const [showPdfExportOptions, setShowPdfExportOptions] = useState(false);
  
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
  
  // New comprehensive export handler
  const handleComprehensiveExport = (options: ExportOptions) => {
    console.log('📄 Comprehensive Export Started:', options);
    
    if (options.format === "pdf") {
      // Show PDF export options modal for user to choose between Standard and Demo-Style
      setShowPdfExportOptions(true);
    } else if (options.format === "html") {
      handleExportHtml(sopDocument, { 
        mode: exportMode
      });
    } else if (options.format === "training-module") {
      // Use enhanced HTML export for training module
      const mappedTheme = options.theme === 'brand' ? 'dark' : options.theme;
      handleExportHtml(sopDocument, { 
        mode: 'standalone',
        enhanced: true,
        enhancedOptions: {
          ...enhancedSettings,
          // Map the new options to enhanced settings
          theme: mappedTheme,
          lmsFeatures: {
            ...enhancedSettings.lmsFeatures,
            enableProgressTracking: options.trackingEnabled,
            enableNotes: true,
            enableBookmarks: true,
            enableSearch: true
          }
        }
      });
    } else if (options.format === "web-bundle") {
      handleExportHtml(sopDocument, { 
        mode: 'zip'
      });
    }
  };
  
  // Legacy export handler
  const onExport = () => {
    if (format === "pdf") {
      setShowPdfExportOptions(true);
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

  // Calculate some stats for the new interface
  const stepCount = sopDocument.steps.length;
  const sopTitle = sopDocument.title || "Untitled SOP";
  
  // Debug logging for interface detection
  console.log('🔍 ExportManager Debug:', {
    showLegacyInterface,
    sopTitle,
    stepCount,
    hasLegacyProps: !!(format && setFormat)
  });
  
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Export SOP</h2>
      </div>

      {/* Comprehensive Export Interface */}
        <div className="space-y-6">
          <ExportFormatSelector
            onExport={handleComprehensiveExport}
            isExporting={isExporting}
            sopTitle={sopTitle}
            stepCount={stepCount}
          />
          
          {/* Progress Display */}
          {isExporting && exportProgress && (
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-300">Exporting...</p>
                    <p className="text-xs text-blue-400">{exportProgress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Error Display */}
          {!isPreviewOpen && <PdfExportError error={displayError} />}
          
          {/* Quick Actions */}
          <Card className="border-zinc-700 bg-zinc-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <PreviewButton 
                  onClick={onPreview} 
                  disabled={sopDocument.steps.length === 0} 
                  isExporting={isExporting}
                  exportProgress={exportProgress}
                />
                
                <Button
                  variant="outline"
                  onClick={() => setShowPdfExportOptions(true)}
                  disabled={isExporting || sopDocument.steps.length === 0}
                  className="border-zinc-600 text-zinc-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
              
              <p className="text-xs text-zinc-400">
                Use "Export PDF" to choose between standard and demo-style PDF exports, or use the format selector above for other formats.
              </p>
            </CardContent>
          </Card>
        </div>
      
      {/* PDF Preview Dialog */}
      <PdfPreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        isExporting={isExporting}
        exportProgress={exportProgress}
        pdfPreviewUrl={pdfPreviewUrl}
        exportError={displayError}
      />
      
      {/* PDF Export Options Modal */}
      <Dialog open={showPdfExportOptions} onOpenChange={setShowPdfExportOptions}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">PDF Export Options</DialogTitle>
          </DialogHeader>
          <PdfExportOptions 
            sopDocument={sopDocument}
            onClose={() => setShowPdfExportOptions(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExportManager;
