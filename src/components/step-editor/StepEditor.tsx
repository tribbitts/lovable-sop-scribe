
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSopContext } from "@/context/SopContext";
import { SopStep } from "@/types/sop";
import { toast } from "@/hooks/use-toast";
import StepHeader from "./StepHeader";
import ScreenshotUploader from "./ScreenshotUploader";
import ScreenshotEditor from "./ScreenshotEditor";
import CalloutEditor from "./CalloutEditor";

interface StepEditorProps {
  step: SopStep;
  index: number;
}

const StepEditor: React.FC<StepEditorProps> = ({ step, index }) => {
  const {
    updateStep,
    moveStepUp,
    moveStepDown,
    deleteStep,
    setStepScreenshot,
    addCallout,
    deleteCallout,
  } = useSopContext();

  const [isEditingCallouts, setIsEditingCallouts] = useState(false);
  const [calloutColor, setCalloutColor] = useState<string>("#FF719A");
  const [showCalloutCursor, setShowCalloutCursor] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

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

  const handleScreenshotMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingCallouts || !e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCursorPosition({ x, y });
  };

  const handleScreenshotMouseEnter = () => {
    if (isEditingCallouts) {
      setShowCalloutCursor(true);
    }
  };

  const handleScreenshotMouseLeave = () => {
    setShowCalloutCursor(false);
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

  const toggleEditMode = () => {
    setIsEditingCallouts(!isEditingCallouts);
    if (!isEditingCallouts) {
      toast({
        title: "Editing Mode Enabled",
        description: "Click on the image to add callout markers",
      });
    }
  };

  const handleDeleteStep = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this step?"
    );
    if (confirmDelete) deleteStep(step.id);
  };

  return (
    <Card className="bg-[#1E1E1E] border-zinc-800 shadow-lg rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <StepHeader
          index={index}
          onMoveUp={() => moveStepUp(step.id)}
          onMoveDown={() => moveStepDown(step.id)}
          onDelete={handleDeleteStep}
        />

        <div className="space-y-6">
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

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-zinc-300 font-medium">Screenshot*</Label>
              {step.screenshot && (
                <Button
                  size="sm"
                  variant="outline"
                  className={`text-xs border-zinc-700 hover:bg-zinc-800 ${
                    isEditingCallouts
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-300"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default StepEditor;
