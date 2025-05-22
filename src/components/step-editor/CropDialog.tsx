
import React, { useState, useRef } from "react";
import ReactCrop, { 
  Crop, 
  PixelCrop, 
  PercentCrop, 
  centerCrop, 
  makeAspectCrop,
  convertToPercentCrop 
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { createCroppedImage } from "./cropUtils";

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

// Function to create a centered crop with a specific aspect ratio
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const CropDialog: React.FC<CropDialogProps> = ({
  open,
  onOpenChange,
  imageUrl,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PercentCrop>();
  const imageRef = useRef<HTMLImageElement>(null);
  const [originalImageUrl] = useState(imageUrl);
  
  // Fixed aspect ratio (16:9)
  const aspect = 16 / 9;

  // When image loads, set up initial centered crop
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  };

  // Reset to original image and crop
  const handleReset = () => {
    if (imageRef.current) {
      const { width, height } = imageRef.current;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  // Apply the crop to generate a new image
  const handleApplyCrop = () => {
    if (completedCrop && imageRef.current) {
      try {
        const croppedImageUrl = createCroppedImage(imageRef.current, completedCrop, aspect);
        
        onCropComplete(croppedImageUrl);
        onOpenChange(false);
        
        toast({
          title: "Image Cropped",
          description: "Your screenshot has been cropped successfully",
        });
      } catch (error) {
        toast({
          title: "Crop Failed",
          description: "There was an error cropping your image",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">Crop Screenshot</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Adjust the crop area to fit a 16:9 aspect ratio. You can move and resize while maintaining this ratio.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center p-4 bg-zinc-800 rounded-md overflow-hidden">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(pixelCrop: PixelCrop) => {
              // Convert PixelCrop to PercentCrop
              if (imageRef.current) {
                const { width, height } = imageRef.current;
                const percentCrop = convertToPercentCrop(pixelCrop, width, height);
                setCompletedCrop(percentCrop);
              }
            }}
            aspect={aspect}
            className="max-h-[50vh] object-contain"
          >
            <img
              ref={imageRef}
              src={originalImageUrl}
              alt="Screenshot to crop"
              onLoad={onImageLoad}
              className="max-w-full h-auto"
              style={{ maxHeight: "50vh" }}
            />
          </ReactCrop>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={handleReset}
          >
            Reset Crop
          </Button>
          <div className="space-x-2">
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyCrop}
              className="bg-[#007AFF] hover:bg-[#0069D9] text-white"
            >
              Apply Crop
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CropDialog;
