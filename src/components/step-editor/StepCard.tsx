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
  FileText,
  Clock,
  Shield,
  AlertTriangle,
  HelpCircle
} from "lucide-react";
import { SopStep, StepCardProps } from "@/types/sop";
import { EnhancedContentBlock } from "@/types/enhanced-content";
import EnhancedScreenshotEditor from "./EnhancedScreenshotEditor";
import { ContentBlockSelector } from "@/components/content-blocks/ContentBlockSelector";
import { ContentBlockRenderer } from "@/components/content-blocks/ContentBlockRenderer";

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
  const [calloutColor, setCalloutColor] = useState("#FF6B35");
  const [showCalloutCursor, setShowCalloutCursor] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleInputChange = (field: keyof SopStep, value: any) => {
    if (onStepChange) {
      onStepChange(step.id, field, value);
    }
  };

  const handleScreenshotMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditingCallouts) {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleScreenshotMouseEnter = () => {
    if (isEditingCallouts) {
      setShowCalloutCursor(true);
    }
  };

  const handleScreenshotMouseLeave = () => {
    setShowCalloutCursor(false);
  };

  const toggleEditMode = () => {
    setIsEditingCallouts(!isEditingCallouts);
    if (!isEditingCallouts) {
      setShowCalloutCursor(false);
    }
  };

  const setStepScreenshot = (id: string, dataUrl: string) => {
    handleInputChange("screenshot", { 
      id: Date.now().toString(), 
      dataUrl, 
      callouts: step.screenshot?.callouts || [] 
    });
  };

  const addCallout = (stepId: string, callout: Omit<any, "id">) => {
    if (step.screenshot) {
      const newCallout = { ...callout, id: Date.now().toString() };
      const updatedCallouts = [...(step.screenshot.callouts || []), newCallout];
      handleInputChange("screenshot", { ...step.screenshot, callouts: updatedCallouts });
    }
  };

  const deleteCallout = (stepId: string, calloutId: string) => {
    if (step.screenshot) {
      const updatedCallouts = step.screenshot.callouts.filter(c => c.id !== calloutId);
      handleInputChange("screenshot", { ...step.screenshot, callouts: updatedCallouts });
    }
  };

  const toggleCompletion = () => {
    if (onStepComplete) {
      onStepComplete(step.id, !step.completed);
    }
  };

  // Enhanced content block handlers
  const handleAddContentBlock = (block: EnhancedContentBlock) => {
    const currentBlocks = step.enhancedContentBlocks || [];
    const newBlock = { ...block, order: currentBlocks.length };
    handleInputChange("enhancedContentBlocks", [...currentBlocks, newBlock]);
  };

  const handleUpdateContentBlocks = (blocks: EnhancedContentBlock[]) => {
    handleInputChange("enhancedContentBlocks", blocks);
  };

  const handleEnhancedCalloutUpdate = (callouts: any[]) => {
    if (step.screenshot) {
      handleInputChange("screenshot", { ...step.screenshot, callouts });
    }
  };

  const handleCalloutClick = (calloutId: string) => {
    deleteCallout(step.id, calloutId);
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

            {/* Key Takeaway Field */}
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

            {/* Enhanced Screenshot Section */}
            <div className="space-y-4">
              <Label className="text-zinc-300 font-medium">Screenshot & Annotations</Label>
              
              {step.screenshot ? (
                <EnhancedScreenshotEditor
                  stepId={step.id}
                  screenshot={step.screenshot}
                  isEditingCallouts={isEditingCallouts}
                  calloutColor={calloutColor}
                  setCalloutColor={setCalloutColor}
                  onScreenshotUpload={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setStepScreenshot(step.id, event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onScreenshotClick={(e) => {
                    if (isEditingCallouts) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      
                      addCallout(step.id, {
                        shape: "circle",
                        color: calloutColor,
                        x,
                        y,
                        width: 5,
                        height: 5
                      });
                    }
                  }}
                  onCalloutClick={handleCalloutClick}
                  onCalloutUpdate={handleEnhancedCalloutUpdate}
                  cursorPosition={cursorPosition}
                  showCalloutCursor={showCalloutCursor}
                  handleScreenshotMouseMove={handleScreenshotMouseMove}
                  handleScreenshotMouseEnter={handleScreenshotMouseEnter}
                  handleScreenshotMouseLeave={handleScreenshotMouseLeave}
                  onUpdateScreenshot={(dataUrl) => {
                    handleInputChange("screenshot", { ...step.screenshot, dataUrl });
                  }}
                />
              ) : (
                <div className="border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center">
                  <p className="text-zinc-400 mb-4">No screenshot added yet</p>
                  <Button
                    variant="outline"
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                  >
                    Upload Screenshot
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setStepScreenshot(step.id, event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isEditingCallouts ? "default" : "outline"}
                  onClick={toggleEditMode}
                  className={isEditingCallouts 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                  }
                >
                  {isEditingCallouts ? "Finish Editing" : "Edit Callouts"}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Cursor for callout editing */}
      {showCalloutCursor && (
        <div
          className="fixed pointer-events-none z-50"
          style={{ 
            left: cursorPosition.x - 4, 
            top: cursorPosition.y - 4,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div 
            className="w-8 h-8 rounded-full border-2 border-white opacity-80"
            style={{ backgroundColor: calloutColor }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default StepCard;
