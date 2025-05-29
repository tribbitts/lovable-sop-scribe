
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfExportErrorProps {
  error: string | null;
}

const PdfExportError = ({ error }: PdfExportErrorProps) => {
  if (!error) return null;
  
  const isPdfLimitError = error.toLowerCase().includes("daily limit") || 
                           error.toLowerCase().includes("limit reached");
  
  const handleUpgradeClick = () => {
    // If on home page anchor to pricing, otherwise navigate to home page
    if (window.location.pathname.includes('/app')) {
      window.location.href = '/#pricing';
    } else {
      document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <Alert variant="destructive" className="w-full mt-2">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-sm flex-1">
        {error}
        {isPdfLimitError && (
          <div className="mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white text-destructive hover:bg-gray-100"
              onClick={handleUpgradeClick}
            >
              Upgrade to Pro
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default PdfExportError;
