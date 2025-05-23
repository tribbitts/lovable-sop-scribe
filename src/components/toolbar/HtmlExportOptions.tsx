import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info, FileText, Archive, Globe } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HtmlExportOptionsProps {
  exportMode: 'standalone' | 'zip';
  onExportModeChange: (mode: 'standalone' | 'zip') => void;
  disabled?: boolean;
}

const HtmlExportOptions: React.FC<HtmlExportOptionsProps> = ({
  exportMode,
  onExportModeChange,
  disabled = false
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-[#007AFF]" />
        <Label className="text-sm font-medium text-zinc-300">
          HTML Export Mode
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3 text-zinc-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">
                Choose how to package your HTML export
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <RadioGroup
        value={exportMode}
        onValueChange={(value) => onExportModeChange(value as 'standalone' | 'zip')}
        className="space-y-3"
        disabled={disabled}
      >
        {/* Standalone HTML Option */}
        <div className="flex items-start space-x-3 p-3 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors">
          <RadioGroupItem 
            value="standalone" 
            id="standalone-mode" 
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="standalone-mode"
                className="text-sm font-medium text-zinc-300 cursor-pointer"
              >
                <FileText className="h-4 w-4 inline mr-1" />
                Standalone HTML File
              </Label>
              <Badge variant="outline" className="text-xs bg-green-900/20 text-green-400 border-green-600">
                Recommended
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Single .html file with all screenshots embedded as Base64. 
              Works offline, no external dependencies, easy to share.
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <span>✓ Self-contained</span>
              <span>✓ Offline ready</span>
              <span>✓ Easy sharing</span>
            </div>
          </div>
        </div>

        {/* ZIP Package Option */}
        <div className="flex items-start space-x-3 p-3 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors">
          <RadioGroupItem 
            value="zip" 
            id="zip-mode" 
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="zip-mode"
                className="text-sm font-medium text-zinc-300 cursor-pointer"
              >
                <Archive className="h-4 w-4 inline mr-1" />
                ZIP Package
              </Label>
              <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-600">
                Classic
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              ZIP file containing HTML + separate image files. 
              Smaller file size, requires extraction to view.
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <span>✓ Smaller size</span>
              <span>✓ Separate assets</span>
              <span>⚠ Requires extraction</span>
            </div>
          </div>
        </div>
      </RadioGroup>
      
      {/* Additional Info */}
      <div className="mt-3 p-2 bg-zinc-800/50 border border-zinc-700/50 rounded text-xs text-zinc-500">
        <div className="flex items-start gap-2">
          <Info className="h-3 w-3 mt-0.5 text-[#007AFF] flex-shrink-0" />
          <div>
            {exportMode === 'standalone' ? (
              <span>
                <strong>Standalone mode:</strong> Screenshots with callouts are rendered directly into the images. 
                File size warning will appear if total size exceeds 20MB.
              </span>
            ) : (
              <span>
                <strong>ZIP mode:</strong> Original behavior with separate HTML and image files. 
                Callouts are positioned using CSS overlays.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlExportOptions; 