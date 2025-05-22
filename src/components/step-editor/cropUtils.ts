
/**
 * Utility functions for image cropping operations
 */

import { PercentCrop } from "react-image-crop";

/**
 * Creates a cropped image from an original image and crop parameters
 * 
 * @param image The source image element
 * @param completedCrop The crop parameters in percent (%)
 * @param aspect The desired aspect ratio (width/height)
 * @returns A data URL of the cropped image
 */
export function createCroppedImage(
  image: HTMLImageElement,
  completedCrop: PercentCrop,
  aspect: number
): string {
  // Create a new canvas element
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }
  
  // Calculate scale factors to convert from display size to natural size
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  // Calculate crop dimensions in pixels
  const cropWidthPx = (completedCrop.width * image.width * scaleX) / 100;
  const cropHeightPx = (completedCrop.height * image.height * scaleY) / 100;
  
  // Calculate source coordinates for cropping
  const sourceX = (completedCrop.x * image.width * scaleX) / 100;
  const sourceY = (completedCrop.y * image.height * scaleY) / 100;
  
  // Create a canvas with the exact 16:9 aspect ratio
  // FIXED: Always use 16:9 aspect ratio for output regardless of input crop
  const outputWidth = 1280; // Standard HD width
  const outputHeight = 720;  // Fixed 16:9 height (1280 / (16/9) = 720)
  
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  
  // Fill with white background first to ensure no transparency
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw the cropped portion of the image onto the canvas
  // Important: We're always outputting to a 16:9 canvas now
  ctx.drawImage(
    image,
    sourceX,              // source x
    sourceY,              // source y
    cropWidthPx,          // source width
    cropHeightPx,         // source height
    0,                    // destination x
    0,                    // destination y
    outputWidth,          // destination width - fixed 16:9 width
    outputHeight          // destination height - fixed 16:9 height
  );
  
  // Convert the canvas to a data URL and return it
  return canvas.toDataURL("image/png");
}
