
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

interface BackgroundOption {
  id: string;
  name: string;
  url: string;
}

interface BackgroundSelectorProps {
  onSelectBackground: (url: string | null) => void;
  onCustomUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentBackground: string | null;
}

// Premium background options - minimalist business-focused designs
const backgroundOptions: BackgroundOption[] = [
  { 
    id: "gradient-blue", 
    name: "Blue Gradient", 
    url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxIDEiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxsaW5lYXJHcmFkaWVudCBpZD0iZzk0OCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIHN0b3AtY29sb3I9IiNmMGY5ZmYiIG9mZnNldD0iMCIvPjxzdG9wIHN0b3AtY29sb3I9IiM4YmQwZmIiIG9mZnNldD0iMSIvPjwvbGluZWFyR3JhZGllbnQ+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNnOTQ4KSIgLz48L3N2Zz4=" 
  },
  { 
    id: "subtle-dots", 
    name: "Subtle Dots", 
    url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNlNmU2ZTYiLz48L3N2Zz4=" 
  },
  { 
    id: "grey-geometric", 
    name: "Grey Geometric", 
    url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+PHBhdGggZD0iTTAgMGg1MHY1MEgwVjB6bTEgMXY0OGg0OFYxSDEiIGZpbGw9IiNmYWZhZmEiLz48cGF0aCBkPSJNMSAxaDQ4djQ4SDFWMXptMSAxdjQ2aDQ2VjJIMiIgZmlsbD0iI2Y1ZjVmNSIvPjwvc3ZnPg==" 
  },
  { 
    id: "light-paper", 
    name: "Light Paper", 
    url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxwYXRoIGQ9Ik0wIDBoMXYxSDB6TTIgMmgxdjFIMnoiIGZpbGw9IiNmNWY1ZjUiIG9wYWNpdHk9IjAuNCIvPjwvc3ZnPg==" 
  },
  { 
    id: "clean-lines", 
    name: "Clean Lines", 
    url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDYwSDBWMGg2MHYzMHoiIGZpbGw9IiNmZmZmZmYiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMHoiIGZpbGw9IiNmOWY5ZjkiLz48L3N2Zz4=" 
  }
];

const BackgroundSelector = ({ 
  onSelectBackground, 
  onCustomUpload,
  currentBackground 
}: BackgroundSelectorProps) => {
  const { isPro } = useSubscription();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    
    if (value === "none") {
      onSelectBackground(null);
    } else if (value === "custom") {
      // Do nothing - will handle via file upload
    } else {
      const option = backgroundOptions.find(bg => bg.id === value);
      if (option) {
        onSelectBackground(option.url);
        toast({
          title: "Background Selected",
          description: `${option.name} background applied to your SOP.`
        });
      }
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
            {backgroundOptions.map(option => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
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
    </div>
  );
};

export default BackgroundSelector;
