// src/components/ui/FloorDisplay.tsx

interface Props {
  floor: string   // '1F' ~ '12F'
  glitch?: boolean
}

export default function FloorDisplay({ floor, glitch = false }: Props) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
      <div
        className="px-3 py-1"
        style={{ background: 'rgba(20,10,0,0.85)', border: '1px solid rgba(180,100,0,0.3)' }}
      >
        <span
          className="font-mono text-2xl"
          style={{
            color: glitch ? '#ef4444' : '#f59e0b',
            textShadow: glitch
              ? '2px 0 #f00, -2px 0 #0ff, 0 0 12px rgba(240,0,0,0.8)'
              : '0 0 8px rgba(245,158,11,0.8), 0 0 16px rgba(245,158,11,0.4)',
            animation: glitch ? 'pulse 0.5s infinite' : 'none',
            letterSpacing: '0.15em',
          }}
        >
          [{floor}]
        </span>
      </div>
    </div>
  )
}
