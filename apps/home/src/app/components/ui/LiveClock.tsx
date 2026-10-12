'use client';

import { useEffect, useMemo, useState } from 'react';

export interface LiveClockProps {
  seconds?: boolean;
  /** Text after the time, e.g. "IST". Set to '' to hide. */
  suffix?: string;
  className?: string;
}

/** Live India Standard Time. Renders a stable placeholder on the server, then ticks on the second. */
export default function LiveClock({ seconds = true, suffix = 'IST', className = '' }: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        ...(seconds ? { second: '2-digit' as const } : {}),
        hour12: false,
        timeZone: 'Asia/Kolkata',
      }),
    [seconds],
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    setNow(new Date());
    // align ticks to the start of each second
    const align = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), seconds ? 1000 : 15000);
    }, 1000 - (Date.now() % 1000));
    return () => {
      clearTimeout(align);
      if (interval) clearInterval(interval);
    };
  }, [seconds]);

  const text = now ? fmt.format(now) : seconds ? '--:--:--' : '--:--';

  return (
    <time className={`mono-num ${className}`} dateTime={now ? now.toISOString() : undefined} suppressHydrationWarning>
      {text}
      {suffix && <span className="ml-1.5 opacity-60">{suffix}</span>}
    </time>
  );
}
