
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { ChecklistContentBlock } from "@/types/enhanced-content";

interface ChecklistBlockProps {
  block: ChecklistContentBlock;
  isEditing?: boolean;
  onChange?: (block: ChecklistContentBlock) => void;
  onDelete?: () => void;
}

export const ChecklistBlock: React.FC<ChecklistBlockProps> = ({
  block,
  isEditing = false,
  onChange,
  onDelete
}) => {
  const [newItemText, setNewItemText] = useState("");

  const addItem = () => {
    if (!newItemText.trim() || !onChange) return;
    
    const newItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false
    };
    
    onChange({
      ...block,
      items: [...block.items, newItem]
    });
    
    setNewItemText("");
  };

  const updateItem = (itemId: string, text: string) => {
    if (!onChange) return;
    
    onChange({
      ...block,
      items: block.items.map(item => 
        item.id === itemId ? { ...item, text } : item
      )
    });
  };

  const removeItem = (itemId: string) => {
    if (!onChange) return;
    
    onChange({
      ...block,
      items: block.items.filter(item => item.id !== itemId)
    });
  };

  const toggleItem = (itemId: string) => {
    if (!onChange) return;
    
    onChange({
      ...block,
      items: block.items.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    });
  };

  return (
    <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {isEditing ? (
              <Input
                value={block.title || ""}
                onChange={(e) => onChange?.({ ...block, title: e.target.value })}
                placeholder="Checklist title..."
                className="text-lg font-semibold bg-transparent border-none p-0 h-auto"
              />
            ) : (
              block.title || "Checklist"
            )}
          </CardTitle>
          {isEditing && onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {block.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => toggleItem(item.id)}
              disabled={isEditing}
            />
            {isEditing ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={item.text}
                  onChange={(e) => updateItem(item.id, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <span className={`flex-1 ${item.completed ? 'line-through text-zinc-500' : ''}`}>
                {item.text}
              </span>
            )}
          </div>
        ))}
        
        {isEditing && (
          <div className="flex items-center gap-2 pt-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add new item..."
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              className="flex-1"
            />
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
