
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SopStep, ScreenshotData, Callout } from "@/types/sop";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Image, Eye, EyeOff, Crop } from "lucide-react";
import { ScreenshotUpload } from "@/components/common/ScreenshotUpload";
import CalloutOverlay from "./CalloutOverlay";
import CropDialog from "./crop/CropDialog";
import { useScreenshotManager } from "@/hooks/useScreenshotManager";

interface StepScreenshotProps {
  step: SopStep;
  isEditingCallouts: boolean;
  toggleEditMode: () => void;
  onStepChange?: (stepId: string, field: keyof SopStep, value: any) => void;
}

const StepScreenshot: React.FC<StepScreenshotProps> = ({
  step,
  isEditingCallouts,
  toggleEditMode,
  onStepChange
}) => {
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(0);
  const [showAllScreenshots, setShowAllScreenshots] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

  // Use the simplified screenshot manager
  const {
    screenshots,
    hasScreenshots,
    addScreenshot,
    updateScreenshot,
    deleteScreenshot
  } = useScreenshotManager({
    stepId: step.id,
    step,
    onStepChange
  });

  const activeScreenshot = screenshots[activeScreenshotIndex];

  const handleDeleteScreenshot = (index: number) => {
    if (screenshots.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "Each step must have at least one screenshot",
        variant: "destructive"
      });
      return;
    }

    const screenshotToDelete = screenshots[index];
    if (screenshotToDelete) {
      deleteScreenshot(screenshotToDelete.id);
      
      if (activeScreenshotIndex >= index && activeScreenshotIndex > 0) {
        setActiveScreenshotIndex(activeScreenshotIndex - 1);
      }

      toast({
        title: "Screenshot Deleted",
        description: "Screenshot has been removed from this step",
      });
    }
  };

  const handleUpdateScreenshot = (dataUrl: string) => {
    if (activeScreenshot) {
      updateScreenshot(activeScreenshot.id, { dataUrl });
    }
  };

  const handleCalloutAdd = (callout: Omit<Callout, "id">) => {
    if (!activeScreenshot || !onStepChange) return;
    
    const newCallout = { ...callout, id: crypto.randomUUID() };
    const updatedCallouts = [...activeScreenshot.callouts, newCallout];
    updateScreenshot(activeScreenshot.id, { callouts: updatedCallouts });
  };

  const handleCalloutUpdate = (callout: Callout) => {
    if (!activeScreenshot) return;
    
    const updatedCallouts = activeScreenshot.callouts.map(c => 
      c.id === callout.id ? callout : c
    );
    updateScreenshot(activeScreenshot.id, { callouts: updatedCallouts });
  };

  const handleCalloutDelete = (calloutId: string) => {
    if (!activeScreenshot) return;
    
    const updatedCallouts = activeScreenshot.callouts.filter(c => c.id !== calloutId);
    updateScreenshot(activeScreenshot.id, { callouts: updatedCallouts });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Label className="text-zinc-300 font-medium">Screenshots</Label>
          <Badge className="bg-blue-600 text-white text-xs">
            {screenshots.length} image{screenshots.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {screenshots.length > 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAllScreenshots(!showAllScreenshots)}
              className="text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              {showAllScreenshots ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {showAllScreenshots ? "Hide All" : "Show All"}
            </Button>
          )}
          
          {activeScreenshot && (
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
      </div>

      {/* Screenshot tabs */}
      {screenshots.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {screenshots.map((screenshot, index) => (
            <button
              key={screenshot.id}
              onClick={() => setActiveScreenshotIndex(index)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs transition-all ${
                activeScreenshotIndex === index
                  ? "border-blue-500 bg-blue-500/20 text-blue-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50"
              }`}
            >
              <Image className="h-3 w-3 mr-1 inline" />
              {screenshot.title || `Screenshot ${index + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Main screenshot display */}
      <div className="space-y-3">
        {!hasScreenshots ? (
          <ScreenshotUpload 
            variant="dropzone"
            onUpload={(dataUrl, file) => {
              addScreenshot(dataUrl, file.name.split('.')[0]);
              toast({
                title: "Screenshot Added",
                description: "New screenshot has been added to this step",
              });
            }}
          />
        ) : (
          <div className="space-y-3">
            {activeScreenshot && (
              <>
                <div className="flex justify-between items-center">
                  <Label className="text-zinc-400 text-sm">
                    {activeScreenshot.title || `Screenshot ${activeScreenshotIndex + 1}`}
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-zinc-300 border-zinc-700 hover:bg-zinc-800 flex items-center gap-1"
                      onClick={() => setIsCropDialogOpen(true)}
                    >
                      <Crop className="h-4 w-4" />
                      Crop
                    </Button>
                    {screenshots.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteScreenshot(activeScreenshotIndex)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>

                <div className="relative border rounded-lg shadow-md overflow-hidden border-zinc-700">
                  <img
                    src={activeScreenshot.dataUrl}
                    alt={activeScreenshot.title || `Screenshot ${activeScreenshotIndex + 1}`}
                    className="w-full h-auto"
                  />
                  
                  <div className="absolute inset-0">
                    <CalloutOverlay
                      screenshot={activeScreenshot}
                      isEditing={isEditingCallouts}
                      onCalloutAdd={handleCalloutAdd}
                      onCalloutUpdate={handleCalloutUpdate}
                      onCalloutDelete={handleCalloutDelete}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add more screenshots button */}
      {hasScreenshots && (
        <div className="flex justify-center pt-2">
          <ScreenshotUpload 
            variant="button"
            onUpload={(dataUrl, file) => {
              addScreenshot(dataUrl, file.name.split('.')[0]);
              setActiveScreenshotIndex(screenshots.length);
              toast({
                title: "Screenshot Added",
                description: "New screenshot has been added to this step",
              });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Screenshot
          </ScreenshotUpload>
        </div>
      )}
      
      <CropDialog
        open={isCropDialogOpen}
        onOpenChange={setIsCropDialogOpen}
        imageUrl={activeScreenshot?.dataUrl || ''}
        onCropComplete={handleUpdateScreenshot}
      />
    </div>
  );
};

export default StepScreenshot;
