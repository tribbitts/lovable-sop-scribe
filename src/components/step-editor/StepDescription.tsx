
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SopStep } from "@/types/sop";
import { ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface StepDescriptionProps {
  step: SopStep;
  updateStep: (id: string, field: string, value: string) => void;
}

const StepDescription: React.FC<StepDescriptionProps> = ({ step, updateStep }) => {
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label
            htmlFor={`step-title-${step.id}`}
            className="text-zinc-300 font-medium"
          >
            Step Title
          </Label>
        </div>
        <Input
          id={`step-title-${step.id}`}
          value={step.title || ""}
          onChange={(e) => updateStep(step.id, "title", e.target.value)}
          placeholder="Enter a title for this step..."
          className="bg-zinc-800 border-zinc-700 focus:border-[#007AFF] transition-colors text-white placeholder:text-zinc-500"
        />
      </div>
      
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
          onChange={(e) => updateStep(step.id, "description", e.target.value)}
          placeholder="Describe what the user needs to do in this step..."
          className="h-24 bg-zinc-800 border-zinc-700 focus:border-[#007AFF] transition-colors text-white placeholder:text-zinc-500"
          required
        />
      </div>
      
      <div className="border-t border-zinc-700 pt-3">
        <Button
          variant="ghost"
          className="flex items-center justify-between text-zinc-400 hover:text-white hover:bg-zinc-800 w-full"
          onClick={() => setShowAdvancedFields(!showAdvancedFields)}
        >
          <span>Advanced Fields</span>
          {showAdvancedFields ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {showAdvancedFields && (
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label
              htmlFor={`step-detailed-instructions-${step.id}`}
              className="text-zinc-300 font-medium"
            >
              Detailed Instructions
            </Label>
            <Textarea
              id={`step-detailed-instructions-${step.id}`}
              value={step.detailedInstructions || ""}
              onChange={(e) => updateStep(step.id, "detailedInstructions", e.target.value)}
              placeholder="Provide more detailed instructions for this step..."
              className="h-24 bg-zinc-800 border-zinc-700 focus:border-[#007AFF] transition-colors text-white placeholder:text-zinc-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label
              htmlFor={`step-notes-${step.id}`}
              className="text-zinc-300 font-medium"
            >
              Notes
            </Label>
            <Textarea
              id={`step-notes-${step.id}`}
              value={step.notes || ""}
              onChange={(e) => updateStep(step.id, "notes", e.target.value)}
              placeholder="Add any additional notes or tips..."
              className="h-20 bg-zinc-800 border-zinc-700 focus:border-[#007AFF] transition-colors text-white placeholder:text-zinc-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label
              htmlFor={`step-file-link-${step.id}`}
              className="text-zinc-300 font-medium flex items-center"
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              File or Resource Link
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <Input
                  id={`step-file-link-${step.id}`}
                  value={step.fileLink || ""}
                  onChange={(e) => updateStep(step.id, "fileLink", e.target.value)}
                  placeholder="https://..."
                  className="bg-zinc-800 border-zinc-700 focus:border-[#007AFF] transition-colors text-white placeholder:text-zinc-500"
                />
              </div>
              <div>
                <Input
                  id={`step-file-link-text-${step.id}`}
                  value={step.fileLinkText || ""}
                  onChange={(e) => updateStep(step.id, "fileLinkText", e.target.value)}
                  placeholder="Link Text"
                  className="bg-zinc-800 border-zinc-700 focus:border-[#007AFF] transition-colors text-white placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepDescription;
