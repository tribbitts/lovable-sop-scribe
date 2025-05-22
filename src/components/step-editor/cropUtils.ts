
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
  
  // Calculate dimensions for the output canvas, ensuring 16:9 aspect ratio
  // We'll use the crop width as the base and calculate the height from that
  const outputWidth = cropWidthPx;
  const outputHeight = outputWidth / aspect;
  
  // Set canvas dimensions to match the 16:9 aspect ratio
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  
  // Draw the cropped portion of the image onto the canvas
  ctx.drawImage(
    image,
    (completedCrop.x * image.width * scaleX) / 100,  // source x
    (completedCrop.y * image.height * scaleY) / 100, // source y
    cropWidthPx,                                     // source width
    cropHeightPx,                                    // source height
    0,                                               // destination x
    0,                                               // destination y
    canvas.width,                                    // destination width
    canvas.height                                    // destination height
  );
  
  // Convert the canvas to a data URL and return it
  return canvas.toDataURL("image/png");
}
