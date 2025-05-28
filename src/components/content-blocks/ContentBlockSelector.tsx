import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, CheckSquare, AlertTriangle, Table2, FileText, GitBranch, Globe, Code } from "lucide-react";
import type { EnhancedContentBlock, DecisionTreeNode } from "@/types/enhanced-content";
import { v4 as uuidv4 } from "uuid";

interface ContentBlockSelectorProps {
  onAddBlock: (block: EnhancedContentBlock) => void;
}

export const ContentBlockSelector: React.FC<ContentBlockSelectorProps> = ({ onAddBlock }) => {
  const createTextBlock = () => {
    onAddBlock({
      id: uuidv4(),
      type: 'text',
      order: 0,
      content: "",
      style: 'normal'
    });
  };

  const createChecklistBlock = () => {
    onAddBlock({
      id: uuidv4(),
      type: 'checklist',
      order: 0,
      title: "",
      items: [{ id: uuidv4(), text: "", completed: false }]
    });
  };

  const createAlertBlock = () => {
    onAddBlock({
      id: uuidv4(),
      type: 'alert',
      order: 0,
      variant: 'info',
      title: "",
      content: ""
    });
  };

  const createTableBlock = () => {
    onAddBlock({
      id: uuidv4(),
      type: 'table',
      order: 0,
      title: "",
      headers: ["Column 1", "Column 2"],
      rows: [["", ""], ["", ""]]
    });
  };

  const createAccordionBlock = () => {
    onAddBlock({
      id: uuidv4(),
      type: 'accordion',
      order: 0,
      title: "",
      content: "",
      defaultOpen: false
    });
  };

  const createDecisionTreeBlock = () => {
    const rootNode: DecisionTreeNode = {
      id: uuidv4(),
      question: "What would you like to do?",
      children: [
        {
          id: uuidv4(),
          question: "Option A - Continue to next step",
          isEndNode: true,
          endMessage: "Great! You can proceed to the next step."
        },
        {
          id: uuidv4(),
          question: "Option B - Need more information",
          isEndNode: true,
          endMessage: "Please review the documentation or contact support."
        }
      ]
    };

    onAddBlock({
      id: uuidv4(),
      type: 'decision-tree',
      order: 0,
      title: "Decision Tree",
      description: "Interactive decision pathway",
      rootNode,
      style: {
        nodeColor: "#52525b",
        connectorColor: "#52525b",
        layout: "vertical"
      }
    });
  };

  const createEmbedBlock = () => {
    onAddBlock({
      id: uuidv4(),
      type: 'embed',
      order: 0,
      title: "Embedded Content",
      url: "",
      embedType: 'youtube',
      aspectRatio: '16:9',
      allowFullscreen: true,
      allowAutoplay: false
    });
  };

  const createCodeBlock = () => {
    onAddBlock({
      id: uuidv4(),
      type: 'code',
      order: 0,
      title: "Code Example",
      code: "// Your code here\nconsole.log('Hello, World!');",
      language: 'javascript',
      theme: 'dark',
      showLineNumbers: true,
      showLanguage: true,
      allowCopy: true,
      wrap: false
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
      
      <DropdownMenuContent className="bg-zinc-800 border-zinc-700 w-56">
        {/* Basic Content Blocks */}
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

        <DropdownMenuSeparator className="bg-zinc-700" />

        {/* Advanced Content Blocks */}
        <DropdownMenuItem 
          onClick={createDecisionTreeBlock}
          className="text-zinc-300 hover:bg-zinc-700 cursor-pointer"
        >
          <GitBranch className="h-4 w-4 mr-2" />
          Decision Tree
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={createEmbedBlock}
          className="text-zinc-300 hover:bg-zinc-700 cursor-pointer"
        >
          <Globe className="h-4 w-4 mr-2" />
          Embed Content
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={createCodeBlock}
          className="text-zinc-300 hover:bg-zinc-700 cursor-pointer"
        >
          <Code className="h-4 w-4 mr-2" />
          Code Block
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
