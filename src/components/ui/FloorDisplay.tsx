interface Props {
  floor: string   // '1F' ~ '12F' or '1930819F'
  glitch?: boolean
}

export default function FloorDisplay({ floor, glitch = false }: Props) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
      <span
        className={`font-mono text-red-500 text-2xl tracking-widest ${glitch ? 'animate-pulse' : ''}`}
        style={glitch ? { textShadow: '2px 0 #f00, -2px 0 #0ff' } : {}}
      >
        [{floor}]
      </span>
    </div>
  )
}
