import { Button } from "@/components/ui/button";
import { Lock, FileText, Code, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { ExportFormat } from "@/types/sop";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExportButtonProps {
  onClick: () => void;
  isExporting: boolean;
  exportProgress: string | null;
  disabled: boolean;
  format: ExportFormat;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  isExporting,
  exportProgress,
  disabled,
  format,
}) => {
  const { user } = useAuth();
  const { canGeneratePdf, canUseHtmlExport, isAdmin } = useSubscription();
  
  const isSuperUser = user?.email === 'tribbit@tribbit.gg';
  
  const canExport = format === "pdf" 
    ? (canGeneratePdf || isAdmin || isSuperUser)
    : (canUseHtmlExport || isAdmin || isSuperUser);

  const getButtonText = () => {
    if (isExporting && exportProgress) {
      return exportProgress;
    }
    
    if (format === "pdf") {
      return "Export PDF";
    } else {
      return "Export HTML";
    }
  };

  const getIcon = () => {
    if (isExporting) {
      return <Download className="h-4 w-4 mr-2 animate-spin" />;
    }
    
    if (!canExport) {
      return <Lock className="h-4 w-4 mr-2" />;
    }
    
    return format === "pdf" 
      ? <FileText className="h-4 w-4 mr-2" />
      : <Code className="h-4 w-4 mr-2" />;
  };

  const getTooltipContent = () => {
    if (!canExport) {
      return format === "pdf" 
        ? "PDF export requires a Pro subscription"
        : "HTML export requires a Pro HTML subscription";
    }
    
    if (format === "html") {
      return "Creates a standalone SOP file with embedded screenshots and interactive features";
    }
    
    return `Export your SOP as a ${format.toUpperCase()} file`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            disabled={disabled || !canExport || isExporting}
            variant={canExport ? "default" : "secondary"}
            size="sm"
            className={`min-w-[120px] ${
              canExport 
                ? "bg-[#007AFF] hover:bg-[#0069D9] text-white" 
                : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
            }`}
          >
            {getIcon()}
            {getButtonText()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-[250px]">{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ExportButton;
