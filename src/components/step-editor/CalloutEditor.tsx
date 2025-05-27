import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Circle, 
  Square, 
  MousePointer, 
  Type, 
  Palette, 
  Settings,
  Hash,
  MessageCircle
} from "lucide-react";
import { CalloutShape } from "@/types/sop";

interface CalloutEditorProps {
  stepId: string;
  calloutColor: string;
  setCalloutColor: (color: string) => void;
  selectedTool?: CalloutShape;
  onToolChange?: (tool: CalloutShape) => void;
  onCalloutConfigured?: (config: {
    shape: CalloutShape;
    color: string;
    revealText?: string;
    text?: string;
  }) => void;
}

const CalloutEditor: React.FC<CalloutEditorProps> = ({
  stepId,
  calloutColor,
  setCalloutColor,
  selectedTool = "circle",
  onToolChange,
  onCalloutConfigured
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<CalloutShape>(selectedTool);
  const [revealText, setRevealText] = useState("");
  const [calloutText, setCalloutText] = useState("");

  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal  
    "#45B7D1", // Blue
    "#FFA726", // Orange
    "#66BB6A", // Green
    "#AB47BC", // Purple
    "#FFD93D", // Yellow
    "#FF8A65", // Coral
  ];

  const calloutTools = [
    {
      shape: "circle" as CalloutShape,
      icon: Circle,
      name: "Circle",
      description: "Simple circular callout"
    },
    {
      shape: "rectangle" as CalloutShape,
      icon: Square,
      name: "Rectangle", 
      description: "Rectangular highlight box"
    },
    {
      shape: "arrow" as CalloutShape,
      icon: MousePointer,
      name: "Arrow",
      description: "Directional pointer"
    },
    {
      shape: "number" as CalloutShape,
      icon: Hash,
      name: "Numbered",
      description: "Numbered callout with click-to-reveal text"
    }
  ];

  const handleToolSelect = (tool: CalloutShape) => {
    setCurrentTool(tool);
    if (onToolChange) {
      onToolChange(tool);
    }
  };

  const handleApplyCallout = () => {
    const config = {
      shape: currentTool,
      color: calloutColor,
      revealText: currentTool === "number" ? revealText : undefined,
      text: calloutText || undefined
    };

    if (onCalloutConfigured) {
      onCalloutConfigured(config);
    }

    setIsModalOpen(false);
    setRevealText("");
    setCalloutText("");
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
      <Label className="text-zinc-300 text-sm font-medium">Callouts:</Label>
      
      {/* Quick color picker */}
      <div className="flex gap-1">
        {colors.slice(0, 4).map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              calloutColor === color ? "border-white scale-110" : "border-zinc-600"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setCalloutColor(color)}
          />
        ))}
      </div>

      {/* Current tool indicator */}
      <Badge className="bg-blue-600 text-white text-xs">
        {calloutTools.find(t => t.shape === currentTool)?.name || "Circle"}
      </Badge>

      {/* Advanced callout modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-zinc-600 text-zinc-300 hover:bg-zinc-700"
          >
            <Settings className="h-3 w-3 mr-1" />
            Callout Options
          </Button>
        </DialogTrigger>
        
        <DialogContent className="bg-[#1E1E1E] border-zinc-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Callout Configuration</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Choose callout type, color, and additional options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Callout Type Selection */}
            <div>
              <Label className="text-zinc-300 text-sm font-medium mb-3 block">
                Callout Type
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {calloutTools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <button
                      key={tool.shape}
                      onClick={() => handleToolSelect(tool.shape)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        currentTool === tool.shape
                          ? "border-blue-500 bg-blue-500/20"
                          : "border-zinc-600 hover:border-zinc-500 hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">{tool.name}</span>
                      </div>
                      <p className="text-xs text-zinc-400">{tool.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <Label className="text-zinc-300 text-sm font-medium mb-3 block">
                Color
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      calloutColor === color ? "border-white scale-105" : "border-zinc-600"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCalloutColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Numbered Callout Options */}
            {currentTool === "number" && (
              <div>
                <Label className="text-zinc-300 text-sm font-medium mb-2 block">
                  Click-to-Reveal Text
                </Label>
                <Textarea
                  value={revealText}
                  onChange={(e) => setRevealText(e.target.value)}
                  placeholder="Enter text that will appear when users click the numbered callout..."
                  className="bg-zinc-800 border-zinc-600 text-white placeholder-zinc-400"
                  rows={3}
                />
                <p className="text-xs text-zinc-400 mt-1">
                  This text will appear in a popup when users click the numbered callout
                </p>
              </div>
            )}



            {/* Preview */}
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <Label className="text-zinc-300 text-sm font-medium mb-2 block">
                Preview
              </Label>
              <div className="relative w-full h-20 bg-zinc-700 rounded flex items-center justify-center">
                <div
                  className={`
                    ${currentTool === "circle" ? "w-8 h-8 rounded-full" : ""}
                    ${currentTool === "rectangle" ? "w-12 h-6 rounded" : ""}
                    ${currentTool === "arrow" ? "w-6 h-6 rounded-sm transform rotate-45" : ""}
                    ${currentTool === "number" ? "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" : ""}
                    border-2 border-opacity-80
                  `}
                  style={{ 
                    backgroundColor: `${calloutColor}40`,
                    borderColor: calloutColor
                  }}
                >
                  {currentTool === "number" && "1"}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleApplyCallout}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply Callout
              </Button>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalloutEditor;
