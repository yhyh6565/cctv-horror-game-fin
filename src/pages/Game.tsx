import GameScene from '../components/scene/GameScene'

interface Props {
  onRetry: () => void
}

export default function Game({ onRetry }: Props) {
  return <GameScene onRetry={onRetry} />
}
