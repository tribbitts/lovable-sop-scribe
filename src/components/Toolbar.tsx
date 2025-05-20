
import { Button } from "@/components/ui/button";
import { useSopContext } from "@/context/SopContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";

const Toolbar = () => {
  const { sopDocument, addStep, setCompanyName, saveDocumentToJSON, loadDocumentFromJSON } = useSopContext();
  const [companyNameInput, setCompanyNameInput] = useState(sopDocument.companyName);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  
  const handleExport = async () => {
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

  const handleSaveSettings = () => {
    setCompanyName(companyNameInput);
    toast({
      title: "Settings Saved",
      description: "Company name has been updated."
    });
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
        <Button onClick={addStep}>Add Step</Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Settings</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>SOP Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyNameInput}
                  onChange={(e) => setCompanyNameInput(e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <Button onClick={handleSaveSettings} className="w-full">Save Settings</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Save/Load</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save or Load SOP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Button onClick={saveDocumentToJSON} className="w-full">
                Download as JSON
              </Button>
              
              <div className="space-y-2">
                <Label htmlFor="json-file">Load from JSON</Label>
                <div className="flex gap-2">
                  <Input
                    id="json-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                  />
                  <Button onClick={handleFileUpload} disabled={!jsonFile}>
                    Load
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button onClick={handleExport} variant="default">
          Export as PDF
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
