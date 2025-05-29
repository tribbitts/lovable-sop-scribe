
import { toast } from "@/hooks/use-toast";

/**
 * Handles export errors
 */
export const handleExportError = (
  error: unknown, 
  setExportError: (error: string | null) => void,
  isPreview = false
) => {
  console.error(`PDF ${isPreview ? 'preview' : 'generation'} error:`, error);
  setExportError(error instanceof Error ? error.message : "Unknown error");
  toast({
    title: "Error",
    description: error instanceof Error 
      ? `Failed to generate PDF ${isPreview ? 'preview' : ''}: ${error.message}` 
      : `Failed to generate PDF ${isPreview ? 'preview' : ''}. Check console for details.`,
    variant: "destructive"
  });
};
