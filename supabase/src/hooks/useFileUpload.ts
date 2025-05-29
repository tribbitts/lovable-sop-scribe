
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface FileUploadOptions {
  maxSize?: number; // in bytes, default 10MB
  allowedTypes?: string[]; // default ['image/*']
  onSuccess?: (dataUrl: string, file: File) => void;
  onError?: (error: string) => void;
}

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

/**
 * Fixed file upload hook with proper error handling
 */
export const useFileUpload = (options: FileUploadOptions = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/*'],
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null
  });

  const validateFile = useCallback((file: File): string | null => {
    if (!file) return 'No file selected';

    // Check file type
    const isValidType = allowedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      return file.type === type;
    });

    if (!isValidType) {
      return 'Invalid file type. Please select an image file.';
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return `File too large. Please select an image smaller than ${maxSizeMB}MB.`;
    }

    return null;
  }, [allowedTypes, maxSize]);

  const uploadFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      toast({
        title: "Upload Failed",
        description: validationError,
        variant: "destructive"
      });
      onError?.(validationError);
      return;
    }

    setState(prev => ({ ...prev, isUploading: true, error: null, progress: 0 }));

    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setState(prev => ({ ...prev, progress }));
      }
    };

    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        if (result) {
          setState(prev => ({ ...prev, isUploading: false, progress: 100 }));
          onSuccess?.(result, file);
        } else {
          throw new Error("Failed to read the file");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to read the file";
        setState(prev => ({ ...prev, isUploading: false, error: errorMessage }));
        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive"
        });
        onError?.(errorMessage);
      }
    };

    reader.onerror = () => {
      const errorMessage = "Failed to read the file";
      setState(prev => ({ ...prev, isUploading: false, error: errorMessage }));
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
      onError?.(errorMessage);
    };

    reader.readAsDataURL(file);
  }, [validateFile, onSuccess, onError]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Clear the input value to allow re-uploading the same file
    event.target.value = '';
  }, [uploadFile]);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null
    });
  }, []);

  return {
    ...state,
    uploadFile,
    handleFileChange,
    reset
  };
};
