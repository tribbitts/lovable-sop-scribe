
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Callout } from "@/types/sop";
import { Crop } from "lucide-react";
import CropDialog from "./crop/CropDialog";

interface ScreenshotEditorProps {
  stepId: string;
  screenshot: {
    dataUrl: string;
    callouts: Callout[];
  };
  isEditingCallouts: boolean;
  calloutColor: string;
  onScreenshotUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScreenshotClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCalloutClick: (calloutId: string) => void;
  cursorPosition: { x: number; y: number };
  showCalloutCursor: boolean;
  handleScreenshotMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleScreenshotMouseEnter: () => void;
  handleScreenshotMouseLeave: () => void;
  onUpdateScreenshot: (dataUrl: string) => void;
}

const ScreenshotEditor: React.FC<ScreenshotEditorProps> = ({
  stepId,
  screenshot,
  isEditingCallouts,
  calloutColor,
  onScreenshotUpload,
  onScreenshotClick,
  onCalloutClick,
  cursorPosition,
  showCalloutCursor,
  handleScreenshotMouseMove,
  handleScreenshotMouseEnter,
  handleScreenshotMouseLeave,
  onUpdateScreenshot,
}) => {
  const screenshotRef = useRef<HTMLDivElement>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

  return (
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

          {screenshot.callouts.map((callout) => (
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
                  onCalloutClick(callout.id);
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
      
      <CropDialog
        open={isCropDialogOpen}
        onOpenChange={setIsCropDialogOpen}
        imageUrl={screenshot.dataUrl}
        onCropComplete={onUpdateScreenshot}
      />
    </div>
  );
};

export default ScreenshotEditor;
