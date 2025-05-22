
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SopStep } from "@/types/sop";

interface StepDescriptionProps {
  step: SopStep;
  updateStep: (id: string, description: string) => void;
}

const StepDescription: React.FC<StepDescriptionProps> = ({ step, updateStep }) => {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={`step-description-${step.id}`}
        className="text-zinc-300 font-medium"
      >
        Step Description*
      </Label>
      <Textarea
        id={`step-description-${step.id}`}
        value={step.description}
        onChange={(e) => updateStep(step.id, e.target.value)}
        placeholder="Describe what the user needs to do in this step..."
        className="h-24 bg-zinc-800 border-zinc-700 focus:border-[#007AFF] transition-colors text-white placeholder:text-zinc-500"
        required
      />
    </div>
  );
};

export default StepDescription;
