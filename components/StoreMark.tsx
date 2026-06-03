interface StoreMarkProps {
  name: string
  size?: number
}

export function StoreMark({ name, size = 40 }: StoreMarkProps) {
  const r = Math.round(size * 0.33)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: 'var(--green-500)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: Math.round(size * 0.42),
        fontWeight: 800,
        fontFamily: 'var(--font-sans)',
        letterSpacing: '-0.01em',
        flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
