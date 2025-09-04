import { useEffect } from "react";
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
  useEffect(() => {
    if (isVisible) {
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onComplete?.();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-20 left-1/2 transform -translate-x-1/2 z-50",
        "bg-green-50 border border-green-200 text-green-800 px-6 py-3 rounded-lg shadow-lg",
        "font-medium text-sm animate-in slide-in-from-top-2 fade-in duration-500",
        className
      )}
    >
      {message}
    </div>
  );
}
