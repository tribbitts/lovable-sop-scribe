
/**
 * Sets up progress tracking via console.log
 */
export const setupProgressTracking = (setExportProgress: (progress: string) => void) => {
  const originalConsoleLog = console.log;
  console.log = (message, ...args) => {
    originalConsoleLog(message, ...args);
    if (typeof message === 'string') {
      if (message.includes("Creating cover page")) {
        setExportProgress("Creating cover page...");
      } else if (message.includes("Rendering")) {
        setExportProgress("Rendering steps...");
      } else if (message.includes("Steps rendered")) {
        setExportProgress("Finalizing document...");
      }
    }
  };
  
  return originalConsoleLog;
};
