
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus } from "lucide-react";

interface ScreenshotUploaderProps {
  onScreenshotUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  onScreenshotUpload,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onScreenshotUpload(e);
    }
  };

  return (
    <div className="bg-zinc-800 border border-dashed border-zinc-700 rounded-xl p-12 text-center">
      <div className="flex flex-col items-center space-y-3">
        <ImagePlus className="h-10 w-10 text-zinc-500" />
        <div className="space-y-2">
          <h3 className="text-zinc-300 font-medium text-lg">Add Screenshot</h3>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto">
            Upload a screenshot to illustrate this step
          </p>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Upload Image
          </Button>
          <Input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ScreenshotUploader;
