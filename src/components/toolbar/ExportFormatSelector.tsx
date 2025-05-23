
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ExportFormat } from "@/types/sop";
import { useSubscription } from "@/context/SubscriptionContext";
import { Badge } from "@/components/ui/badge";

interface ExportFormatSelectorProps {
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
}

const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({
  format,
  onFormatChange,
}) => {
  const { tier, isAdmin } = useSubscription();
  const canUseHtml = isAdmin || tier === "pro-html" || tier === "pro-complete";
  const canUsePdf = isAdmin || tier === "pro-pdf" || tier === "pro-complete" || tier === "free";

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-3 text-zinc-300">Export Format</h3>
      <RadioGroup
        value={format}
        onValueChange={(value) => onFormatChange(value as ExportFormat)}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pdf" id="pdf-format" disabled={!canUsePdf} />
          <Label
            htmlFor="pdf-format"
            className={`flex items-center ${!canUsePdf ? "text-zinc-500" : "text-zinc-300"}`}
          >
            PDF Document
            {tier === "free" && !isAdmin && (
              <Badge variant="outline" className="ml-2 text-xs bg-zinc-800 text-zinc-400 border-zinc-700">
                1 per day
              </Badge>
            )}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="html" id="html-format" disabled={!canUseHtml} />
          <Label
            htmlFor="html-format"
            className={`flex items-center ${!canUseHtml ? "text-zinc-500" : "text-zinc-300"}`}
          >
            Interactive HTML
            {!canUseHtml && (
              <Badge variant="outline" className="ml-2 text-xs bg-zinc-800 text-zinc-400 border-zinc-700">
                Pro HTML required
              </Badge>
            )}
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ExportFormatSelector;
