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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Settings, Sparkles, Download, FileText } from "lucide-react";

// Extended format type
type ExtendedExportFormat = ExportFormat | "enhanced-html";

const ExportManager = () => {
  const { sopDocument } = useSopContext();
  const [showLegacyInterface, setShowLegacyInterface] = useState(false);
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
  
  // New comprehensive export handler
  const handleComprehensiveExport = (options: ExportOptions) => {
    console.log('📄 Comprehensive Export Started:', options);
    
    if (options.format === "pdf") {
      // PDF export only takes sopDocument parameter
      handlePdfExport(sopDocument);
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

  // Calculate some stats for the new interface
  const stepCount = sopDocument.steps.length;
  const sopTitle = sopDocument.title || "Untitled SOP";
  
  return (
    <div className="flex flex-col gap-6">
      {/* Toggle between interfaces for development */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Export SOP</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLegacyInterface(!showLegacyInterface)}
          className="border-zinc-600 text-zinc-300 text-xs"
        >
          {showLegacyInterface ? 'New Interface' : 'Legacy Mode'}
        </Button>
      </div>

      {showLegacyInterface ? (
        // Legacy Interface
        <>
          {/* Format Selection */}
          <Card className="bg-[#1E1E1E] border-zinc-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" />
                Export Settings (Legacy)
              </CardTitle>
            </CardHeader>
                         <CardContent className="space-y-4">
               <ExportFormatSelector 
                 format={format} 
                 onFormatChange={(newFormat) => setFormat(newFormat as ExtendedExportFormat)}
                 onExport={() => {}} // Dummy function for legacy mode
               />
              
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
        </>
      ) : (
        // New Comprehensive Interface
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
                  onClick={() => handleComprehensiveExport({
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
                    adminAccess: false
                  })}
                  disabled={isExporting || sopDocument.steps.length === 0}
                  className="border-zinc-600 text-zinc-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Quick PDF
                </Button>
              </div>
              
              <p className="text-xs text-zinc-400">
                Use "Quick PDF" for standard export with default settings, or use the format selector above for full customization.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
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
