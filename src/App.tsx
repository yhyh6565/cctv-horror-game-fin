import { useState } from 'react'
import Game from './pages/Game'

export default function App() {
  const [gameKey, setGameKey] = useState(0)
  return <Game key={gameKey} onRetry={() => setGameKey(k => k + 1)} />
}
