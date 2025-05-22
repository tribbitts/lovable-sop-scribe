
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

const ExportManager = () => {
  const { sopDocument } = useSopContext();
  const [format, setFormat] = useState<ExportFormat>("pdf");
  
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
    handleExportHtml
  } = useHtmlExport();
  
  const isExporting = isPdfExporting || isHtmlExporting;
  const exportProgress = pdfExportProgress || htmlExportProgress;
  const exportError = pdfExportError || htmlExportError;
  
  const onExport = () => {
    if (format === "pdf") {
      handlePdfExport(sopDocument);
    } else if (format === "html") {
      handleExportHtml(sopDocument);
    }
  };
  
  const onPreview = () => handlePreview(sopDocument);
  
  return (
    <div className="flex flex-col gap-2">
      <ExportFormatSelector format={format} onFormatChange={setFormat} />
      
      <div className="flex flex-wrap gap-2">
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
          format={format}
        />
      </div>
      
      <PdfPreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        isExporting={isExporting}
        exportProgress={exportProgress}
        pdfPreviewUrl={pdfPreviewUrl}
        exportError={exportError}
      />
      
      {!isPreviewOpen && <PdfExportError error={exportError} />}
    </div>
  );
};

export default ExportManager;
