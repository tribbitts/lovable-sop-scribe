import React, { useState, useRef, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageCropperProps } from "@/types/sop";
import { motion } from "framer-motion";
import { Crop as CropIcon, RotateCcw, Check, X } from "lucide-react";
import "react-image-crop/dist/ReactCrop.css";

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageDataUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 16 / 9
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80 / aspectRatio,
  });
  
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Generate preview when crop changes
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    });
  }, [completedCrop]);

  const handleCropComplete = () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onload = () => {
          onCropComplete(reader.result as string);
        };
        reader.readAsDataURL(blob);
      }
    }, "image/jpeg", 0.95);
  };

  const resetCrop = () => {
    setCrop({
      unit: "%",
      x: 10,
      y: 10,
      width: 80,
      height: 80 / aspectRatio,
    });
    setCompletedCrop(undefined);
    setPreviewUrl("");
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-4xl w-[90vw] h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-white flex items-center gap-2">
            <CropIcon className="h-5 w-5 text-[#007AFF]" />
            Crop Screenshot
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden p-6 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Main Crop Area */}
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">
                Original Image
              </h3>
              <div className="flex-1 min-h-0 bg-zinc-800 rounded-lg overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  className="w-full h-full"
                >
                  <img
                    ref={imgRef}
                    src={imageDataUrl}
                    alt="Crop me"
                    className="w-full h-full object-contain"
                    style={{ maxHeight: "100%" }}
                  />
                </ReactCrop>
              </div>
              
              <div className="mt-4 text-sm text-zinc-400">
                <p>• Drag to reposition the crop area</p>
                <p>• Drag corners to resize (maintains {aspectRatio.toFixed(1)}:1 ratio)</p>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">
                Preview
              </h3>
              <div className="flex-1 min-h-0 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={previewUrl}
                    alt="Crop preview"
                    className="max-w-full max-h-full object-contain rounded"
                  />
                ) : (
                  <div className="text-center text-zinc-500">
                    <CropIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Crop preview will appear here</p>
                  </div>
                )}
              </div>
              
              {/* Hidden canvas for generating the crop */}
              <canvas
                ref={previewCanvasRef}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={resetCrop}
              className="border-zinc-700 text-white hover:bg-zinc-800"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              
              <Button
                onClick={handleCropComplete}
                disabled={!completedCrop}
                className="bg-[#007AFF] hover:bg-[#0069D9] text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper; 