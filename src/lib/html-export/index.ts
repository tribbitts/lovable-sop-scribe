import { SopDocument } from "@/types/sop";
import { generateEnhancedHtmlTemplate } from "./enhanced-template";
import { generateStandardHtmlTemplate } from "./standard-template";
import { generateZipBundle } from "./zip-generator";
import { FeedbackOptions } from "./feedback-renderer";

export interface HtmlExportOptions {
  mode?: 'standalone' | 'zip';
  quality?: number;
  enhanced?: boolean;
  enhancedOptions?: any;
  includeTableOfContents?: boolean;
  feedback?: FeedbackOptions;
  includeFeedback?: boolean;
  feedbackEmail?: string;
  customization?: any;
}

export async function exportSopAsHtml(
  sopDocument: SopDocument,
  options: HtmlExportOptions = {}
): Promise<void> {
  try {
    console.log("🚀 Starting HTML export with options:", options);
    
    // Generate HTML content based on enhanced option
    let htmlContent: string;
    
    if (options.enhanced) {
      console.log("📱 Generating enhanced LMS-style HTML template");
      htmlContent = generateEnhancedHtmlTemplate(sopDocument, options.enhancedOptions);
    } else {
      console.log("📄 Generating standard HTML template");
      htmlContent = generateStandardHtmlTemplate(sopDocument, options);
    }
    
    const fileName = `${sopDocument.title || 'SOP'}_${new Date().toISOString().split('T')[0]}`;
    
    if (options.mode === 'zip') {
      console.log("📦 Creating ZIP bundle");
      await generateZipBundle(htmlContent, sopDocument, fileName);
    } else {
      console.log("💾 Creating standalone HTML file");
      downloadHtmlFile(htmlContent, `${fileName}.html`);
    }
    
    console.log("✅ HTML export completed successfully");
  } catch (error) {
    console.error("❌ HTML export failed:", error);
    throw error;
  }
}

function downloadHtmlFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
