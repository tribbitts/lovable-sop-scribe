
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
  
  // Set canvas dimensions to maintain the 16:9 aspect ratio
  // Use the width as the base and calculate height based on aspect
  const outputWidth = 1280; // Standard width for 16:9
  const outputHeight = outputWidth / aspect; // Calculate height based on 16:9 aspect ratio
  
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  
  // Fill with white background first
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw the cropped portion of the image onto the canvas, maintaining aspect ratio
  ctx.drawImage(
    image,
    sourceX,               // source x
    sourceY,               // source y
    cropWidthPx,           // source width
    cropHeightPx,          // source height
    0,                     // destination x
    0,                     // destination y
    outputWidth,           // destination width - fixed width for 16:9
    outputHeight           // destination height - calculated to maintain aspect
  );
  
  // Convert the canvas to a data URL and return it
  return canvas.toDataURL("image/png");
}
