
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useSubscription } from "@/context/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Upload, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BackgroundSelectorProps {
  onSelectBackground: (url: string | null) => void;
  onCustomUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentBackground: string | null;
}

const BackgroundSelector = ({ 
  onSelectBackground, 
  onCustomUpload,
  currentBackground 
}: BackgroundSelectorProps) => {
  const { isPro } = useSubscription();
  const [selectedOption, setSelectedOption] = useState<string | null>(
    currentBackground ? "custom" : null
  );

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    
    if (value === "none") {
      onSelectBackground(null);
    } else if (value === "custom") {
      // Do nothing - will handle via file upload
    }
  };

  if (!isPro) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs text-zinc-400 border-zinc-700"
          disabled
        >
          <Lock className="h-3 w-3 mr-1" />
          Pro Feature
        </Button>
        <p className="text-xs text-zinc-500">Upgrade to add backgrounds</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Select onValueChange={handleSelect} value={selectedOption || undefined}>
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-zinc-300">
            <SelectValue placeholder="Select background" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-300">
            <SelectItem value="none">No Background</SelectItem>
            <SelectItem value="custom">Custom Upload</SelectItem>
          </SelectContent>
        </Select>

        {selectedOption === "custom" && (
          <label htmlFor="custom-background-upload" className="cursor-pointer">
            <div className="flex items-center justify-center px-3 py-1 bg-zinc-800 border border-dashed border-zinc-700 hover:border-zinc-600 rounded-lg transition-all">
              <Upload className="h-4 w-4 text-zinc-400 mr-1" />
              <span className="text-sm text-zinc-400">Select File</span>
            </div>
            <input
              id="custom-background-upload"
              type="file"
              onChange={onCustomUpload}
              className="hidden"
              accept="image/*"
            />
          </label>
        )}
      </div>

      {/* Preview of current selection */}
      {currentBackground && (
        <div className="mt-2 w-full max-w-[180px] h-[80px] bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
          <img 
            src={currentBackground} 
            alt="Background preview" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="text-xs text-zinc-500 mt-2">
        {selectedOption === "custom" ? 
          "For best results, use a subtle, light-colored image." :
          "Upload a custom background by selecting 'Custom Upload'."}
      </div>
    </div>
  );
};

export default BackgroundSelector;
