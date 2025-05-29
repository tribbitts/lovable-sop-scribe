
import React from "react";
import { Button } from "@/components/ui/button";

interface CropControlsProps {
  onReset: () => void;
  onCancel: () => void;
  onApply: () => void;
}

const CropControls: React.FC<CropControlsProps> = ({
  onReset,
  onCancel,
  onApply,
}) => {
  return (
    <div className="flex justify-between sm:justify-between">
      <Button
        variant="outline"
        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        onClick={onReset}
      >
        Reset Crop
      </Button>
      <div className="space-x-2">
        <Button
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onApply}
          className="bg-[#007AFF] hover:bg-[#0069D9] text-white"
        >
          Apply Crop
        </Button>
      </div>
    </div>
  );
};

export default CropControls;
