
import { SopDocument } from "@/types/sop";
import { addSopifyBrandedDesign } from "./cover-page-background";
import { addCoverPageContent } from "./cover-page-content";
import { addLogoToCover } from "./cover-page-logo";
import { addSopifyBrandedFooter, addSopifyWatermark } from "./cover-page-footer";

export async function addCoverPage(
  pdf: any,
  sopDocument: SopDocument, 
  width: number, 
  height: number, 
  margin: any,
  backgroundImage: string | null = null
) {
  // Add sophisticated SOPify-branded background design
  addSopifyBrandedDesign(pdf, width, height, margin, backgroundImage || sopDocument.backgroundImage);
  
  // Add logo with refined positioning and SOPify branding
  let logoOffset = 0;
  if (sopDocument.logo) {
    try {
      console.log("Adding logo to cover page");
      logoOffset = await addLogoToCover(pdf, sopDocument, width, height);
      console.log("Logo added successfully");
    } catch (logoError) {
      console.error("Failed to add logo to cover page:", logoError);
    }
  }
  
  // Add main content (title, subtitle, date, company)
  addCoverPageContent(pdf, sopDocument, width, height, logoOffset);
  
  // Enhanced footer with proper SOPify branding
  addSopifyBrandedFooter(pdf, width, height, margin);
  
  // Add SOPify watermark
  addSopifyWatermark(pdf, width, height);
}
