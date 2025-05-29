
import { SopDocument } from "@/types/sop";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function generateZipBundle(
  htmlContent: string,
  sopDocument: SopDocument,
  fileName: string
): Promise<void> {
  const zip = new JSZip();
  
  // Add main HTML file
  zip.file("index.html", htmlContent);
  
  // Add screenshots to assets folder
  const assetsFolder = zip.folder("assets");
  if (assetsFolder && sopDocument.steps) {
    for (let i = 0; i < sopDocument.steps.length; i++) {
      const step = sopDocument.steps[i];
      if (step.screenshot?.dataUrl) {
        try {
          // Convert data URL to blob
          const response = await fetch(step.screenshot.dataUrl);
          const blob = await response.blob();
          assetsFolder.file(`step-${i + 1}-screenshot.jpg`, blob);
        } catch (error) {
          console.warn(`Failed to process screenshot for step ${i + 1}:`, error);
        }
      }
    }
  }
  
  // Add README file
  const readmeContent = `# ${sopDocument.title || 'SOPify Training Module'}

This package contains:
- index.html: Main training module
- assets/: Screenshots and images

Open index.html in your web browser to start the training.

Created with SOPify - https://sopifyapp.com
`;
  
  zip.file("README.md", readmeContent);
  
  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `${fileName}.zip`);
}
