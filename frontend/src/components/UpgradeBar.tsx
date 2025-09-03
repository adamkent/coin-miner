import { Pickaxe, Zap } from "lucide-react";

interface UpgradeBarProps {
  /** Type of upgrade to display */
  type: 'autoMiner' | 'superClick';
  /** Current upgrade level */
  currentLevel: number;
  /** Maximum upgrade level */
  maxLevel?: number;
}

/**
 * Visual upgrade level indicator showing filled/unfilled icons
 * 
 * @param props - The component props
 * @returns JSX element representing the upgrade level bar
 */
export function UpgradeBar({ type, currentLevel, maxLevel = 4 }: UpgradeBarProps) {
  const Icon = type === 'autoMiner' ? Pickaxe : Zap;
  
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxLevel }, (_, index) => {
        const level = index + 1;
        const isActive = level <= currentLevel;
        
        return (
          <div
            key={level}
            className={`p-2 rounded border ${
              isActive 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-muted text-muted-foreground border-muted'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        );
      })}
    </div>
  );
}
