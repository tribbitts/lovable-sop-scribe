
import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, CheckSquare, AlertTriangle, Table2, FileText } from "lucide-react";
import { EnhancedContentBlock } from "@/types/enhanced-content";

interface ContentBlockSelectorProps {
  onAddBlock: (block: EnhancedContentBlock) => void;
}

export const ContentBlockSelector: React.FC<ContentBlockSelectorProps> = ({ onAddBlock }) => {
  const createTextBlock = () => {
    onAddBlock({
      id: Date.now().toString(),
      type: 'text',
      order: 0,
      content: "",
      style: 'normal'
    });
  };

  const createChecklistBlock = () => {
    onAddBlock({
      id: Date.now().toString(),
      type: 'checklist',
      order: 0,
      title: "",
      items: [{ id: Date.now().toString(), text: "", completed: false }]
    });
  };

  const createAlertBlock = () => {
    onAddBlock({
      id: Date.now().toString(),
      type: 'alert',
      order: 0,
      variant: 'info',
      title: "",
      content: ""
    });
  };

  const createTableBlock = () => {
    onAddBlock({
      id: Date.now().toString(),
      type: 'table',
      order: 0,
      title: "",
      headers: ["Column 1", "Column 2"],
      rows: [["", ""], ["", ""]]
    });
  };

  const createAccordionBlock = () => {
    onAddBlock({
      id: Date.now().toString(),
      type: 'accordion',
      order: 0,
      title: "",
      content: "",
      defaultOpen: false
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Content Block
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
        <DropdownMenuItem 
          onClick={createTextBlock}
          className="text-zinc-300 hover:bg-zinc-700 cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-2" />
          Rich Text Block
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={createChecklistBlock}
          className="text-zinc-300 hover:bg-zinc-700 cursor-pointer"
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Interactive Checklist
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={createAlertBlock}
          className="text-zinc-300 hover:bg-zinc-700 cursor-pointer"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Alert/Info Box
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={createTableBlock}
          className="text-zinc-300 hover:bg-zinc-700 cursor-pointer"
        >
          <Table2 className="h-4 w-4 mr-2" />
          Simple Table
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={createAccordionBlock}
          className="text-zinc-300 hover:bg-zinc-700 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Collapsible Section
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
