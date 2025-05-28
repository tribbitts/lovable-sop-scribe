import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SopStep, ScreenshotData, CalloutShape } from "@/types/sop";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Image, Eye, EyeOff } from "lucide-react";
import { ScreenshotUpload } from "@/components/common/ScreenshotUpload";
import ScreenshotEditor from "./ScreenshotEditor";
import CalloutEditor from "./CalloutEditor";
import { v4 as uuidv4 } from "uuid";

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
  onStepChange?: (stepId: string, field: keyof SopStep, value: any) => void;
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
  onStepChange
}) => {
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(0);
  const [selectedCalloutTool, setSelectedCalloutTool] = useState<CalloutShape>("circle");
  const [showAllScreenshots, setShowAllScreenshots] = useState(false);

  // Get all screenshots (both legacy single screenshot and new multiple screenshots)
  const allScreenshots: ScreenshotData[] = [];
  
  // Add legacy screenshot if it exists
  if (step.screenshot) {
    allScreenshots.push(step.screenshot);
  }
  
  // Add new screenshots array
  if (step.screenshots && step.screenshots.length > 0) {
    allScreenshots.push(...step.screenshots);
  }

  const activeScreenshot = allScreenshots[activeScreenshotIndex];

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      console.log('FileReader result:', result ? 'Success' : 'Failed');
      
      if (!result) {
        toast({
          title: "Upload Failed",
          description: "Failed to read the image file",
          variant: "destructive"
        });
        return;
      }

      // Create new screenshot data
      const newScreenshot: ScreenshotData = {
        id: uuidv4(),
        dataUrl: result,
        callouts: [],
        title: `Screenshot ${allScreenshots.length + 1}`
      };

      console.log('Creating new screenshot:', newScreenshot.id);

      // If this is the first screenshot, set it as the main screenshot
      if (!step.screenshot && (!step.screenshots || step.screenshots.length === 0)) {
        console.log('Setting as main screenshot');
        if (onStepChange) {
          onStepChange(step.id, "screenshot", newScreenshot);
        }
        setActiveScreenshotIndex(0);
      } else {
        console.log('Adding to screenshots array');
        // Add to screenshots array
        const updatedScreenshots = [...(step.screenshots || []), newScreenshot];
        if (onStepChange) {
          onStepChange(step.id, "screenshots", updatedScreenshots);
        }
        // Set active to the new screenshot
        setActiveScreenshotIndex(allScreenshots.length);
      }
      
      toast({
        title: "Screenshot Added",
        description: "New screenshot has been added to this step",
      });

      // Clear the input value so the same file can be uploaded again if needed
      e.target.value = '';
    };

    reader.onerror = () => {
      console.error('FileReader error:', reader.error);
      toast({
        title: "Upload Failed",
        description: "Failed to read the image file",
        variant: "destructive"
      });
    };

    console.log('Starting file read...');
    reader.readAsDataURL(file);
  };

  const handleUpdateScreenshot = (dataUrl: string) => {
    if (activeScreenshot) {
      const updatedScreenshot = { ...activeScreenshot, dataUrl };
      
      // Update the appropriate screenshot
      if (activeScreenshotIndex === 0 && step.screenshot && !step.screenshots?.length) {
        // Updating legacy screenshot
        if (onStepChange) {
          onStepChange(step.id, "screenshot", updatedScreenshot);
        }
      } else {
        // Updating in screenshots array
        const updatedScreenshots = [...(step.screenshots || [])];
        const arrayIndex = step.screenshot ? activeScreenshotIndex - 1 : activeScreenshotIndex;
        updatedScreenshots[arrayIndex] = updatedScreenshot;
        
        if (onStepChange) {
          onStepChange(step.id, "screenshots", updatedScreenshots);
        }
      }
    }
  };

  const handleDeleteScreenshot = (index: number) => {
    if (allScreenshots.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "Each step must have at least one screenshot",
        variant: "destructive"
      });
      return;
    }

    if (index === 0 && step.screenshot && !step.screenshots?.length) {
      // Deleting legacy screenshot
      if (onStepChange) {
        onStepChange(step.id, "screenshot", null);
      }
    } else {
      // Deleting from screenshots array
      const updatedScreenshots = [...(step.screenshots || [])];
      const arrayIndex = step.screenshot ? index - 1 : index;
      updatedScreenshots.splice(arrayIndex, 1);
      
      if (onStepChange) {
        onStepChange(step.id, "screenshots", updatedScreenshots);
      }
    }

    // Adjust active index
    if (activeScreenshotIndex >= index && activeScreenshotIndex > 0) {
      setActiveScreenshotIndex(activeScreenshotIndex - 1);
    }

    toast({
      title: "Screenshot Deleted",
      description: "Screenshot has been removed from this step",
    });
  };

  const handleScreenshotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeScreenshot || !isEditingCallouts) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Default dimensions based on callout type
    let width = 5;
    let height = 5;

    if (selectedCalloutTool === "rectangle") {
      width = 15;
      height = 10;
    } else if (selectedCalloutTool === "arrow") {
      width = 8;
      height = 8;
    }

    const calloutData = {
      shape: selectedCalloutTool,
      color: calloutColor,
      x: Math.max(width / 2, Math.min(100 - width / 2, x)),
      y: Math.max(height / 2, Math.min(100 - height / 2, y)),
      width,
      height,
      number: selectedCalloutTool === "number" ? (activeScreenshot.callouts.length + 1) : undefined,
    };

    // Add callout to active screenshot
    const updatedCallouts = [...activeScreenshot.callouts, { ...calloutData, id: uuidv4() }];
    const updatedScreenshot = { ...activeScreenshot, callouts: updatedCallouts };

    // Update the appropriate screenshot
    if (activeScreenshotIndex === 0 && step.screenshot && !step.screenshots?.length) {
      if (onStepChange) {
        onStepChange(step.id, "screenshot", updatedScreenshot);
      }
    } else {
      const updatedScreenshots = [...(step.screenshots || [])];
      const arrayIndex = step.screenshot ? activeScreenshotIndex - 1 : activeScreenshotIndex;
      updatedScreenshots[arrayIndex] = updatedScreenshot;
      
      if (onStepChange) {
        onStepChange(step.id, "screenshots", updatedScreenshots);
      }
    }

    toast({
      title: "Callout Added",
      description: "Click on the callout to remove it if needed",
    });
  };

  const handleCalloutConfigured = (config: {
    shape: CalloutShape;
    color: string;
    revealText?: string;
    text?: string;
  }) => {
    setSelectedCalloutTool(config.shape);
    setCalloutColor(config.color);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Label className="text-zinc-300 font-medium">Screenshots</Label>
          <Badge className="bg-blue-600 text-white text-xs">
            {allScreenshots.length} image{allScreenshots.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {allScreenshots.length > 1 && (
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

      {/* Screenshot tabs when multiple screenshots exist */}
      {allScreenshots.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allScreenshots.map((screenshot, index) => (
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

      {/* Callout editor when editing */}
      {isEditingCallouts && activeScreenshot && (
        <CalloutEditor
          stepId={step.id}
          calloutColor={calloutColor}
          setCalloutColor={setCalloutColor}
          selectedTool={selectedCalloutTool}
          onToolChange={setSelectedCalloutTool}
          onCalloutConfigured={handleCalloutConfigured}
        />
      )}

      {/* Screenshot display */}
      {showAllScreenshots ? (
        // Show all screenshots in a grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allScreenshots.map((screenshot, index) => (
            <div key={screenshot.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-zinc-400 text-sm">
                  {screenshot.title || `Screenshot ${index + 1}`}
                </Label>
                {allScreenshots.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteScreenshot(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <ScreenshotEditor
                stepId={step.id}
                screenshot={screenshot}
                isEditingCallouts={false}
                calloutColor={calloutColor}
                onScreenshotUpload={handleScreenshotUpload}
                onScreenshotClick={() => {}}
                onCalloutClick={() => {}}
                cursorPosition={cursorPosition}
                showCalloutCursor={false}
                handleScreenshotMouseMove={() => {}}
                handleScreenshotMouseEnter={() => {}}
                handleScreenshotMouseLeave={() => {}}
                onUpdateScreenshot={() => {}}
              />
            </div>
          ))}
        </div>
      ) : (
        // Show active screenshot
        <div className="space-y-3">
          {!activeScreenshot ? (
            <ScreenshotUpload 
              variant="dropzone"
              onUpload={(dataUrl, file) => {
                // Create new screenshot data
                const newScreenshot: ScreenshotData = {
                  id: uuidv4(),
                  dataUrl: dataUrl,
                  callouts: [],
                  title: `Screenshot ${allScreenshots.length + 1}`
                };

                // If this is the first screenshot, set it as the main screenshot
                if (!step.screenshot && (!step.screenshots || step.screenshots.length === 0)) {
                  if (onStepChange) {
                    onStepChange(step.id, "screenshot", newScreenshot);
                  }
                  setActiveScreenshotIndex(0);
                } else {
                  // Add to screenshots array
                  const updatedScreenshots = [...(step.screenshots || []), newScreenshot];
                  if (onStepChange) {
                    onStepChange(step.id, "screenshots", updatedScreenshots);
                  }
                  // Set active to the new screenshot
                  setActiveScreenshotIndex(allScreenshots.length);
                }
                
                toast({
                  title: "Screenshot Added",
                  description: "New screenshot has been added to this step",
                });
              }}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-zinc-400 text-sm">
                  {activeScreenshot.title || `Screenshot ${activeScreenshotIndex + 1}`}
                </Label>
                {allScreenshots.length > 1 && (
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

              <ScreenshotEditor
                stepId={step.id}
                screenshot={activeScreenshot}
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
      )}

      {/* Add more screenshots button */}
      {allScreenshots.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => document.getElementById(`screenshot-upload-${step.id}`)?.click()}
            className="text-zinc-300 border-zinc-700 hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Screenshot
          </Button>
          <input
            id={`screenshot-upload-${step.id}`}
            type="file"
            accept="image/*"
            onChange={handleScreenshotUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default StepScreenshot;
