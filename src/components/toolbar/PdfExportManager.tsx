
import { useSopContext } from "@/context/SopContext";
import { usePdfExport } from "@/hooks/usePdfExport";
import PreviewButton from "./PreviewButton";
import ExportButton from "./ExportButton";
import PdfPreviewDialog from "./PdfPreviewDialog";
import PdfExportError from "./PdfExportError";

const PdfExportManager = () => {
  const { sopDocument } = useSopContext();
  const {
    isExporting,
    exportProgress,
    pdfPreviewUrl,
    exportError,
    isPreviewOpen,
    setIsPreviewOpen,
    handleExport,
    handlePreview
  } = usePdfExport();
  
  const onExport = () => handleExport(sopDocument);
  const onPreview = () => handlePreview(sopDocument);
  
  // Convert exportError to string safely with proper null checking
  const displayError = exportError === null ? null : (
    typeof exportError === 'object' && exportError !== null && 'message' in exportError 
      ? String(exportError.message)
      : String(exportError)
  );
  
  return (
    <div className="flex flex-wrap gap-2">
      <PreviewButton 
        onClick={onPreview} 
        disabled={sopDocument.steps.length === 0} 
        isExporting={isExporting}
        exportProgress={exportProgress}
      />
      
      <ExportButton 
        onClick={onExport} 
        isExporting={isExporting} 
        exportProgress={exportProgress} 
        disabled={sopDocument.steps.length === 0}
        format="pdf"
      />
      
      <PdfPreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        isExporting={isExporting}
        exportProgress={exportProgress}
        pdfPreviewUrl={pdfPreviewUrl}
        exportError={displayError}
      />
      
      {!isPreviewOpen && <PdfExportError error={displayError} />}
    </div>
  );
};

export default PdfExportManager;
