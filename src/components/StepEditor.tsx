
import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSopContext } from "@/context/SopContext";
import { SopStep, Callout } from "@/types/sop";
import { ArrowDown, ArrowUp, X, Circle, ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "@/components/MotionWrapper";

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
    updateCallout,
    deleteCallout,
  } = useSopContext();

  const [isEditingCallouts, setIsEditingCallouts] = useState(false);
  const [calloutColor, setCalloutColor] = useState<string>("#FF719A");
  const [showCalloutCursor, setShowCalloutCursor] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  const screenshotRef = useRef<HTMLDivElement>(null);

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

  const handleScreenshotMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingCallouts || !screenshotRef.current) return;
    
    const rect = screenshotRef.current.getBoundingClientRect();
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
    if (!step.screenshot || !screenshotRef.current || !isEditingCallouts) return;

    const rect = screenshotRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Fixed size of 8% for all callouts (circle)
    const calloutSize = 8;

    addCallout(step.id, {
      shape: "circle",
      color: calloutColor,
      x: Math.max(0, Math.min(100 - calloutSize, x - calloutSize/2)),
      y: Math.max(0, Math.min(100 - calloutSize, y - calloutSize/2)),
      width: calloutSize,
      height: calloutSize,
    });

    toast({
      title: "Callout Added",
      description: "Click on the callout to remove it if needed"
    });
  };

  const toggleEditMode = () => {
    setIsEditingCallouts(!isEditingCallouts);
    if (!isEditingCallouts) {
      toast({
        title: "Editing Mode Enabled",
        description: "Click on the image to add callout markers"
      });
    }
  };

  return (
    <Card className="bg-[#1E1E1E] border-zinc-800 shadow-lg rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-medium text-white flex items-center">
            <span className="bg-[#007AFF] text-white rounded-full h-8 w-8 inline-flex items-center justify-center mr-3">
              {index + 1}
            </span>
            Step {index + 1}
          </h3>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => moveStepUp(step.id)}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => moveStepDown(step.id)}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                const confirmDelete = window.confirm("Are you sure you want to delete this step?");
                if (confirmDelete) deleteStep(step.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

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
                  className={`text-xs border-zinc-700 hover:bg-zinc-800 ${isEditingCallouts ? 'bg-zinc-700 text-white' : 'text-zinc-300'}`}
                  onClick={toggleEditMode}
                >
                  {isEditingCallouts ? 'Done Editing' : 'Add Callouts'}
                </Button>
              )}
            </div>
            
            {!step.screenshot ? (
              <div className="bg-zinc-800 border border-dashed border-zinc-700 rounded-xl p-12 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <ImagePlus className="h-10 w-10 text-zinc-500" />
                  <div className="space-y-2">
                    <h3 className="text-zinc-300 font-medium text-lg">Add Screenshot</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                      Upload a screenshot to illustrate this step
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 relative border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Upload Image
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleScreenshotUpload}
                    />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {isEditingCallouts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex gap-2 items-center">
                        <Label htmlFor={`callout-color-${step.id}`} className="text-sm text-zinc-300">
                          Callout Color:
                        </Label>
                        <Input
                          id={`callout-color-${step.id}`}
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
                )}
                
                <div className="relative">
                  <div className="absolute right-3 top-3 z-10 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-zinc-800/80 backdrop-blur-sm border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                      onClick={() => setStepScreenshot(step.id, "")}
                    >
                      Replace
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleScreenshotUpload}
                      />
                    </Button>
                  </div>

                  <div 
                    className={`relative border rounded-lg shadow-md overflow-hidden transition-all ${isEditingCallouts ? 'border-[#007AFF]' : 'border-zinc-700'}`}
                  >
                    <div
                      ref={screenshotRef}
                      className={`relative ${isEditingCallouts ? 'cursor-none' : 'cursor-default'}`}
                      onClick={handleScreenshotClick}
                      onMouseMove={handleScreenshotMouseMove}
                      onMouseEnter={handleScreenshotMouseEnter}
                      onMouseLeave={handleScreenshotMouseLeave}
                    >
                      <img
                        src={step.screenshot.dataUrl}
                        alt={`Screenshot for step ${index + 1}`}
                        className="w-full h-auto"
                      />

                      {/* Custom cursor when in editing mode */}
                      {showCalloutCursor && (
                        <div
                          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-10"
                          style={{
                            left: `${cursorPosition.x}%`,
                            top: `${cursorPosition.y}%`,
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: `2px solid ${calloutColor}`,
                            boxShadow: `0 0 10px ${calloutColor}80`,
                            backgroundColor: `${calloutColor}20`,
                          }}
                        />
                      )}

                      {step.screenshot.callouts.map((callout) => (
                        <div
                          key={callout.id}
                          style={{
                            position: "absolute",
                            left: `${callout.x}%`,
                            top: `${callout.y}%`,
                            width: `${callout.width}%`,
                            height: `${callout.height}%`,
                            borderRadius: "50%",
                            border: `3px solid ${callout.color}`,
                            boxShadow: `0 0 8px ${callout.color}80`,
                            backgroundColor: `${callout.color}20`,
                            cursor: isEditingCallouts ? "pointer" : "default",
                          }}
                          onClick={(e) => {
                            if (isEditingCallouts) {
                              e.stopPropagation();
                              deleteCallout(step.id, callout.id);
                            }
                          }}
                        />
                      ))}
                    </div>
                    {isEditingCallouts && (
                      <div className="bg-zinc-800 p-2 text-xs text-center text-zinc-400">
                        Click to place a callout. Click on an existing callout to remove it.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepEditor;
