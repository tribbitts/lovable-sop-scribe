
import React, { useState, useRef } from "react";
import { 
  Crop, 
  PixelCrop, 
  PercentCrop, 
  centerCrop, 
  makeAspectCrop,
  convertToPercentCrop 
} from "react-image-crop";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { createCroppedImage } from "../cropUtils";
import CropImage from "./CropImage";
import CropControls from "./CropControls";

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
          description: "Your screenshot has been cropped successfully to 16:9 aspect ratio",
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
        
        <CropImage
          crop={crop}
          onCropChange={(c) => setCrop(c)}
          onCropComplete={(pixelCrop: PixelCrop) => {
            // Convert PixelCrop to PercentCrop
            if (imageRef.current) {
              const { width, height } = imageRef.current;
              const percentCrop = convertToPercentCrop(pixelCrop, width, height);
              setCompletedCrop(percentCrop);
            }
          }}
          aspect={aspect}
          onImageLoad={onImageLoad}
          imageUrl={originalImageUrl}
          imageRef={imageRef}
        />
        
        <DialogFooter>
          <CropControls 
            onReset={handleReset}
            onCancel={() => onOpenChange(false)}
            onApply={handleApplyCrop}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CropDialog;
