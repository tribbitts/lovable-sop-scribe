
import { Button } from "@/components/ui/button";
import { Lock, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";

interface ExportButtonProps {
  onClick: () => void;
  isExporting: boolean;
  exportProgress: string | null;
  disabled: boolean;
}

const ExportButton = ({ onClick, isExporting, exportProgress, disabled }: ExportButtonProps) => {
  const { user } = useAuth();
  const { canGeneratePdf, tier } = useSubscription();

  return (
    <Button 
      onClick={onClick} 
      variant="default" 
      disabled={isExporting || disabled || !canGeneratePdf}
      className={`${canGeneratePdf ? 'bg-[#007AFF] hover:bg-[#0069D9]' : 'bg-zinc-700'} text-white shadow-md transition-all flex gap-2`}
    >
      {!canGeneratePdf ? (
        <>
          <Lock className="h-4 w-4" />
          {tier === "free" ? "Daily Limit Reached" : "Export as PDF"}
        </>
      ) : isExporting ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
          {exportProgress || "Creating PDF..."}
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Export as PDF
        </>
      )}
    </Button>
  );
};

export default ExportButton;
