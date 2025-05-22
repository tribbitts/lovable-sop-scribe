
import { useState } from "react";

export function useCalloutEditor() {
  const [isEditingCallouts, setIsEditingCallouts] = useState(false);
  const [calloutColor, setCalloutColor] = useState<string>("#FF719A");
  const [showCalloutCursor, setShowCalloutCursor] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleScreenshotMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingCallouts || !e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCursorPosition({ x, y });
  };

  const handleScreenshotMouseEnter = () => {
    if (isEditingCallouts) {
      setShowCalloutCursor(true);
    }
  };

  const handleScreenshotMouseLeave = () => {
    setShowCalloutCursor(false);
  };

  const toggleEditMode = () => {
    setIsEditingCallouts(!isEditingCallouts);
  };

  return {
    isEditingCallouts,
    setIsEditingCallouts,
    calloutColor,
    setCalloutColor,
    showCalloutCursor,
    cursorPosition,
    handleScreenshotMouseMove,
    handleScreenshotMouseEnter,
    handleScreenshotMouseLeave,
    toggleEditMode
  };
}
