import { useEffect, useRef, useState } from 'react';

interface Props {
  // When true, countdown is running. Flipping false stops & resets.
  active: boolean;
  durationSec: number;
  onDurationChange: (sec: number) => void;
}

const MIN_DURATION = 10; // seconds
const MAX_DURATION = 60 * 60; // 1 hour
const PRESETS: { label: string; sec: number }[] = [
  { label: '30с', sec: 30 },
  { label: '1м', sec: 60 },
  { label: '3м', sec: 180 },
  { label: '5м', sec: 300 },
];

function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.ceil(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function CountdownTimer({ active, durationSec, onDurationChange }: Props) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const intervalRef = useRef<number | null>(null);

  // Start/stop based on `active`.
  useEffect(() => {
    if (active && startedAt === null) {
      setStartedAt(Date.now());
    } else if (!active && startedAt !== null) {
      setStartedAt(null);
    }
  }, [active, startedAt]);

  // Tick while running.
  useEffect(() => {
    if (startedAt === null) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    setNow(Date.now());
    intervalRef.current = window.setInterval(() => setNow(Date.now()), 250);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startedAt]);

  const elapsed = startedAt === null ? 0 : (now - startedAt) / 1000;
  const remaining = startedAt === null ? durationSec : Math.max(0, durationSec - elapsed);
  const finished = startedAt !== null && remaining <= 0;
  const running = startedAt !== null && !finished;

  const stateStyles = finished
    ? 'border-red-400/60 bg-red-500/15 text-red-100 animate-pulse-glow'
    : running
      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
      : 'border-white/10 bg-white/5 text-white/70';

  return (
    <div
      className={[
        'inline-flex items-center gap-2 rounded-xl border px-2.5 py-1 transition-colors',
        stateStyles,
      ].join(' ')}
      title={
        finished
          ? 'Время вышло!'
          : running
            ? 'Идёт отсчёт'
            : 'Таймер запустится с первым выбором'
      }
    >
      <span className="text-base leading-none" aria-hidden="true">
        {finished ? '⏰' : running ? '⏱️' : '⌛'}
      </span>

      {/* Time display */}
      <span
        className={[
          'font-mono text-base font-semibold tabular-nums tracking-tight',
          finished ? 'animate-pulse' : '',
        ].join(' ')}
        aria-live="polite"
      >
        {formatTime(remaining)}
      </span>

      {/* Duration controls — visible only when not active yet */}
      {!running && !finished && (
        <>
          <span className="h-4 w-px bg-white/15" aria-hidden="true" />
          <div className="flex items-center gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.sec}
                type="button"
                onClick={() => onDurationChange(p.sec)}
                className={[
                  'rounded-md px-1.5 py-0.5 text-[11px] transition',
                  durationSec === p.sec
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:bg-white/10 hover:text-white/80',
                ].join(' ')}
              >
                {p.label}
              </button>
            ))}
            <input
              type="number"
              min={MIN_DURATION}
              max={MAX_DURATION}
              step={10}
              value={durationSec}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isFinite(n)) return;
                onDurationChange(Math.max(MIN_DURATION, Math.min(MAX_DURATION, Math.round(n))));
              }}
              title="Длительность таймера в секундах"
              className="w-14 rounded bg-black/30 px-1 py-0.5 text-center text-[11px] font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <span className="text-[10px] uppercase text-white/40">сек</span>
          </div>
        </>
      )}
    </div>
  );
}
