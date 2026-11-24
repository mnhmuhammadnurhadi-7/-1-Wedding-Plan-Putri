export type DonutSegment = { value: number; color: string };

export function Donut({
  segments,
  total,
  label,
  top,
  bottom,
  radius = 52,
  stroke = 20,
  className = "bn-donut",
  topClassName = "bn-dt1",
  bottomClassName = "bn-dt2",
  topY,
}: {
  segments: DonutSegment[];
  total: number;
  label: string;
  top: string;
  bottom?: string;
  radius?: number;
  stroke?: number;
  className?: string;
  topClassName?: string;
  bottomClassName?: string;
  topY?: number;
}) {
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const y = topY ?? (bottom ? 66 : 74);

  return (
    <svg
      className={className}
      viewBox="0 0 140 140"
      role="img"
      aria-label={label}
    >
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke="rgba(140,83,98,.10)"
        strokeWidth={stroke}
      />
      {total > 0
        ? segments
            .filter((segment) => segment.value > 0)
            .map((segment, index) => {
              const length = (segment.value / total) * circumference;
              const dash = `${length.toFixed(2)} ${(circumference - length).toFixed(2)}`;
              const rotation = `rotate(-90 70 70)`;
              const node = (
                <circle
                  key={`${segment.color}-${index}`}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={stroke}
                  strokeDasharray={dash}
                  strokeDashoffset={(-offset).toFixed(2)}
                  transform={rotation}
                />
              );
              offset += length;
              return node;
            })
        : null}
      <text x="70" y={y} textAnchor="middle" className={topClassName}>
        {top}
      </text>
      {bottom ? (
        <text x="70" y={84} textAnchor="middle" className={bottomClassName}>
          {bottom}
        </text>
      ) : null}
    </svg>
  );
}
