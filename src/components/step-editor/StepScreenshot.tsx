
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SopStep } from "@/types/sop";
import { toast } from "@/hooks/use-toast";
import ScreenshotUploader from "./ScreenshotUploader";
import ScreenshotEditor from "./ScreenshotEditor";
import CalloutEditor from "./CalloutEditor";

interface StepScreenshotProps {
  step: SopStep;
  isEditingCallouts: boolean;
  calloutColor: string;
  setCalloutColor: (color: string) => void;
  showCalloutCursor: boolean;
  cursorPosition: { x: number; y: number };
  handleScreenshotMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleScreenshotMouseEnter: () => void;
  handleScreenshotMouseLeave: () => void;
  toggleEditMode: () => void;
  setStepScreenshot: (id: string, dataUrl: string) => void;
  addCallout: (stepId: string, callout: Omit<any, "id">) => void;
  deleteCallout: (stepId: string, calloutId: string) => void;
}

const StepScreenshot: React.FC<StepScreenshotProps> = ({
  step,
  isEditingCallouts,
  calloutColor,
  setCalloutColor,
  showCalloutCursor,
  cursorPosition,
  handleScreenshotMouseMove,
  handleScreenshotMouseEnter,
  handleScreenshotMouseLeave,
  toggleEditMode,
  setStepScreenshot,
  addCallout,
  deleteCallout,
}) => {
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStepScreenshot(step.id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateScreenshot = (dataUrl: string) => {
    setStepScreenshot(step.id, dataUrl);
  };

  const handleScreenshotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!step.screenshot || !isEditingCallouts) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Fixed size of 8% for all callouts (circle)
    const calloutSize = 8;

    addCallout(step.id, {
      shape: "circle",
      color: calloutColor,
      x: Math.max(0, Math.min(100 - calloutSize, x - calloutSize / 2)),
      y: Math.max(0, Math.min(100 - calloutSize, y - calloutSize / 2)),
      width: calloutSize,
      height: calloutSize,
    });

    toast({
      title: "Callout Added",
      description: "Click on the callout to remove it if needed",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-zinc-300 font-medium">Screenshot*</Label>
        {step.screenshot && (
          <Button
            size="sm"
            variant="outline"
            className={`text-xs border-zinc-700 hover:bg-zinc-800 ${
              isEditingCallouts ? "bg-zinc-700 text-white" : "text-zinc-300"
            }`}
            onClick={toggleEditMode}
          >
            {isEditingCallouts ? "Done Editing" : "Add Callouts"}
          </Button>
        )}
      </div>

      {!step.screenshot ? (
        <ScreenshotUploader onScreenshotUpload={handleScreenshotUpload} />
      ) : (
        <div className="space-y-4">
          {isEditingCallouts && (
            <CalloutEditor
              stepId={step.id}
              calloutColor={calloutColor}
              setCalloutColor={setCalloutColor}
            />
          )}

          <ScreenshotEditor
            stepId={step.id}
            screenshot={step.screenshot}
            isEditingCallouts={isEditingCallouts}
            calloutColor={calloutColor}
            onScreenshotUpload={handleScreenshotUpload}
            onScreenshotClick={handleScreenshotClick}
            onCalloutClick={(calloutId) => deleteCallout(step.id, calloutId)}
            cursorPosition={cursorPosition}
            showCalloutCursor={showCalloutCursor}
            handleScreenshotMouseMove={handleScreenshotMouseMove}
            handleScreenshotMouseEnter={handleScreenshotMouseEnter}
            handleScreenshotMouseLeave={handleScreenshotMouseLeave}
            onUpdateScreenshot={handleUpdateScreenshot}
          />
        </div>
      )}
    </div>
  );
};

export default StepScreenshot;
