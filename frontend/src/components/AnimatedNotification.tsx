import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

interface AnimatedNotificationProps {
  message: string;
  isVisible: boolean;
  onComplete?: () => void;
  className?: string;
}

export function AnimatedNotification({ 
  message, 
  isVisible, 
  onComplete,
  className 
}: AnimatedNotificationProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShouldRender(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "fixed top-20 left-1/2 transform -translate-x-1/2 z-50",
        "bg-green-50 border border-green-200 text-green-800 px-6 py-3 rounded-lg shadow-lg",
        "animate-in slide-in-from-top-2 duration-300",
        "font-medium text-sm",
        className
      )}
    >
      {message}
    </div>
  );
}
