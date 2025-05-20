
import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSopContext } from "@/context/SopContext";
import { SopStep, Callout, CalloutShape } from "@/types/sop";
import { ArrowDown, ArrowUp, X, Circle, Square } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
    if (!step.screenshot || !screenshotRef.current) return;

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
    e.stopPropagation();
    setActiveCallout(calloutId);
  };

  const handleCalloutDrag = (
    e: React.MouseEvent<HTMLDivElement>,
    callout: Callout
  ) => {
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

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{index + 1}. Step</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => moveStepUp(step.id)}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => moveStepDown(step.id)}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteStep(step.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor={`step-description-${step.id}`} className="mb-1 block">
              Step Description*
            </Label>
            <Textarea
              id={`step-description-${step.id}`}
              value={step.description}
              onChange={(e) => updateStep(step.id, e.target.value)}
              placeholder="Describe the step"
              className="h-24"
              required
            />
          </div>

          <div>
            <Label className="mb-1 block">Screenshot*</Label>
            {!step.screenshot ? (
              <div className="mt-2">
                <Input
                  id={`step-screenshot-${step.id}`}
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  required
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStepScreenshot(step.id, "")}
                  >
                    Replace Screenshot
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleScreenshotUpload}
                    />
                  </Button>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-2 items-center">
                      <Label htmlFor={`callout-shape-${step.id}`} className="text-sm">
                        Shape:
                      </Label>
                      <div className="flex border rounded-md">
                        <Button
                          type="button"
                          size="sm"
                          variant={calloutShape === "circle" ? "default" : "ghost"}
                          className="h-8 px-3 rounded-r-none"
                          onClick={() => setCalloutShape("circle")}
                        >
                          <Circle className="h-4 w-4 mr-1" />
                          Circle
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={calloutShape === "rectangle" ? "default" : "ghost"}
                          className="h-8 px-3 rounded-l-none"
                          onClick={() => setCalloutShape("rectangle")}
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Rectangle
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Label htmlFor={`callout-color-${step.id}`} className="text-sm">
                        Color:
                      </Label>
                      <Input
                        id={`callout-color-${step.id}`}
                        type="color"
                        value={calloutColor}
                        onChange={(e) => setCalloutColor(e.target.value)}
                        className="w-10 h-8 p-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative border rounded-md shadow-md overflow-hidden">
                  <div
                    ref={screenshotRef}
                    className="relative"
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
                          cursor: "move",
                        }}
                        onMouseDown={(e) => handleCalloutDragStart(e, callout.id)}
                        onMouseMove={(e) => handleCalloutDrag(e, callout)}
                        onMouseUp={handleCalloutDragEnd}
                        onMouseLeave={handleCalloutDragEnd}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="absolute -top-3 -right-3 bg-white rounded-full border border-gray-200 w-6 h-6 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCallout(step.id, callout.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-2 text-xs text-center text-gray-500">
                    Click on the image to add callouts. Click and drag callouts to move them.
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
