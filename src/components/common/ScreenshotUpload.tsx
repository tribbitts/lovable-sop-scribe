import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, Upload, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

export interface ScreenshotUploadProps {
  onUpload: (dataUrl: string, file: File) => void;
  variant?: 'button' | 'dropzone' | 'inline';
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Unified screenshot upload component
 * Replaces all duplicated upload logic across the application
 */
export const ScreenshotUpload: React.FC<ScreenshotUploadProps> = ({
  onUpload,
  variant = 'button',
  className = '',
  disabled = false,
  children
}) => {
  const { isUploading, progress, handleFileChange } = useFileUpload({
    onSuccess: onUpload
  });

  if (variant === 'dropzone') {
    return (
      <div className={`border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center hover:border-zinc-500 transition-colors ${className}`}>
        <div className="flex flex-col items-center space-y-3">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-zinc-500 animate-spin" />
          ) : (
            <ImagePlus className="h-10 w-10 text-zinc-500" />
          )}
          
          <div className="space-y-2">
            <h3 className="text-zinc-300 font-medium text-lg">
              {isUploading ? 'Uploading...' : 'Add Screenshot'}
            </h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">
              {isUploading 
                ? `${progress}% complete` 
                : 'Upload a screenshot to illustrate this step'
              }
            </p>
          </div>
          
          <div className="relative">
            <Button
              variant="outline"
              className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              disabled={disabled || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </>
              )}
            </Button>
            <Input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`relative ${className}`}>
        {children || (
          <Button
            variant="outline"
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Screenshot
              </>
            )}
          </Button>
        )}
        <Input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
      </div>
    );
  }

  // Default button variant
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        disabled={disabled || isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading... {progress}%
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4 mr-2" />
            {children || 'Upload Image'}
          </>
        )}
      </Button>
      <Input
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
    </div>
  );
}; 