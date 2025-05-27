
import React from "react";
import { InteractiveChecklistBlock } from "./InteractiveChecklistBlock";
import { SimpleTableBlock } from "./SimpleTableBlock";
import { AccordionBlock } from "./AccordionBlock";
import { EnhancedAlertBlock } from "./EnhancedAlertBlock";
import { EnhancedContentBlock } from "@/types/enhanced-content";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ContentBlockRendererProps {
  blocks: EnhancedContentBlock[];
  isEditing?: boolean;
  onChange?: (blocks: EnhancedContentBlock[]) => void;
}

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({
  blocks,
  isEditing = false,
  onChange
}) => {
  const updateBlock = (index: number, updatedBlock: EnhancedContentBlock) => {
    if (!onChange) return;
    
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    onChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    if (!onChange) return;
    
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks);
  };

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sortedBlocks.map((block, index) => {
        const commonProps = {
          isEditing,
          onDelete: isEditing ? () => deleteBlock(index) : undefined
        };

        switch (block.type) {
          case 'text':
            return (
              <Card key={block.id} className="bg-zinc-900 border-zinc-700">
                <CardContent className="p-4">
                  {isEditing && (
                    <div className="flex justify-between items-center mb-3">
                      <Select 
                        value={block.style || 'normal'} 
                        onValueChange={(style: 'normal' | 'highlight' | 'warning' | 'info') => 
                          updateBlock(index, { ...block, style })
                        }
                      >
                        <SelectTrigger className="w-40 bg-zinc-800 border-zinc-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal Text</SelectItem>
                          <SelectItem value="highlight">Highlighted</SelectItem>
                          <SelectItem value="warning">Warning Style</SelectItem>
                          <SelectItem value="info">Info Style</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBlock(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className={`p-4 rounded-lg ${
                    block.style === 'highlight' ? 'bg-yellow-900/20 border border-yellow-700' :
                    block.style === 'warning' ? 'bg-red-900/20 border border-red-700' :
                    block.style === 'info' ? 'bg-blue-900/20 border border-blue-700' :
                    'bg-zinc-800 border border-zinc-700'
                  }`}>
                    {isEditing ? (
                      <Textarea
                        value={block.content}
                        onChange={(e) => updateBlock(index, { ...block, content: e.target.value })}
                        placeholder="Enter your text content..."
                        className="bg-transparent border-none resize-none outline-none text-white placeholder:text-zinc-500"
                        rows={4}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-zinc-200 leading-relaxed">
                        {block.content}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );

          case 'checklist':
            return (
              <InteractiveChecklistBlock
                key={block.id}
                block={block}
                onChange={(updated) => updateBlock(index, updated)}
                {...commonProps}
              />
            );

          case 'table':
            return (
              <SimpleTableBlock
                key={block.id}
                block={block}
                onChange={(updated) => updateBlock(index, updated)}
                {...commonProps}
              />
            );

          case 'accordion':
            return (
              <AccordionBlock
                key={block.id}
                block={block}
                onChange={(updated) => updateBlock(index, updated)}
                {...commonProps}
              />
            );

          case 'alert':
            return (
              <EnhancedAlertBlock
                key={block.id}
                block={block}
                onChange={(updated) => updateBlock(index, updated)}
                {...commonProps}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
