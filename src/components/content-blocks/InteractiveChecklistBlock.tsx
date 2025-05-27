
import React from "react";
import { ChecklistContentBlock } from "@/types/enhanced-content";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";

interface InteractiveChecklistBlockProps {
  block: ChecklistContentBlock;
  isEditing?: boolean;
  onChange?: (updatedBlock: ChecklistContentBlock) => void;
  onDelete?: () => void;
}

export const InteractiveChecklistBlock: React.FC<InteractiveChecklistBlockProps> = ({
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

  const updateItem = (itemId: string, text: string) => {
    if (onChange) {
      const updatedItems = block.items.map(item => 
        item.id === itemId ? { ...item, text } : item
      );
      onChange({ ...block, items: updatedItems });
    }
  };

  const toggleItem = (itemId: string) => {
    if (onChange) {
      const updatedItems = block.items.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      onChange({ ...block, items: updatedItems });
    }
  };

  const addItem = () => {
    if (onChange) {
      const newItem = {
        id: Date.now().toString(),
        text: "",
        completed: false
      };
      onChange({ ...block, items: [...block.items, newItem] });
    }
  };

  const removeItem = (itemId: string) => {
    if (onChange) {
      const updatedItems = block.items.filter(item => item.id !== itemId);
      onChange({ ...block, items: updatedItems });
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <Input
              value={block.title || ""}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="Checklist title..."
              className="bg-zinc-800 border-zinc-600 text-white"
            />
          ) : (
            <h4 className="text-lg font-semibold text-white">
              {block.title || "Checklist"}
            </h4>
          )}
          
          {isEditing && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
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
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
            
            {isEditing ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={item.text}
                  onChange={(e) => updateItem(item.id, e.target.value)}
                  placeholder="Checklist item..."
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <span className={`flex-1 ${item.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                {item.text}
              </span>
            )}
          </div>
        ))}
        
        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Item
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
