
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X } from "lucide-react";
import { AccordionContentBlock } from "@/types/enhanced-content";

interface AccordionBlockProps {
  block: AccordionContentBlock;
  isEditing?: boolean;
  onChange?: (block: AccordionContentBlock) => void;
  onDelete?: () => void;
}

export const AccordionBlock: React.FC<AccordionBlockProps> = ({
  block,
  isEditing = false,
  onChange,
  onDelete
}) => {
  if (isEditing) {
    return (
      <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Expandable Section</h3>
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={block.title}
                onChange={(e) => onChange?.({ ...block, title: e.target.value })}
                placeholder="Section title..."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                value={block.content}
                onChange={(e) => onChange?.({ ...block, content: e.target.value })}
                placeholder="Section content..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Accordion type="single" collapsible defaultValue={block.defaultOpen ? "item-1" : undefined}>
      <AccordionItem value="item-1" className="border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <span className="font-medium text-left">{block.title}</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {block.content}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
