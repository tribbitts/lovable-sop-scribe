
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSopContext } from "@/context/SopContext";
import { SopStep } from "@/types/sop";
import StepHeader from "./StepHeader";
import StepDescription from "./StepDescription";
import StepScreenshot from "./StepScreenshot";
import { useCalloutEditor } from "./hooks/useCalloutEditor";

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

  const {
    isEditingCallouts,
    calloutColor,
    setCalloutColor,
    showCalloutCursor,
    cursorPosition,
    handleScreenshotMouseMove,
    handleScreenshotMouseEnter,
    handleScreenshotMouseLeave,
    toggleEditMode
  } = useCalloutEditor();

  const handleDeleteStep = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this step?"
    );
    if (confirmDelete) deleteStep(step.id);
  };

  // Adapter function to maintain compatibility with existing code
  const updateStepAdapter = (id: string, field: string, value: any) => {
    if (field === "description") {
      updateStep(id, "description", value);
    } else if (field === "title") {
      updateStep(id, "title", value);
    } else if (field === "detailedInstructions") {
      updateStep(id, "detailedInstructions", value);
    } else if (field === "notes") {
      updateStep(id, "notes", value);
    } else if (field === "fileLink") {
      updateStep(id, "fileLink", value);
    } else if (field === "fileLinkText") {
      updateStep(id, "fileLinkText", value);
    } else {
      // For other fields, try to cast safely
      updateStep(id, field as keyof SopStep, value);
    }
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
          <StepDescription 
            step={step} 
            updateStep={updateStepAdapter} 
          />

          <StepScreenshot
            step={step}
            isEditingCallouts={isEditingCallouts}
            calloutColor={calloutColor}
            setCalloutColor={setCalloutColor}
            showCalloutCursor={showCalloutCursor}
            cursorPosition={cursorPosition}
            handleScreenshotMouseMove={handleScreenshotMouseMove}
            handleScreenshotMouseEnter={handleScreenshotMouseEnter}
            handleScreenshotMouseLeave={handleScreenshotMouseLeave}
            toggleEditMode={toggleEditMode}
            setStepScreenshot={setStepScreenshot}
            addCallout={addCallout}
            deleteCallout={deleteCallout}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StepEditor;
