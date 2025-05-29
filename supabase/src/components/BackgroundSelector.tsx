import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Define predefined backgrounds
const PREDEFINED_BACKGROUNDS = [
  { id: 'bg1', name: 'Abstract Blue', path: '/backgrounds/bg1.png' },
  { id: 'bg2', name: 'Geometric Green', path: '/backgrounds/bg2.png' },
  { id: 'bg3', name: 'Minimalist Grey', path: '/backgrounds/bg3.png' },
  { id: 'bg4', name: 'Warm Waves', path: '/backgrounds/bg4.png' },
  { id: 'bg5', name: 'Tech Lines', path: '/backgrounds/bg5.png' },
];

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
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentBackground);
  const [showCustomUpload, setShowCustomUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    if (value === "custom") {
      setShowCustomUpload(true);
    } else if (value === "none") {
      onSelectBackground(null);
      setShowCustomUpload(false);
    } else {
      onSelectBackground(value);
      setShowCustomUpload(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCustomUpload(e);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setUploadError(null);
      };
      reader.onerror = () => {
        setUploadError("Failed to read file for preview.");
        toast({
          title: "Error",
          description: "Could not read the selected file for preview.",
          variant: "destructive",
        });
      }
      reader.readAsDataURL(file);
      setShowCustomUpload(false);
    } else {
      setUploadError("No file selected.");
    }
  };

  useEffect(() => {
    if (currentBackground) {
      const predefined = PREDEFINED_BACKGROUNDS.find(bg => bg.path === currentBackground);
      if (predefined) {
        setSelectedOption(predefined.name);
        setPreviewUrl(predefined.path);
      } else if (currentBackground.startsWith('blob:') || currentBackground.startsWith('data:')) {
        setSelectedOption('Custom');
        setPreviewUrl(currentBackground);
      } else {
        const fileName = currentBackground.split('/').pop();
        setSelectedOption(fileName ? `Custom: ${fileName}` : 'Custom');
        setPreviewUrl(currentBackground);
      }
    } else {
      setSelectedOption('No Background');
      setPreviewUrl(null);
    }
  }, [currentBackground]);

  if (!isPro && !currentBackground) {
    return (
      <div className="flex flex-col space-y-2 w-full">
        <label className="text-sm font-medium text-zinc-400">
          Background Image (Pro only)
        </label>
        <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center">
          <Lock className="w-4 h-4 mr-2 text-yellow-500 shrink-0" />
          <span className="text-sm text-zinc-400">
            Upgrade to Pro to upload custom backgrounds and use predefined ones.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2 w-full">
      <label className="text-sm font-medium text-zinc-400">
        Background Image {isPro ? "" : "(Pro only - using current selection)"}
      </label>
      <Select
        onValueChange={handleSelect}
        value={currentBackground || 'none'}
        disabled={!isPro}
      >
        <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed">
          <SelectValue placeholder="Select a background">
            {selectedOption || "Select a background"} 
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-300">
          <SelectItem value="none">No Background</SelectItem>
          {PREDEFINED_BACKGROUNDS.map((bg) => (
            <SelectItem key={bg.id} value={bg.path}>
              {bg.name}
            </SelectItem>
          ))}
          <SelectItem value="custom">Upload Custom Background</SelectItem>
        </SelectContent>
      </Select>

      {previewUrl && selectedOption !== 'No Background' && (
        <div className="mt-2 w-full aspect-[16/9] max-h-[100px] bg-zinc-700 border border-zinc-600 rounded-md overflow-hidden flex items-center justify-center">
          <img
            src={previewUrl}
            alt={`${selectedOption} background preview`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {!previewUrl && selectedOption !== 'No Background' && selectedOption !== '' && (
         <div className="mt-2 w-full aspect-[16/9] max-h-[100px] bg-zinc-700 border border-zinc-600 rounded-md flex items-center justify-center text-zinc-400 text-xs">
            <span>Preview will appear here.</span>
        </div>
      )}

      {showCustomUpload && isPro && (
        <div className="mt-4 space-y-2">
          <label htmlFor="custom-background-upload" className="block text-sm font-medium text-zinc-400">
            Upload Custom Image (max 2MB)
          </label>
          <input
            id="custom-background-upload"
            type="file"
            accept="image/*,.heic,.heif"
            onChange={handleFileChange}
            className="w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-zinc-300 hover:file:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isPro}
          />
          {uploadError && <p className="text-red-500 text-sm mt-1">{uploadError}</p>}
        </div>
      )}

      {!isPro && currentBackground && (
        <div className="mt-2 text-sm text-zinc-500">
            Custom backgrounds are a Pro feature. Your current selection will be used.
        </div>
      )}
       <p className="text-xs text-zinc-500 mt-1">
        {isPro
          ? "Changes saved automatically."
          : ""}
      </p>
    </div>
  );
};

export default BackgroundSelector;
