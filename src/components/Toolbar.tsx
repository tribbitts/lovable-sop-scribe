
import JsonDialog from "@/components/toolbar/JsonDialog";
import PdfExportManager from "@/components/toolbar/PdfExportManager";
import { useSubscription } from "@/context/SubscriptionContext";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

const Toolbar = () => {
  const { isAdmin } = useSubscription();
  
  return (
    <div className="flex flex-wrap justify-end items-center mb-6 gap-2">
      {isAdmin && (
        <Badge variant="outline" className="bg-amber-900/20 text-amber-500 border-amber-500 mr-auto flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Admin
        </Badge>
      )}
      <div className="flex flex-wrap gap-2">
        <JsonDialog />
        <PdfExportManager />
      </div>
    </div>
  );
};

export default Toolbar;
