interface FlowerOfLifeProps {
  size?: number;
  className?: string;
}

export default function FlowerOfLife({ size = 28, className = "" }: FlowerOfLifeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.22;

  const offsets = [
    [0, 0],
    [r, 0],
    [-r, 0],
    [r / 2, r * 0.866],
    [-r / 2, r * 0.866],
    [r / 2, -r * 0.866],
    [-r / 2, -r * 0.866],
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="fol-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4956a" />
          <stop offset="100%" stopColor="#a0855a" />
        </radialGradient>
      </defs>
      {offsets.map(([dx, dy], i) => (
        <circle
          key={i}
          cx={cx + dx}
          cy={cy + dy}
          r={r}
          stroke="url(#fol-grad)"
          strokeWidth={size * 0.032}
          opacity={0.85}
        />
      ))}
      <circle
        cx={cx}
        cy={cy}
        r={r * 2}
        stroke="url(#fol-grad)"
        strokeWidth={size * 0.032}
        opacity={0.35}
      />
    </svg>
  );
}
