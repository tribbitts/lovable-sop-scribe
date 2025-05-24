// Storage management utilities for handling localStorage quota
export class StorageManager {
  private static readonly MAX_STORAGE_SIZE = 4.5 * 1024 * 1024; // 4.5MB (safe limit for 5MB quota)
  private static readonly STORAGE_KEY = "sop-document-draft";

  static getStorageSize(): number {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
    return total;
  }

  static canStore(data: string): boolean {
    const currentSize = this.getStorageSize();
    const dataSize = new Blob([data]).size;
    return (currentSize + dataSize) < this.MAX_STORAGE_SIZE;
  }

  static compressDocument(document: any): any {
    const compressed = { ...document };
    
    // Compress screenshots by reducing quality or removing secondary screenshots
    if (compressed.steps) {
      compressed.steps = compressed.steps.map((step: any) => {
        if (step.screenshot) {
          const screenshot = { ...step.screenshot };
          
          // If we have both primary and secondary screenshots, remove secondary to save space
          if (screenshot.secondaryDataUrl) {
            delete screenshot.secondaryDataUrl;
            delete screenshot.secondaryCallouts;
          }
          
          // If still too large, we could implement image compression here
          step.screenshot = screenshot;
        }
        return step;
      });
    }
    
    return compressed;
  }

  static saveDocument(document: any): boolean {
    try {
      const jsonData = JSON.stringify(document);
      
      if (this.canStore(jsonData)) {
        localStorage.setItem(this.STORAGE_KEY, jsonData);
        return true;
      } else {
        // Try with compressed version
        const compressed = this.compressDocument(document);
        const compressedData = JSON.stringify(compressed);
        
        if (this.canStore(compressedData)) {
          localStorage.setItem(this.STORAGE_KEY, compressedData);
          console.warn("Document saved with compression due to storage limits");
          return true;
        } else {
          // If still too large, clear old data and try again
          this.clearOldData();
          localStorage.setItem(this.STORAGE_KEY, compressedData);
          console.warn("Cleared old data and saved compressed document");
          return true;
        }
      }
    } catch (error) {
      console.error("Failed to save document to localStorage:", error);
      return false;
    }
  }

  static loadDocument(): any | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load document from localStorage:", error);
      return null;
    }
  }

  static clearOldData(): void {
    // Clear other potential cache data but keep our document
    const documentData = localStorage.getItem(this.STORAGE_KEY);
    
    // Clear everything except our document
    const keysToKeep = [this.STORAGE_KEY];
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log("Cleared old localStorage data to free up space");
  }

  static getStorageInfo(): { used: number; max: number; percentage: number } {
    const used = this.getStorageSize();
    const max = this.MAX_STORAGE_SIZE;
    const percentage = Math.round((used / max) * 100);
    
    return { used, max, percentage };
  }
}
