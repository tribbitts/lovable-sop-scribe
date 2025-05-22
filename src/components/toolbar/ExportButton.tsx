
import { Button } from "@/components/ui/button";
import { Lock, FileText, Code } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { ExportFormat } from "@/types/sop";

interface ExportButtonProps {
  onClick: () => void;
  isExporting: boolean;
  exportProgress: string | null;
  disabled: boolean;
  format: ExportFormat;
}

const ExportButton = ({ onClick, isExporting, exportProgress, disabled, format }: ExportButtonProps) => {
  const { user } = useAuth();
  const { canGeneratePdf, canUseHtmlExport, tier } = useSubscription();
  
  const canExport = format === "pdf" ? canGeneratePdf : canUseHtmlExport;
  const buttonText = format === "pdf" ? "Export as PDF" : "Export as HTML";
  const limitText = tier === "free" ? "Daily Limit Reached" : buttonText;

  return (
    <Button 
      onClick={onClick} 
      variant="default" 
      disabled={isExporting || disabled || !canExport}
      className={`${canExport ? 'bg-[#007AFF] hover:bg-[#0069D9]' : 'bg-zinc-700'} text-white shadow-md transition-all flex gap-2`}
    >
      {!canExport ? (
        <>
          <Lock className="h-4 w-4" />
          {limitText}
        </>
      ) : isExporting ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
          {exportProgress || `Creating ${format.toUpperCase()}...`}
        </>
      ) : (
        <>
          {format === "pdf" ? (
            <FileText className="h-4 w-4" />
          ) : (
            <Code className="h-4 w-4" />
          )}
          {buttonText}
        </>
      )}
    </Button>
  );
};

export default ExportButton;
