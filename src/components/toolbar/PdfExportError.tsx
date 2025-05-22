
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PdfExportErrorProps {
  error: string | null;
}

const PdfExportError = ({ error }: PdfExportErrorProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="w-full mt-2">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-sm">
        {error}. Check browser console for details.
      </AlertDescription>
    </Alert>
  );
};

export default PdfExportError;
