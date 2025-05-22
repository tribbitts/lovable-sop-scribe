
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "@/components/MotionWrapper";

interface CalloutEditorProps {
  stepId: string;
  calloutColor: string;
  setCalloutColor: (color: string) => void;
}

const CalloutEditor: React.FC<CalloutEditorProps> = ({
  stepId,
  calloutColor,
  setCalloutColor,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2 items-center">
          <Label
            htmlFor={`callout-color-${stepId}`}
            className="text-sm text-zinc-300"
          >
            Callout Color:
          </Label>
          <Input
            id={`callout-color-${stepId}`}
            type="color"
            value={calloutColor}
            onChange={(e) => setCalloutColor(e.target.value)}
            className="w-10 h-8 p-1 bg-zinc-800 border-zinc-700"
          />
        </div>

        <p className="text-xs text-zinc-400 flex-1">
          Move the cursor over the image and click to add a callout marker
        </p>
      </div>
    </motion.div>
  );
};

export default CalloutEditor;
