interface Props {
  size: number      // 0-100 (% of screen height)
  opacity: number   // 0-1
  position?: 'center' | 'right'
  descending?: boolean  // 탈출 시퀀스 하강
}

export default function GhostSilhouette({ size, opacity, position = 'center', descending = false }: Props) {
  if (opacity === 0) return null
  return (
    <div
      className="absolute z-30 transition-all duration-800"
      style={{
        bottom: descending ? '-20%' : '0',
        left: position === 'right' ? 'auto' : '50%',
        right: position === 'right' ? '0' : 'auto',
        transform: position === 'center' ? 'translateX(-50%)' : 'none',
        opacity,
        transition: 'all 0.8s ease-in-out',
      }}
    >
      <img
        src="/images/ghost_silhouette.png"
        alt=""
        style={{
          height: `${size}vh`,
          filter: 'brightness(0)',
        }}
      />
    </div>
  )
}
