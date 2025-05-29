import React, { ReactNode } from 'react';
import { DocumentProvider } from './DocumentContext';
import { StepProvider } from './StepContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Combined provider that wraps all specialized contexts
 * Provides a clean way to use the refactored context system
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <DocumentProvider>
      <StepProvider>
        {children}
      </StepProvider>
    </DocumentProvider>
  );
};

// Re-export hooks for convenience
export { useDocumentContext } from './DocumentContext';
export { useStepContext } from './StepContext'; 