
import { SopDocument, ExportFormat, ExportOptions } from "@/types/sop";
import { saveAs } from "file-saver";
import { toast } from "@/hooks/use-toast";

export class DocumentManager {
  static updateTitle(document: SopDocument, title: string): SopDocument {
    return { ...document, title };
  }

  static updateTopic(document: SopDocument, topic: string): SopDocument {
    return { ...document, topic };
  }

  static updateDate(document: SopDocument, date: string): SopDocument {
    return { ...document, date };
  }

  static updateLogo(document: SopDocument, logo: string | null): SopDocument {
    return { ...document, logo };
  }

  static updateBackgroundImage(document: SopDocument, image: string | null): SopDocument {
    return { ...document, backgroundImage: image };
  }

  static updateCompanyName(document: SopDocument, companyName: string): SopDocument {
    return { ...document, companyName };
  }

  static updateTableOfContents(document: SopDocument, enabled: boolean): SopDocument {
    return { ...document, tableOfContents: enabled };
  }

  static updateDarkMode(document: SopDocument, enabled: boolean): SopDocument {
    return { ...document, darkMode: enabled };
  }

  static updateTrainingMode(document: SopDocument, enabled: boolean): SopDocument {
    return { ...document, trainingMode: enabled };
  }

  static enableProgressTracking(document: SopDocument, sessionName?: string): SopDocument {
    return {
      ...document,
      progressTracking: {
        enabled: true,
        sessionName
      }
    };
  }

  static disableProgressTracking(document: SopDocument): SopDocument {
    return {
      ...document,
      progressTracking: {
        enabled: false
      }
    };
  }

  static async saveToJSON(document: SopDocument): Promise<void> {
    try {
      const jsonData = JSON.stringify(document, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const fileName = `${document.title || "SOP"}_${new Date().toISOString().split("T")[0]}.json`;
      saveAs(blob, fileName);
      
      toast({
        title: "SOP Saved",
        description: "Your SOP has been saved as JSON file"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SOP document",
        variant: "destructive"
      });
    }
  }

  static loadFromJSON(jsonData: string, defaultDocument: SopDocument): SopDocument {
    try {
      const parsedData = JSON.parse(jsonData) as SopDocument;
      
      toast({
        title: "SOP Loaded",
        description: "Your SOP has been loaded successfully"
      });
      
      return { ...defaultDocument, ...parsedData };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load SOP document",
        variant: "destructive"
      });
      return defaultDocument;
    }
  }

  static async exportDocument(document: SopDocument, format: ExportFormat | "bundle", options?: any): Promise<void> {
    try {
      if (format === "pdf") {
        const { generatePDF } = await import("@/lib/pdf-generator");
        await generatePDF(document);
      } else if (format === "html" || format === "training-module") {
        const { exportSopAsHtml } = await import("@/lib/html-export");
        
        const htmlOptions: any = {
          mode: options?.mode || 'standalone',
          quality: 0.85,
          includeTableOfContents: options?.includeTableOfContents,
          enhanced: options?.enhanced || false,
          enhancedOptions: options?.enhancedOptions,
          customization: options?.customization
        };
        
        console.log('🚀 Exporting with options:', htmlOptions);
        
        await exportSopAsHtml(document, htmlOptions);
      } else if (format === "bundle") {
        console.log('🎯 Bundle export triggered with options:', options);
        const { generateTrainingBundle } = await import("@/lib/bundle-generator");
        
        // Map the ExportPanel options to BundleOptions format
        const bundleOptions = {
          pdfOptions: options?.bundleOptions?.pdfOptions || {
            theme: 'professional',
            includeTableOfContents: true,
            includeProgressInfo: true,
            quality: 'high'
          },
          htmlOptions: options?.bundleOptions?.htmlOptions || {
            mode: 'standalone',
            enhanced: true,
            enhancedOptions: {
              theme: 'auto',
              lmsFeatures: {
                enableNotes: true,
                enableBookmarks: true,
                enableSearch: true,
                enableProgressTracking: true
              }
            }
          },
          includeResources: options?.bundleOptions?.includeResources ?? true,
          bundleName: options?.bundleOptions?.bundleName || document.title || "Training-Package",
          includeStyleGuide: options?.includeStyleGuide ?? true,
          includeQuickReference: options?.includeQuickReference ?? true,
          generateThumbnails: options?.generateThumbnails ?? true,
          createFolderStructure: options?.createFolderStructure ?? true
        };
        
        console.log('📦 Generating bundle with options:', bundleOptions);
        
        await generateTrainingBundle(document, bundleOptions);
      }
      
      const exportType = format === "training-module" ? "Training Module" : 
                        format === "bundle" ? "Bundled Training Package" : format.toUpperCase();
      toast({
        title: "Export Successful",
        description: `Your SOP has been exported as ${exportType}`
      });
    } catch (error) {
      console.error("Export error:", error);
      const exportType = format === "training-module" ? "Training Module" : 
                        format === "bundle" ? "Bundled Training Package" : format.toUpperCase();
      toast({
        title: "Export Failed",
        description: `Failed to export SOP as ${exportType}`,
        variant: "destructive"
      });
      throw error;
    }
  }

  static async getPdfPreview(document: SopDocument): Promise<string> {
    try {
      const { generatePDF } = await import("@/lib/pdf-generator");
      return await generatePDF(document);
    } catch (error) {
      console.error("PDF preview error:", error);
      throw error;
    }
  }

  static getProgressInfo(document: SopDocument): { completed: number; total: number; percentage: number } {
    const completed = document.steps.filter(step => step.completed).length;
    const total = document.steps.length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  }
}
