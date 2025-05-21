
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface PreviewButtonProps {
  onClick: () => void;
  disabled: boolean;
  isExporting: boolean;
  exportProgress: string | null;
}

const PreviewButton = ({ onClick, disabled, isExporting, exportProgress }: PreviewButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      disabled={disabled || isExporting}
      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white flex gap-2"
    >
      <Eye className="h-4 w-4" /> {isExporting && exportProgress === "Preparing preview..." ? "Creating Preview..." : "Preview"}
    </Button>
  );
};

export default PreviewButton;
