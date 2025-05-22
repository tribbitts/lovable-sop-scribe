
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
      />
      
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

export default PdfExportManager;
