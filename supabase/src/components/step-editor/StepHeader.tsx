
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, X } from "lucide-react";

interface StepHeaderProps {
  index: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

const StepHeader: React.FC<StepHeaderProps> = ({
  index,
  onMoveUp,
  onMoveDown,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-medium text-white flex items-center">
        <span className="bg-[#007AFF] text-white rounded-full h-8 w-8 inline-flex items-center justify-center mr-3">
          {index + 1}
        </span>
        Step {index + 1}
      </h3>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          onClick={onMoveUp}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          onClick={onMoveDown}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepHeader;
