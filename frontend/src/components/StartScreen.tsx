import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

/**
 * Props for the StartScreen component
 */
interface StartScreenProps {
  /** Callback function to create a new player */
  onNewPlayer: () => void;
  /** Loading state indicator */
  isLoading: boolean;
}

export function StartScreen({ onNewPlayer, isLoading }: StartScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Coin Miner</CardTitle>
          <CardDescription>
            An idle clicker game for the product engineering challenge!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={onNewPlayer} 
            disabled={isLoading}
            className="w-full text-lg py-6"
            size="lg"
          >
            {isLoading ? "Creating Player..." : "New Player"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
