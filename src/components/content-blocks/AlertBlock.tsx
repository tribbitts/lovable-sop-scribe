
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";
import { AlertContentBlock } from "@/types/enhanced-content";

interface AlertBlockProps {
  block: AlertContentBlock;
  isEditing?: boolean;
  onChange?: (block: AlertContentBlock) => void;
  onDelete?: () => void;
}

export const AlertBlock: React.FC<AlertBlockProps> = ({
  block,
  isEditing = false,
  onChange,
  onDelete
}) => {
  const getAlertIcon = (variant: string) => {
    switch (variant) {
      case 'destructive': return AlertTriangle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
      default: return CheckCircle;
    }
  };

  const IconComponent = getAlertIcon(block.variant);

  if (isEditing) {
    return (
      <div className="space-y-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Alert Block</h3>
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Alert Type</label>
            <Select
              value={block.variant}
              onValueChange={(value: any) => onChange?.({ ...block, variant: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Success</SelectItem>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="destructive">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Title (Optional)</label>
            <Input
              value={block.title || ""}
              onChange={(e) => onChange?.({ ...block, title: e.target.value })}
              placeholder="Alert title..."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Content</label>
            <Textarea
              value={block.content}
              onChange={(e) => onChange?.({ ...block, content: e.target.value })}
              placeholder="Alert content..."
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Alert variant={block.variant === 'default' ? undefined : block.variant as any}>
      <IconComponent className="h-4 w-4" />
      {block.title && <AlertTitle>{block.title}</AlertTitle>}
      <AlertDescription>{block.content}</AlertDescription>
    </Alert>
  );
};
