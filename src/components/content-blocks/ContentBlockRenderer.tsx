
import React from "react";
import { ChecklistBlock } from "./ChecklistBlock";
import { TableBlock } from "./TableBlock";
import { AccordionBlock } from "./AccordionBlock";
import { AlertBlock } from "./AlertBlock";
import { EnhancedContentBlock } from "@/types/enhanced-content";

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
              <div
                key={block.id}
                className={`p-4 rounded-lg ${
                  block.style === 'highlight' ? 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800' :
                  block.style === 'warning' ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800' :
                  block.style === 'info' ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800' :
                  'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {isEditing ? (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(index, { ...block, content: e.target.value })}
                    className="w-full bg-transparent border-none resize-none outline-none"
                    rows={3}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{block.content}</div>
                )}
              </div>
            );

          case 'checklist':
            return (
              <ChecklistBlock
                key={block.id}
                block={block}
                onChange={(updated) => updateBlock(index, updated)}
                {...commonProps}
              />
            );

          case 'table':
            return (
              <TableBlock
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
              <AlertBlock
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
