
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PdfPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isExporting: boolean;
  exportProgress: string | null;
  pdfPreviewUrl: string | null;
  exportError: string | null;
}

const PdfPreviewDialog = ({
  isOpen,
  onOpenChange,
  isExporting,
  exportProgress,
  pdfPreviewUrl,
  exportError
}: PdfPreviewDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-4xl w-[90vw] h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-white">PDF Preview</DialogTitle>
        </DialogHeader>
        <div className="w-full h-full overflow-hidden rounded-lg mt-4">
          {isExporting && exportProgress && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 p-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007AFF] mb-4"></div>
              <p className="text-white text-lg">{exportProgress}</p>
            </div>
          )}
          {!isExporting && pdfPreviewUrl && (
            <iframe
              src={pdfPreviewUrl}
              className="w-full h-full border-0 rounded"
              title="PDF Preview"
            />
          )}
          {!isExporting && !pdfPreviewUrl && exportError && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-red-400 mb-2">PDF Generation Failed</h3>
              <p className="text-red-400 mb-4">Error: {exportError}</p>
              <Alert variant="destructive" className="max-w-md">
                <AlertTitle>Troubleshooting Tips</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1 mt-2">
                    <li>Check that all images are valid and properly formatted</li>
                    <li>Try removing complex images or screenshots</li>
                    <li>Make sure all steps have descriptions</li>
                    <li>Try refreshing the browser and trying again</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfPreviewDialog;
