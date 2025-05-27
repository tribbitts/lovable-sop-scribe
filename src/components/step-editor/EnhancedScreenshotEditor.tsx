
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crop } from "lucide-react";
import { EnhancedCallout } from "@/types/enhanced-content";
import { EnhancedCalloutEditor } from "@/components/enhanced-annotations/EnhancedCalloutEditor";
import CropDialog from "./crop/CropDialog";

interface EnhancedScreenshotEditorProps {
  stepId: string;
  screenshot: {
    dataUrl: string;
    callouts: EnhancedCallout[];
  };
  isEditingCallouts: boolean;
  calloutColor: string;
  setCalloutColor: (color: string) => void;
  onScreenshotUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScreenshotClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCalloutClick: (calloutId: string) => void;
  onCalloutUpdate: (callouts: EnhancedCallout[]) => void;
  cursorPosition: { x: number; y: number };
  showCalloutCursor: boolean;
  handleScreenshotMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleScreenshotMouseEnter: () => void;
  handleScreenshotMouseLeave: () => void;
  onUpdateScreenshot: (dataUrl: string) => void;
}

const EnhancedScreenshotEditor: React.FC<EnhancedScreenshotEditorProps> = ({
  stepId,
  screenshot,
  isEditingCallouts,
  calloutColor,
  setCalloutColor,
  onScreenshotUpload,
  onScreenshotClick,
  onCalloutClick,
  onCalloutUpdate,
  cursorPosition,
  showCalloutCursor,
  handleScreenshotMouseMove,
  handleScreenshotMouseEnter,
  handleScreenshotMouseLeave,
  onUpdateScreenshot,
}) => {
  const screenshotRef = useRef<HTMLDivElement>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [autoNumbering, setAutoNumbering] = useState(true);

  return (
    <div className="space-y-4">
      {/* Enhanced Callout Editor */}
      <EnhancedCalloutEditor
        callouts={screenshot.callouts}
        calloutColor={calloutColor}
        setCalloutColor={setCalloutColor}
        onCalloutUpdate={onCalloutUpdate}
        autoNumbering={autoNumbering}
        setAutoNumbering={setAutoNumbering}
      />

      <div className="relative">
        <div className="absolute right-3 top-3 z-10 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-zinc-800/80 backdrop-blur-sm border-zinc-700 text-zinc-300 hover:bg-zinc-700 flex items-center gap-1"
            onClick={() => setIsCropDialogOpen(true)}
          >
            <Crop className="h-4 w-4" />
            Crop
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-zinc-800/80 backdrop-blur-sm border-zinc-700 text-zinc-300 hover:bg-zinc-700"
          >
            Replace
            <Input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={onScreenshotUpload}
            />
          </Button>
        </div>

        <div
          className={`relative border rounded-lg shadow-md overflow-hidden transition-all ${
            isEditingCallouts ? "border-[#007AFF]" : "border-zinc-700"
          }`}
        >
          <div
            ref={screenshotRef}
            className={`relative ${
              isEditingCallouts ? "cursor-none" : "cursor-default"
            }`}
            onClick={onScreenshotClick}
            onMouseMove={handleScreenshotMouseMove}
            onMouseEnter={handleScreenshotMouseEnter}
            onMouseLeave={handleScreenshotMouseLeave}
          >
            <img
              src={screenshot.dataUrl}
              alt="Screenshot"
              className="w-full h-auto"
            />

            {/* Custom cursor when in editing mode */}
            {showCalloutCursor && (
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  left: `${cursorPosition.x}%`,
                  top: `${cursorPosition.y}%`,
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  border: `2px solid ${calloutColor}`,
                  boxShadow: `0 0 10px ${calloutColor}80`,
                  backgroundColor: `${calloutColor}20`,
                }}
              />
            )}

            {/* Enhanced callouts with hotspot functionality */}
            {screenshot.callouts.map((callout, index) => (
              <div
                key={callout.id}
                className="absolute group"
                style={{
                  left: `${callout.x}%`,
                  top: `${callout.y}%`,
                  width: `${callout.width}%`,
                  height: `${callout.height}%`,
                }}
                onClick={(e) => {
                  if (isEditingCallouts) {
                    e.stopPropagation();
                    onCalloutClick(callout.id);
                  }
                }}
              >
                {/* Callout shape */}
                <div
                  className={`w-full h-full transition-all ${
                    callout.shape === "circle" ? "rounded-full" : 
                    callout.shape === "rectangle" ? "rounded" : 
                    callout.shape === "arrow" ? "rounded-sm transform rotate-45" : 
                    "rounded-full"
                  } ${isEditingCallouts ? "cursor-pointer" : "cursor-default"}`}
                  style={{
                    border: `3px solid ${callout.color}`,
                    boxShadow: `0 0 8px ${callout.color}80`,
                    backgroundColor: `${callout.color}20`,
                  }}
                >
                  {/* Numbered callouts */}
                  {callout.shape === "number" && autoNumbering && (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: callout.color }}
                    >
                      {callout.sequenceNumber || index + 1}
                    </div>
                  )}
                </div>

                {/* Hover tooltip for hotspots */}
                {callout.hotspotData?.hoverText && !isEditingCallouts && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {callout.hotspotData.hoverText}
                  </div>
                )}
              </div>
            ))}
          </div>
          {isEditingCallouts && (
            <div className="bg-zinc-800 p-2 text-xs text-center text-zinc-400">
              Click to place a callout. Click on an existing callout to remove it.
            </div>
          )}
        </div>
        
        <CropDialog
          open={isCropDialogOpen}
          onOpenChange={setIsCropDialogOpen}
          imageUrl={screenshot.dataUrl}
          onCropComplete={onUpdateScreenshot}
        />
      </div>
    </div>
  );
};

export default EnhancedScreenshotEditor;
