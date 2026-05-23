interface Props {
  size: number         // 0-100 (% of screen height)
  opacity: number      // 0-1
  position?: 'center' | 'right'
  descending?: boolean
  approaching?: boolean   // Phase 2 타이머 중 앞으로 기울어짐
  frameIntrude?: boolean  // BAD_ENDING 직전 화면 가득 채우기
}

export default function GhostSilhouette({
  size,
  opacity,
  position = 'center',
  descending = false,
  approaching = false,
  frameIntrude = false,
}: Props) {
  if (opacity === 0) return null

  const baseTransform = position === 'center' ? 'translateX(-50%)' : 'none'

  return (
    <div
      className="absolute"
      style={{
        bottom: descending ? '-20%' : '0',
        left: position === 'right' ? 'auto' : '50%',
        right: position === 'right' ? '0' : 'auto',
        transform: baseTransform,
        opacity: frameIntrude ? 1 : opacity,
        transition: frameIntrude
          ? 'all 0.4s ease-in'
          : 'all 0.8s ease-in-out',
        zIndex: frameIntrude ? 60 : 30,
      }}
    >
      <img
        src="/images/ghost_silhouette.png"
        alt=""
        style={{
          height: frameIntrude ? '250vh' : `${size}vh`,
          filter: 'brightness(0) blur(2px)',
          animation: approaching && !frameIntrude
            ? 'ghostApproach 1500ms ease-in forwards'
            : 'none',
        }}
      />
    </div>
  )
}
