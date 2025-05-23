
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useSopContext } from "@/context/SopContext";
import { toast } from "@/hooks/use-toast";
import { Download, Upload, FileJson } from "lucide-react";

const JsonDialog = () => {
  const { saveDocumentToJSON, loadDocumentFromJSON } = useSopContext();
  const [jsonFile, setJsonFile] = useState<File | null>(null);

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
  );
};

export default JsonDialog;
