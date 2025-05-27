import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SopDocument } from "@/types/sop";
import { generatePDF, generatePDFFromHTML, downloadPDFWithBrowserPrint } from "@/lib/pdf-generator";
import { FileText, Printer, Download, Sparkles, Zap, Info } from "lucide-react";
import { toast } from "sonner";

interface PdfExportOptionsProps {
  sopDocument: SopDocument;
  onClose?: () => void;
}

const PdfExportOptions: React.FC<PdfExportOptionsProps> = ({ sopDocument, onClose }) => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleStandardPdfGeneration = async () => {
    setIsGenerating('standard');
    try {
      await generatePDF(sopDocument);
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("PDF generation failed. Please try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleHtmlToPdfGeneration = async () => {
    setIsGenerating('html');
    try {
      await downloadPDFWithBrowserPrint(sopDocument);
      toast.success("PDF generation window opened! Use your browser's print dialog to save as PDF.");
    } catch (error) {
      console.error("HTML-to-PDF generation failed:", error);
      toast.error("PDF generation failed. Please ensure popups are allowed for this site.");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Choose PDF Export Method</h2>
        <p className="text-zinc-400">Select the best option for your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standard PDF Generation */}
        <Card className="bg-zinc-800 border-zinc-700 hover:border-blue-500/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              Standard PDF Export
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                <Zap className="h-3 w-3 mr-1" />
                Fast
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                Reliable
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-300 text-sm">
              Programmatic PDF generation with consistent SOPify business styling. 
              Downloads automatically with no additional steps required.
            </p>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Features:</h4>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• Automatic download</li>
                <li>• Consistent SOPify branding</li>
                <li>• Professional business styling</li>
                <li>• Works in all browsers</li>
                <li>• No popup requirements</li>
              </ul>
            </div>

            <Button
              onClick={handleStandardPdfGeneration}
              disabled={isGenerating === 'standard'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating === 'standard' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Standard PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* HTML-to-PDF Generation */}
        <Card className="bg-zinc-800 border-zinc-700 hover:border-purple-500/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Printer className="h-5 w-5 text-purple-400" />
              </div>
              Demo-Style PDF Export
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Exact Demo Match
              </Badge>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                Browser Print
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-300 text-sm">
              Uses browser's native print functionality to preserve the exact styling 
              from the business demo HTML. Perfect pixel-perfect reproduction.
            </p>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Features:</h4>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• Exact demo HTML styling</li>
                <li>• Perfect font rendering</li>
                <li>• Native browser print quality</li>
                <li>• Preserves all CSS styling</li>
                <li>• Professional gradients</li>
              </ul>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-amber-200 text-xs">
                  <p className="font-medium mb-1">How it works:</p>
                  <p>Opens a new window with the styled document. Use your browser's print dialog and select "Save as PDF" for the best results.</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleHtmlToPdfGeneration}
              disabled={isGenerating === 'html'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGenerating === 'html' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Opening Print Window...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Generate Demo-Style PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          Recommendation
        </h3>
        <p className="text-zinc-300 text-sm">
          For the closest match to the business demo styling, use the <strong>Demo-Style PDF Export</strong>. 
          For quick, reliable downloads without any additional steps, use the <strong>Standard PDF Export</strong>.
        </p>
      </div>

      {onClose && (
        <div className="text-center">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default PdfExportOptions; 