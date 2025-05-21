
import { Button } from "@/components/ui/button";
import { useSopContext } from "@/context/SopContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";
import { Download, Upload, FileJson, FileText, Eye, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { createPdfUsageRecord } from "@/lib/supabase";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Toolbar = () => {
  const { saveDocumentToJSON, loadDocumentFromJSON, sopDocument } = useSopContext();
  const { user } = useAuth();
  const { canGeneratePdf, incrementPdfCount, tier, refreshSubscription } = useSubscription();
  
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  
  const handleExport = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to export PDFs.",
        variant: "destructive"
      });
      return;
    }

    if (!canGeneratePdf) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily PDF export limit. Upgrade to Pro for unlimited exports.",
        variant: "destructive"
      });
      return;
    }

    // Clear previous errors and progress
    setExportError(null);
    setExportProgress(null);
    
    // Validate document before starting
    if (!sopDocument.title) {
      toast({
        title: "SOP Title Required",
        description: "Please provide a title for your SOP document.",
        variant: "destructive"
      });
      return;
    }

    if (!sopDocument.topic) {
      toast({
        title: "Topic Required",
        description: "Please provide a topic for your SOP document.",
        variant: "destructive"
      });
      return;
    }

    // Validate that at least one step exists
    if (sopDocument.steps.length === 0) {
      toast({
        title: "No Steps Found",
        description: "Please add at least one step to your SOP document.",
        variant: "destructive"
      });
      return;
    }

    // Validate that all steps have descriptions
    for (let i = 0; i < sopDocument.steps.length; i++) {
      const step = sopDocument.steps[i];
      if (!step.description) {
        toast({
          title: "Step Description Required",
          description: `Please provide a description for step ${i + 1}.`,
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      setIsExporting(true);
      setExportProgress("Preparing document...");
      
      toast({
        title: "Creating PDF",
        description: "Please wait while your PDF is being generated..."
      });
      
      console.log("Starting PDF export");
      
      // Track progress with console logs
      const originalConsoleLog = console.log;
      console.log = (message, ...args) => {
        originalConsoleLog(message, ...args);
        if (typeof message === 'string') {
          if (message.includes("Creating cover page")) {
            setExportProgress("Creating cover page...");
          } else if (message.includes("Rendering")) {
            setExportProgress("Rendering steps...");
          } else if (message.includes("Steps rendered")) {
            setExportProgress("Finalizing document...");
          }
        }
      };
      
      const pdfDataUrl = await generatePDF(sopDocument);
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      if (!pdfDataUrl) {
        throw new Error("PDF generation returned empty result");
      }
      
      setExportProgress("Recording usage...");
      
      // Record PDF usage in database
      if (user) {
        try {
          await createPdfUsageRecord(user.id);
          incrementPdfCount();
          await refreshSubscription();
        } catch (err) {
          console.error("Error recording PDF usage:", err);
          // Continue even if usage recording fails
        }
      }
      
      setExportProgress(null);
      toast({
        title: "PDF Generated",
        description: "Your SOP has been successfully generated and downloaded."
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      setExportError(error instanceof Error ? error.message : "Unknown error");
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to generate PDF: ${error.message}` 
          : "Failed to generate PDF. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJsonFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (!jsonFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (e.target?.result) {
          loadDocumentFromJSON(e.target.result as string);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load the file. Please try again with a valid SOP JSON file.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(jsonFile);
  };

  const handlePreview = async () => {
    if (!sopDocument.title || !sopDocument.topic) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and topic before previewing.",
        variant: "destructive"
      });
      return;
    }
    
    // Clear previous errors and progress
    setExportError(null);
    setExportProgress(null);
    setPdfPreviewUrl(null);
    
    try {
      // Show loading toast
      toast({
        title: "Generating Preview",
        description: "Creating PDF preview..."
      });
      
      setIsExporting(true);
      setExportProgress("Preparing preview...");
      
      // Track progress with console logs for preview too
      const originalConsoleLog = console.log;
      console.log = (message, ...args) => {
        originalConsoleLog(message, ...args);
        if (typeof message === 'string') {
          if (message.includes("Creating cover page")) {
            setExportProgress("Creating cover page...");
          } else if (message.includes("Rendering")) {
            setExportProgress("Rendering steps...");
          } else if (message.includes("Steps rendered")) {
            setExportProgress("Finalizing preview...");
          }
        }
      };
      
      // Generate PDF and get base64 data URL
      const pdfDataUrl = await generatePDF(sopDocument);
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      if (!pdfDataUrl) {
        throw new Error("PDF preview generation returned empty result");
      }
      
      // Set the preview URL and open modal
      setPdfPreviewUrl(pdfDataUrl);
      setIsPreviewOpen(true);
      setExportProgress(null);
      
      toast({
        title: "Preview Ready",
        description: "PDF preview has been generated."
      });
    } catch (error) {
      console.error("PDF preview error:", error);
      setExportError(error instanceof Error ? error.message : "Unknown error");
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to generate PDF preview: ${error.message}` 
          : "Failed to generate PDF preview. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="flex flex-wrap justify-end items-center mb-6 gap-2">
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white flex gap-2">
              <FileJson className="h-4 w-4" /> Save/Load
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Save or Load SOP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Button 
                onClick={saveDocumentToJSON} 
                className="w-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" /> Download as JSON
              </Button>
              
              <div className="space-y-2">
                <Label htmlFor="json-file" className="text-zinc-300">Load from JSON</Label>
                <div className="flex gap-2">
                  <Input
                    id="json-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  <Button 
                    onClick={handleFileUpload} 
                    disabled={!jsonFile} 
                    className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 flex items-center"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* PDF Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <Button
            onClick={handlePreview}
            variant="outline"
            disabled={isExporting || sopDocument.steps.length === 0}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white flex gap-2"
          >
            <Eye className="h-4 w-4" /> {isExporting && exportProgress === "Preparing preview..." ? "Creating Preview..." : "Preview"}
          </Button>
          
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-4xl w-[90vw] h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-white">PDF Preview</DialogTitle>
            </DialogHeader>
            <div className="w-full h-full overflow-hidden rounded-lg mt-4">
              {isExporting && exportProgress && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 p-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007AFF] mb-4"></div>
                  <p className="text-white text-lg">{exportProgress}</p>
                </div>
              )}
              {!isExporting && pdfPreviewUrl && (
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full h-full border-0 rounded"
                  title="PDF Preview"
                />
              )}
              {!isExporting && !pdfPreviewUrl && exportError && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                  <h3 className="text-xl font-semibold text-red-400 mb-2">PDF Generation Failed</h3>
                  <p className="text-red-400 mb-4">Error: {exportError}</p>
                  <Alert variant="destructive" className="max-w-md">
                    <AlertTitle>Troubleshooting Tips</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4 space-y-1 mt-2">
                        <li>Check that all images are valid and properly formatted</li>
                        <li>Try removing complex images or screenshots</li>
                        <li>Make sure all steps have descriptions</li>
                        <li>Try refreshing the browser and trying again</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          onClick={handleExport} 
          variant="default" 
          disabled={isExporting || sopDocument.steps.length === 0 || !canGeneratePdf}
          className={`${canGeneratePdf ? 'bg-[#007AFF] hover:bg-[#0069D9]' : 'bg-zinc-700'} text-white shadow-md transition-all flex gap-2`}
        >
          {!canGeneratePdf ? (
            <>
              <Lock className="h-4 w-4" />
              {tier === "free" ? "Daily Limit Reached" : "Export as PDF"}
            </>
          ) : isExporting ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
              {exportProgress || "Creating PDF..."}
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Export as PDF
            </>
          )}
        </Button>
        
        {exportError && !isPreviewOpen && (
          <Alert variant="destructive" className="w-full mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error generating PDF</AlertTitle>
            <AlertDescription className="text-sm">
              {exportError}. Check browser console for details.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
