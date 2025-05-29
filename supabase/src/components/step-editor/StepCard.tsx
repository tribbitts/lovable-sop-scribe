import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Clock
} from "lucide-react";
import { SopStep, StepCardProps } from "@/types/sop";
import { EnhancedContentBlock } from "@/types/enhanced-content";
import { useScreenshotManager } from "@/hooks/useScreenshotManager";
import { ScreenshotUpload } from "@/components/common/ScreenshotUpload";
import { ContentBlockSelector } from "@/components/content-blocks/ContentBlockSelector";
import { ContentBlockRenderer } from "@/components/content-blocks/ContentBlockRenderer";
import { v4 as uuidv4 } from "uuid";
import EnhancedCalloutOverlay from "@/components/enhanced-annotations/EnhancedCalloutOverlay";

const StepCard: React.FC<StepCardProps> = ({
  step,
  index,
  isActive = false,
  onStepChange,
  onStepComplete,
  onDeleteStep,
}) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const [isEditingCallouts, setIsEditingCallouts] = useState(false);

  // Use unified screenshot management
  const screenshotManager = useScreenshotManager({
    stepId: step.id,
    step,
    onStepChange
  });

  const handleInputChange = (field: keyof SopStep, value: any) => {
    onStepChange?.(step.id, field, value);
  };

  const toggleEditMode = () => {
    setIsEditingCallouts(!isEditingCallouts);
  };

  const toggleCompletion = () => {
    onStepComplete?.(step.id, !step.completed);
  };

  const handleAddContentBlock = (block: EnhancedContentBlock) => {
    const currentBlocks = step.enhancedContentBlocks || [];
    const newBlock = { ...block, order: currentBlocks.length };
    handleInputChange("enhancedContentBlocks", [...currentBlocks, newBlock]);
  };

  const handleUpdateContentBlocks = (blocks: EnhancedContentBlock[]) => {
    handleInputChange("enhancedContentBlocks", blocks);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className={`bg-[#1E1E1E] border transition-all duration-200 ${
        step.completed 
          ? "border-green-700 bg-green-900/10" 
          : isExpanded 
            ? "border-zinc-600 shadow-lg" 
            : "border-zinc-800 hover:border-zinc-700"
      }`}>
        <CardHeader 
          className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  step.completed 
                    ? "bg-green-600 border-green-500" 
                    : "bg-zinc-700 border-zinc-600"
                }`}>
                  <span className="text-sm font-bold text-white">{index + 1}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompletion();
                  }}
                  className="text-zinc-400 hover:text-green-400 transition-colors"
                >
                  {step.completed ? 
                    <CheckCircle2 className="h-5 w-5 text-green-400" /> : 
                    <Circle className="h-5 w-5" />
                  }
                </button>
              </div>

              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${
                  step.completed ? "text-green-300" : "text-zinc-200"
                }`}>
                  {step.title || `Step ${index + 1}`}
                </h3>
                
                <div className="flex items-center gap-2 mt-1">
                  {step.estimatedTime && (
                    <Badge className="bg-blue-600 text-white text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {step.estimatedTime}min
                    </Badge>
                  )}
                  {step.enhancedContentBlocks && step.enhancedContentBlocks.length > 0 && (
                    <Badge className="bg-purple-600 text-white text-xs">
                      {step.enhancedContentBlocks.length} content blocks
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onDeleteStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStep(step.id);
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              {isExpanded ? 
                <ChevronUp className="h-5 w-5 text-zinc-400" /> : 
                <ChevronDown className="h-5 w-5 text-zinc-400" />
              }
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6">
            {/* Basic Step Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`title-${step.id}`} className="text-zinc-300 font-medium">
                  Step Title
                </Label>
                <Input
                  id={`title-${step.id}`}
                  value={step.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter step title..."
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor={`time-${step.id}`} className="text-zinc-300 font-medium">
                  Estimated Time (minutes)
                </Label>
                <Input
                  id={`time-${step.id}`}
                  type="number"
                  value={step.estimatedTime || ""}
                  onChange={(e) => handleInputChange("estimatedTime", parseInt(e.target.value) || undefined)}
                  placeholder="5"
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`description-${step.id}`} className="text-zinc-300 font-medium">
                Step Instructions
              </Label>
              <Textarea
                id={`description-${step.id}`}
                value={step.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what the user should do in this step..."
                className="bg-zinc-800 border-zinc-700 text-white mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor={`takeaway-${step.id}`} className="text-zinc-300 font-medium">
                Key Takeaway (Optional)
              </Label>
              <Input
                id={`takeaway-${step.id}`}
                value={step.keyTakeaway || ""}
                onChange={(e) => handleInputChange("keyTakeaway", e.target.value)}
                placeholder="What's the main point users should remember?"
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
              />
            </div>

            <Separator className="bg-zinc-700" />

            {/* Enhanced Content Blocks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300 font-medium">Enhanced Content</Label>
                <ContentBlockSelector onAddBlock={handleAddContentBlock} />
              </div>
              
              {step.enhancedContentBlocks && step.enhancedContentBlocks.length > 0 && (
                <ContentBlockRenderer
                  blocks={step.enhancedContentBlocks}
                  isEditing={true}
                  onChange={handleUpdateContentBlocks}
                />
              )}
            </div>

            <Separator className="bg-zinc-700" />

            {/* Simplified Screenshot Section */}
            <div className="space-y-4">
              <Label className="text-zinc-300 font-medium">Screenshot & Annotations</Label>
              
              {screenshotManager.hasScreenshots && step.screenshot ? (
                <div className="space-y-4">
                  <div className="relative border rounded-lg shadow-md overflow-hidden border-zinc-700">
                    <div className="absolute right-3 top-3 z-10 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-zinc-800/80 backdrop-blur-sm border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const dataUrl = event.target?.result as string;
                                if (dataUrl && step.screenshot) {
                                  screenshotManager.replaceScreenshot(step.screenshot.id, dataUrl);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        Replace
                      </Button>
                    </div>
                    
                    <img
                      src={step.screenshot.dataUrl}
                      alt="Screenshot"
                      className="w-full h-auto"
                    />
                    
                    <div className="absolute inset-0">
                      <EnhancedCalloutOverlay
                        screenshot={step.screenshot}
                        isEditing={isEditingCallouts}
                        onCalloutAdd={(callout) => {
                          const newCallout = { ...callout, id: uuidv4() };
                          const updatedCallouts = [...(step.screenshot?.callouts || []), newCallout];
                          handleInputChange("screenshot", { ...step.screenshot, callouts: updatedCallouts });
                        }}
                        onCalloutUpdate={(callout) => {
                          if (step.screenshot) {
                            const updatedCallouts = step.screenshot.callouts.map(c => 
                              c.id === callout.id ? callout : c
                            );
                            handleInputChange("screenshot", { ...step.screenshot, callouts: updatedCallouts });
                          }
                        }}
                        onCalloutDelete={(calloutId) => {
                          if (step.screenshot) {
                            const updatedCallouts = step.screenshot.callouts.filter(c => c.id !== calloutId);
                            handleInputChange("screenshot", { ...step.screenshot, callouts: updatedCallouts });
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isEditingCallouts ? "default" : "outline"}
                      onClick={toggleEditMode}
                      className={isEditingCallouts 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      }
                    >
                      {isEditingCallouts ? "✓ Done Editing" : "Edit Callouts"}
                    </Button>
                  </div>
                </div>
              ) : (
                <ScreenshotUpload
                  variant="dropzone"
                  onUpload={(dataUrl) => screenshotManager.addScreenshot(dataUrl)}
                />
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default StepCard;
