import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Coins, Pickaxe, Zap } from "lucide-react";
import { UpgradeBar } from "./UpgradeBar";
import { FeedbackDialog } from "./FeedbackDialog";
import { AnimatedNotification } from "./AnimatedNotification";
import { gameApi, type GameState, UPGRADE_COSTS, UPGRADE_EFFECTS } from "../lib/api";

interface GameScreenProps {
  userId: string;
  initialState: GameState;
}

interface FeedbackState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function GameScreen({ userId, initialState }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [notification, setNotification] = useState<{
    message: string;
    isVisible: boolean;
  }>({
    message: '',
    isVisible: false
  });

  // Auto-collect passive income every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await gameApi.collect(userId);
        if (result.collected > 0) {
          setNotification({
            message: `Earned ${result.collected} coins while idle!`,
            isVisible: true
          });
          setGameState(result.state);
        }
      } catch (error) {
        // Silent collection - don't show errors for background updates
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  const showFeedback = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setFeedback({ isOpen: true, title, message, type });
  };

  const handleMine = async () => {
    if (isLoading || cooldownRemaining > 0) return;
    
    setIsLoading(true);
    try {
      const newState = await gameApi.mine(userId);
      setGameState(newState);
      showFeedback("Success!", "You mined some coins!", "success");
    } catch (error: any) {
      if (error.response?.data?.message?.includes('cooldown')) {
        const match = error.response.data.message.match(/cooldown:(\d+)s/);
        if (match) {
          setCooldownRemaining(parseInt(match[1]));
        }
        showFeedback("Cooldown Active", "Please wait before mining again.", "info");
      } else if (error.response?.data?.message?.includes('User not found')) {
        showFeedback("Error", "User not found. Please restart the game.", "error");
      } else {
        showFeedback("Error", "Failed to mine coins. Please try again.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (upgradeType: 'autoMiner' | 'superClick') => {
    if (isLoading) return;
    
    const currentLevel = gameState.upgrades[upgradeType];
    if (currentLevel >= 4) {
      showFeedback("Max Level", "This upgrade is already at maximum level!", "info");
      return;
    }

    const cost = UPGRADE_COSTS[upgradeType][currentLevel];
    if (gameState.coins < cost) {
      showFeedback("Not Enough Coins!", `You need ${cost} coins for this upgrade.`, "error");
      return;
    }

    setIsLoading(true);
    try {
      const newState = await gameApi.purchase(userId, upgradeType);
      setGameState(newState);
      showFeedback("Upgrade Purchased!", `${upgradeType === 'autoMiner' ? 'Auto Miner' : 'Super Click'} upgraded!`, "success");
    } catch (error: any) {
      if (error.response?.data?.message?.includes('not_enough_coins')) {
        showFeedback("Not Enough Coins!", "You don't have enough coins for this upgrade.", "error");
      } else if (error.response?.data?.message?.includes('max_level_reached')) {
        showFeedback("Max Level", "This upgrade is already at maximum level!", "info");
      } else {
        showFeedback("Error", "Failed to purchase upgrade. Please try again.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Coins className="h-6 w-6 text-yellow-500" />
              Coin Miner
            </CardTitle>
            <CardDescription>Player ID: {userId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {gameState.coins.toLocaleString()} Coins
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mine Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleMine}
            disabled={isLoading || cooldownRemaining > 0}
            size="lg"
            className="text-xl py-8 px-12"
          >
            <Pickaxe className="mr-2 h-6 w-6" />
            {cooldownRemaining > 0 
              ? `Mine Coins (${cooldownRemaining}s)` 
              : isLoading 
                ? "Mining..." 
                : "Mine Coins"
            }
          </Button>
        </div>

        {/* Upgrades Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upgrades</CardTitle>
            <CardDescription>Improve your mining capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto Miner */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pickaxe className="h-5 w-5" />
                  <span className="font-semibold">Auto Miner</span>
                </div>
                <UpgradeBar type="autoMiner" currentLevel={gameState.upgrades.autoMiner} />
              </div>
              <div className="text-sm text-muted-foreground">
                Level {gameState.upgrades.autoMiner}/4 - {gameState.upgrades.autoMiner > 0 ? UPGRADE_EFFECTS.autoMiner[gameState.upgrades.autoMiner - 1] : "Not upgraded"}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {gameState.upgrades.autoMiner < 4 ? (
                    <div>
                      <div>Next: {UPGRADE_EFFECTS.autoMiner[gameState.upgrades.autoMiner]}</div>
                      <div className="text-xs text-muted-foreground">Cost: {UPGRADE_COSTS.autoMiner[gameState.upgrades.autoMiner]} coins</div>
                    </div>
                  ) : (
                    "Max level reached"
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePurchase('autoMiner')}
                    disabled={isLoading || gameState.upgrades.autoMiner >= 4}
                    size="sm"
                  >
                    Upgrade
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Super Click */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-semibold">Super Click</span>
                </div>
                <UpgradeBar type="superClick" currentLevel={gameState.upgrades.superClick} />
              </div>
              <div className="text-sm text-muted-foreground">
                Level {gameState.upgrades.superClick}/4 - {gameState.upgrades.superClick > 0 ? UPGRADE_EFFECTS.superClick[gameState.upgrades.superClick - 1] : "Not upgraded"}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {gameState.upgrades.superClick < 4 ? (
                    <div>
                      <div>Next: {UPGRADE_EFFECTS.superClick[gameState.upgrades.superClick]}</div>
                      <div className="text-xs text-muted-foreground">Cost: {UPGRADE_COSTS.superClick[gameState.upgrades.superClick]} coins</div>
                    </div>
                  ) : (
                    "Max level reached"
                  )}
                </div>
                <Button
                  onClick={() => handlePurchase('superClick')}
                  disabled={isLoading || gameState.upgrades.superClick >= 4}
                  size="sm"
                >
                  Upgrade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <FeedbackDialog
        isOpen={feedback.isOpen}
        onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
      />

      <AnimatedNotification
        message={notification.message}
        isVisible={notification.isVisible}
        onComplete={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
