// Decorative motifs: concentric "scanner" rings and the ECG pulse line. Pure SVG + CSS, no JS.

export function Rings({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 800 800" className="h-full w-full motion-safe:animate-spin-slower" fill="none">
        {[118, 196, 274, 352].map((r, i) => (
          <circle
            key={r}
            cx="400"
            cy="400"
            r={r}
            className="stroke-edge"
            strokeOpacity={0.28 - i * 0.04}
            strokeWidth="1.2"
            strokeDasharray="1 9"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <circle cx="400" cy="400" r="235" className="stroke-edge" strokeOpacity="0.06" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <circle cx="674" cy="400" r="4" className="fill-signal" />
        <circle cx="674" cy="400" r="12" className="fill-signal" fillOpacity="0.15" />
      </svg>
    </div>
  );
}

const ECG_SEGMENT = (x: number) =>
  `H${x} l14 -7 l14 7 H${x + 52} l7 5 l10 -46 l10 62 l9 -21 H${x + 128} l16 -12 l16 12`;

/** ECG trace across the full width; a glowing pulse travels along it. */
export function Ecg({ className = '', beats = 4 }: { className?: string; beats?: number }) {
  const width = 1200;
  const step = width / beats;
  let d = 'M0 60 ';
  for (let b = 0; b < beats; b++) d += ECG_SEGMENT(Math.round(b * step + step * 0.32)) + ' ';
  d += `H${width}`;
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${width} 120`} preserveAspectRatio="none" className={`pointer-events-none ${className}`} fill="none">
      <path d={d} className="ecg-base" strokeWidth="1.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={d} pathLength={2400} className="ecg-pulse" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
