import { useState } from 'react'
import { StartScreen } from './components/StartScreen'
import { GameScreen } from './components/GameScreen'
import { FeedbackDialog } from './components/FeedbackDialog'
import { gameApi, type GameState } from './lib/api'

interface FeedbackState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const showFeedback = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setFeedback({ isOpen: true, title, message, type })
  }

  const handleNewPlayer = async () => {
    setIsLoading(true)
    try {
      // Register new player
      const registerResponse = await gameApi.register()
      setUserId(registerResponse.userId)
      
      // Get initial game state
      const initialState = await gameApi.getState(registerResponse.userId)
      setGameState(initialState)
      
      showFeedback("Welcome!", `Player ${registerResponse.userId} created successfully!`, "success")
    } catch (error: any) {
      showFeedback("Error", "Failed to create new player. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  if (!userId || !gameState) {
    return (
      <>
        <StartScreen onNewPlayer={handleNewPlayer} isLoading={isLoading} />
        <FeedbackDialog
          isOpen={feedback.isOpen}
          onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
          title={feedback.title}
          message={feedback.message}
          type={feedback.type}
        />
      </>
    )
  }

  return (
    <GameScreen userId={userId} initialState={gameState} />
  )
}

export default App
