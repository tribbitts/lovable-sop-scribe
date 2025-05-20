
import { Button } from "@/components/ui/button";
import { useSopContext } from "@/context/SopContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";
import { Plus, Settings, Download, Upload, FileJson, FilePdf } from "lucide-react";

const Toolbar = () => {
  const { addStep, saveDocumentToJSON, loadDocumentFromJSON } = useSopContext();
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  
  const handleExport = async () => {
    const { sopDocument } = useSopContext();
    
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

    // Validate that all steps have descriptions and screenshots
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
      if (!step.screenshot) {
        toast({
          title: "Screenshot Required",
          description: `Please add a screenshot for step ${i + 1}.`,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      await generatePDF(sopDocument);
      toast({
        title: "PDF Generated",
        description: "Your SOP has been successfully generated and downloaded."
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
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

  return (
    <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={addStep} 
          className="bg-[#007AFF] hover:bg-[#0069D9] text-white shadow-md transition-all"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Step
        </Button>
      </div>
      
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
        
        <Button 
          onClick={handleExport} 
          variant="default" 
          className="bg-[#007AFF] hover:bg-[#0069D9] text-white shadow-md transition-all flex gap-2"
        >
          <FilePdf className="h-4 w-4" /> Export as PDF
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
