import React, { createContext, useState, useContext, ReactNode } from "react";
import { SopDocument, ExportFormat } from "../types/sop";
import { toast } from "@/hooks/use-toast";
import { StorageManager } from "@/utils/storageManager";
import { DocumentManager } from "./managers/DocumentManager";

interface DocumentContextType {
  // Document state
  sopDocument: SopDocument;
  
  // Document metadata operations
  setSopTitle: (title: string) => void;
  setSopTopic: (topic: string) => void;
  setSopDate: (date: string) => void;
  setSopDescription: (description: string) => void;
  setSopVersion: (version: string) => void;
  setSopLastRevised: (lastRevised: string) => void;
  setLogo: (logo: string | null) => void;
  setBackgroundImage: (image: string | null) => void;
  setCompanyName: (name: string) => void;
  
  // Document settings
  setTableOfContents: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setTrainingMode: (enabled: boolean) => void;
  enableProgressTracking: (sessionName?: string) => void;
  disableProgressTracking: () => void;
  
  // Document management
  saveDocumentToJSON: () => void;
  loadDocumentFromJSON: (jsonData: string) => void;
  resetDocument: () => void;
  
  // Export functionality
  exportDocument: (format: ExportFormat | "bundle", options?: any) => Promise<void>;
  getPdfPreview: () => Promise<string>;
  
  // Progress tracking
  getCompletedStepsCount: () => number;
  getProgressPercentage: () => number;
  
  // Internal state updater (for step operations)
  updateDocument: (updater: (prev: SopDocument) => SopDocument) => void;
}

const defaultSopDocument: SopDocument = {
  id: crypto.randomUUID(),
  title: "",
  topic: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  logo: null,
  backgroundImage: null,
  steps: [],
  companyName: "Company Name",
  tableOfContents: true,
  darkMode: false,
  trainingMode: true,
  progressTracking: {
    enabled: false
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

export const DocumentContext = createContext<DocumentContextType>({} as DocumentContextType);

/**
 * Specialized context for document-level operations
 * Handles document metadata, settings, and export functionality
 */
export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [sopDocument, setSopDocument] = useState<SopDocument>(() => {
    const savedDocument = StorageManager.loadDocument();
    if (savedDocument) {
      try {
        return { 
          ...defaultSopDocument, 
          ...savedDocument,
          createdAt: savedDocument.createdAt ? new Date(savedDocument.createdAt) : new Date(),
          updatedAt: savedDocument.updatedAt ? new Date(savedDocument.updatedAt) : new Date()
        };
      } catch (error) {
        console.error("Failed to load saved document:", error);
        toast({
          title: "Warning",
          description: "Failed to load saved document. Starting fresh.",
          variant: "destructive"
        });
      }
    }
    return defaultSopDocument;
  });

  // Document metadata operations
  const setSopTitle = (title: string) => {
    setSopDocument(prev => DocumentManager.updateTitle(prev, title));
  };

  const setSopTopic = (topic: string) => {
    setSopDocument(prev => DocumentManager.updateTopic(prev, topic));
  };

  const setSopDate = (date: string) => {
    setSopDocument(prev => DocumentManager.updateDate(prev, date));
  };

  const setSopDescription = (description: string) => {
    setSopDocument(prev => ({ ...prev, description }));
  };

  const setSopVersion = (version: string) => {
    setSopDocument(prev => ({ ...prev, version }));
  };

  const setSopLastRevised = (lastRevised: string) => {
    setSopDocument(prev => ({ ...prev, lastRevised }));
  };

  const setLogo = (logo: string | null) => {
    setSopDocument(prev => DocumentManager.updateLogo(prev, logo));
  };

  const setBackgroundImage = (image: string | null) => {
    setSopDocument(prev => DocumentManager.updateBackgroundImage(prev, image));
  };

  const setCompanyName = (companyName: string) => {
    setSopDocument(prev => DocumentManager.updateCompanyName(prev, companyName));
  };

  // Document settings
  const setTableOfContents = (enabled: boolean) => {
    setSopDocument(prev => DocumentManager.updateTableOfContents(prev, enabled));
  };

  const setDarkMode = (enabled: boolean) => {
    setSopDocument(prev => DocumentManager.updateDarkMode(prev, enabled));
  };

  const setTrainingMode = (enabled: boolean) => {
    setSopDocument(prev => DocumentManager.updateTrainingMode(prev, enabled));
  };

  const enableProgressTracking = (sessionName?: string) => {
    setSopDocument(prev => DocumentManager.enableProgressTracking(prev, sessionName));
  };

  const disableProgressTracking = () => {
    setSopDocument(prev => DocumentManager.disableProgressTracking(prev));
  };

  // Document management
  const saveDocumentToJSON = () => {
    DocumentManager.saveToJSON(sopDocument);
  };

  const loadDocumentFromJSON = (jsonData: string) => {
    try {
      const parsedDocument = DocumentManager.loadFromJSON(jsonData, defaultSopDocument);
      setSopDocument(parsedDocument);
    } catch (error) {
      console.error("Failed to load document:", error);
    }
  };

  const resetDocument = () => {
    setSopDocument(defaultSopDocument);
    localStorage.removeItem("sop-document-draft");
    toast({
      title: "Document Reset",
      description: "Document has been reset to default state.",
    });
  };

  // Export functionality
  const exportDocument = async (format: ExportFormat | "bundle", options?: any): Promise<void> => {
    return DocumentManager.exportDocument(sopDocument, format, options);
  };

  const getPdfPreview = async (): Promise<string> => {
    return DocumentManager.getPdfPreview(sopDocument);
  };

  // Progress tracking
  const getCompletedStepsCount = (): number => {
    return sopDocument.steps.filter(step => step.completed).length;
  };

  const getProgressPercentage = (): number => {
    if (sopDocument.steps.length === 0) return 0;
    return (getCompletedStepsCount() / sopDocument.steps.length) * 100;
  };

  // Internal state updater for step operations
  const updateDocument = (updater: (prev: SopDocument) => SopDocument) => {
    setSopDocument(updater);
  };

  const contextValue: DocumentContextType = {
    sopDocument,
    setSopTitle,
    setSopTopic,
    setSopDate,
    setSopDescription,
    setSopVersion,
    setSopLastRevised,
    setLogo,
    setBackgroundImage,
    setCompanyName,
    setTableOfContents,
    setDarkMode,
    setTrainingMode,
    enableProgressTracking,
    disableProgressTracking,
    saveDocumentToJSON,
    loadDocumentFromJSON,
    resetDocument,
    exportDocument,
    getPdfPreview,
    getCompletedStepsCount,
    getProgressPercentage,
    updateDocument
  };

  return (
    <DocumentContext.Provider value={contextValue}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocumentContext must be used within a DocumentProvider");
  }
  return context;
};
