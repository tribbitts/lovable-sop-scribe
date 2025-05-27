
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckSquare, 
  Table, 
  ChevronDown, 
  AlertTriangle,
  Type,
  Plus
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EnhancedContentBlock } from "@/types/enhanced-content";

interface ContentBlockSelectorProps {
  onAddBlock: (block: EnhancedContentBlock) => void;
}

export const ContentBlockSelector: React.FC<ContentBlockSelectorProps> = ({
  onAddBlock
}) => {
  const blockTypes = [
    {
      type: 'text',
      label: 'Text Block',
      icon: Type,
      description: 'Rich text content with styling options',
      create: () => ({
        id: Date.now().toString(),
        type: 'text' as const,
        order: 0,
        content: '',
        style: 'normal' as const
      })
    },
    {
      type: 'checklist',
      label: 'Checklist',
      icon: CheckSquare,
      description: 'Interactive task list',
      create: () => ({
        id: Date.now().toString(),
        type: 'checklist' as const,
        order: 0,
        title: 'New Checklist',
        items: [
          { id: '1', text: 'First item', completed: false }
        ]
      })
    },
    {
      type: 'table',
      label: 'Table',
      icon: Table,
      description: 'Structured data in rows and columns',
      create: () => ({
        id: Date.now().toString(),
        type: 'table' as const,
        order: 0,
        title: 'New Table',
        headers: ['Column 1', 'Column 2'],
        rows: [['', '']]
      })
    },
    {
      type: 'accordion',
      label: 'Expandable Section',
      icon: ChevronDown,
      description: 'Collapsible content section',
      create: () => ({
        id: Date.now().toString(),
        type: 'accordion' as const,
        order: 0,
        title: 'Click to expand',
        content: 'Content goes here...',
        defaultOpen: false
      })
    },
    {
      type: 'alert',
      label: 'Alert Box',
      icon: AlertTriangle,
      description: 'Important notices and warnings',
      create: () => ({
        id: Date.now().toString(),
        type: 'alert' as const,
        order: 0,
        variant: 'info' as const,
        title: 'Important Note',
        content: 'Alert content here...'
      })
    }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Content Block
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2">
          <h3 className="font-medium text-sm mb-2 px-2">Content Blocks</h3>
          <div className="space-y-1">
            {blockTypes.map((blockType) => {
              const IconComponent = blockType.icon;
              return (
                <Button
                  key={blockType.type}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => onAddBlock(blockType.create())}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-4 w-4 mt-0.5 text-zinc-500" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{blockType.label}</div>
                      <div className="text-xs text-zinc-500">{blockType.description}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
