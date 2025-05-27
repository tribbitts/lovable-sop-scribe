
import React from "react";
import { AlertContentBlock } from "@/types/enhanced-content";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Info, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface EnhancedAlertBlockProps {
  block: AlertContentBlock;
  isEditing?: boolean;
  onChange?: (updatedBlock: AlertContentBlock) => void;
  onDelete?: () => void;
}

export const EnhancedAlertBlock: React.FC<EnhancedAlertBlockProps> = ({
  block,
  isEditing = false,
  onChange,
  onDelete
}) => {
  const updateTitle = (title: string) => {
    if (onChange) {
      onChange({ ...block, title });
    }
  };

  const updateContent = (content: string) => {
    if (onChange) {
      onChange({ ...block, content });
    }
  };

  const updateVariant = (variant: 'default' | 'destructive' | 'warning' | 'info') => {
    if (onChange) {
      onChange({ ...block, variant });
    }
  };

  const getIcon = () => {
    switch (block.variant) {
      case 'destructive':
        return <XCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (block.variant) {
      case 'destructive':
        return {
          bg: 'bg-red-900/20 border-red-700',
          text: 'text-red-300',
          icon: 'text-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-900/20 border-yellow-700',
          text: 'text-yellow-300',
          icon: 'text-yellow-400'
        };
      case 'info':
        return {
          bg: 'bg-blue-900/20 border-blue-700',
          text: 'text-blue-300',
          icon: 'text-blue-400'
        };
      default:
        return {
          bg: 'bg-green-900/20 border-green-700',
          text: 'text-green-300',
          icon: 'text-green-400'
        };
    }
  };

  const styles = getStyles();

  return (
    <Card className={`${styles.bg} border`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`${styles.icon} mt-0.5`}>
            {getIcon()}
          </div>
          
          <div className="flex-1 space-y-2">
            {isEditing && onDelete && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {isEditing && (
              <div className="space-y-3">
                <Select value={block.variant} onValueChange={updateVariant}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Success</SelectItem>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="destructive">Error</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  value={block.title || ""}
                  onChange={(e) => updateTitle(e.target.value)}
                  placeholder="Alert title..."
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
                
                <Textarea
                  value={block.content}
                  onChange={(e) => updateContent(e.target.value)}
                  placeholder="Alert content..."
                  className="bg-zinc-800 border-zinc-600 text-white"
                  rows={3}
                />
              </div>
            )}
            
            {!isEditing && (
              <>
                {block.title && (
                  <h4 className={`font-semibold ${styles.text}`}>
                    {block.title}
                  </h4>
                )}
                <div className={`${styles.text} whitespace-pre-wrap leading-relaxed`}>
                  {block.content}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
