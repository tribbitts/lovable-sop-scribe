import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSopContext } from "@/context/SopContext";
import { SopStep, Callout, CalloutShape } from "@/types/sop";
import { ArrowDown, ArrowUp, X, Circle, Square, ImagePlus, Move } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "@/components/MotionWrapper";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter
} from "@/components/ui/drawer";

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

  const [activeCallout, setActiveCallout] = useState<string | null>(null);
  const [calloutColor, setCalloutColor] = useState<string>("#FF719A");
  const [calloutShape, setCalloutShape] = useState<CalloutShape>("circle");
  const [isEditingCallouts, setIsEditingCallouts] = useState(false);
  
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

  const handleScreenshotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!step.screenshot || !screenshotRef.current || !isEditingCallouts) return;

    const rect = screenshotRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Default sizes in percentage of parent container
    const width = calloutShape === "circle" ? 10 : 20;
    const height = calloutShape === "circle" ? 10 : 15;

    addCallout(step.id, {
      shape: calloutShape,
      color: calloutColor,
      x,
      y,
      width,
      height,
    });

    toast({
      title: "Callout Added",
      description: "Click and drag to resize or reposition"
    });
  };

  const handleCalloutDragStart = (
    e: React.MouseEvent<HTMLDivElement>,
    calloutId: string
  ) => {
    if (!isEditingCallouts) return;
    e.stopPropagation();
    setActiveCallout(calloutId);
  };

  const handleCalloutDrag = (
    e: React.MouseEvent<HTMLDivElement>,
    callout: Callout
  ) => {
    if (!isEditingCallouts) return;
    e.stopPropagation();
    if (activeCallout !== callout.id || !screenshotRef.current) return;

    const rect = screenshotRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Ensure the callout stays within bounds
    const boundedX = Math.max(0, Math.min(100 - callout.width, x));
    const boundedY = Math.max(0, Math.min(100 - callout.height, y));

    updateCallout(step.id, {
      ...callout,
      x: boundedX,
      y: boundedY,
    });
  };

  const handleCalloutDragEnd = () => {
    setActiveCallout(null);
  };

  const toggleEditMode = () => {
    setIsEditingCallouts(!isEditingCallouts);
    if (!isEditingCallouts) {
      toast({
        title: "Editing Mode Enabled",
        description: "Click on the image to add callouts or drag existing ones"
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
                  {isEditingCallouts ? 'Done Editing' : 'Edit Callouts'}
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
                        <Label htmlFor={`callout-shape-${step.id}`} className="text-sm text-zinc-300">
                          Shape:
                        </Label>
                        <div className="flex border rounded-md border-zinc-700">
                          <Button
                            type="button"
                            size="sm"
                            variant={calloutShape === "circle" ? "default" : "ghost"}
                            className={`h-8 px-3 rounded-r-none ${calloutShape === "circle" ? "bg-[#007AFF] hover:bg-[#0069D9]" : ""}`}
                            onClick={() => setCalloutShape("circle")}
                          >
                            <Circle className="h-4 w-4 mr-1" />
                            Circle
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={calloutShape === "rectangle" ? "default" : "ghost"}
                            className={`h-8 px-3 rounded-l-none ${calloutShape === "rectangle" ? "bg-[#007AFF] hover:bg-[#0069D9]" : ""}`}
                            onClick={() => setCalloutShape("rectangle")}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            Rectangle
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <Label htmlFor={`callout-color-${step.id}`} className="text-sm text-zinc-300">
                          Color:
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
                        Click on the image to add callouts
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
                      className={`relative ${isEditingCallouts ? 'cursor-crosshair' : 'cursor-default'}`}
                      onClick={handleScreenshotClick}
                    >
                      <img
                        src={step.screenshot.dataUrl}
                        alt={`Screenshot for step ${index + 1}`}
                        className="w-full h-auto"
                      />

                      {step.screenshot.callouts.map((callout) => (
                        <div
                          key={callout.id}
                          style={{
                            position: "absolute",
                            left: `${callout.x}%`,
                            top: `${callout.y}%`,
                            width: `${callout.width}%`,
                            height: `${callout.height}%`,
                            border: `2px solid ${callout.color}`,
                            backgroundColor: `${callout.color}20`,
                            borderRadius: callout.shape === "circle" ? "50%" : "0",
                            cursor: isEditingCallouts ? "move" : "default",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          }}
                          onMouseDown={(e) => handleCalloutDragStart(e, callout.id)}
                          onMouseMove={(e) => handleCalloutDrag(e, callout)}
                          onMouseUp={handleCalloutDragEnd}
                          onMouseLeave={handleCalloutDragEnd}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isEditingCallouts && (
                            <button
                              type="button"
                              className="absolute -top-3 -right-3 bg-white rounded-full border border-gray-200 w-6 h-6 flex items-center justify-center shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCallout(step.id, callout.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {isEditingCallouts && (
                      <div className="bg-zinc-800 p-2 text-xs text-center text-zinc-400">
                        Click on the image to add callouts. Click and drag callouts to move them.
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
