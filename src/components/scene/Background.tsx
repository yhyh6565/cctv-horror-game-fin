interface Props {
  image: string  // 'bg_0' ~ 'bg_4' | 'bg_win_mirror' | 'bg_bad_ending'
  brightness?: number  // 0-1, default 1
}

export default function Background({ image, brightness = 1 }: Props) {
  return (
    <div
      className="absolute inset-0 z-10 bg-center bg-cover transition-all duration-1000"
      style={{
        backgroundImage: `url(/images/${image}.png)`,
        filter: `brightness(${brightness}) contrast(1.1) saturate(0.8)`,
      }}
    />
  )
}
