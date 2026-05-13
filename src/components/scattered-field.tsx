import { useMemo, useState } from 'react';
import { TECHNOLOGIES } from '../data/technologies';
import { TechCard } from './tech-card';
import { DifficultyToggle } from './difficulty-toggle';
import { CountdownTimer } from './countdown-timer';
import type { Tech } from '../types';
import {
  isRandomDifficulty,
  MAX_RANDOM_COUNT,
  MIN_RANDOM_COUNT,
  type Difficulty,
} from '../store/use-stack-store';

interface Props {
  isSelected: (id: string) => boolean;
  isDimmed: (tech: Tech) => boolean;
  onToggle: (id: string) => void;
  difficulty: Difficulty;
  onDifficultyChange: (next: Difficulty) => void;
  onReroll: () => void;
  randomCount: number;
  onRandomCountChange: (n: number) => void;
  timerActive: boolean;
  timerDuration: number;
  onTimerDurationChange: (sec: number) => void;
}

function difficultyHint(d: Difficulty, count: number): string {
  switch (d) {
    case 'simple':
      return 'Простой: одна технология на категорию. Альтернативы затеняются.';
    case 'advanced':
      return 'Продвинутый: выбирай что угодно — никаких ограничений.';
    case 'random-strict':
      return `Рандом-строгий: судьба выдала ${count} технологий из разных категорий.`;
    case 'random-chaos':
      return `Хаос: ${count} случайных карт. Может быть и три стейт-менеджера сразу.`;
  }
}

// Stable string hash -> number in [0,1).
function seed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export function ScatteredField({
  isSelected,
  isDimmed,
  onToggle,
  difficulty,
  onDifficultyChange,
  onReroll,
  randomCount,
  onRandomCountChange,
  timerActive,
  timerDuration,
  onTimerDurationChange,
}: Props) {
  const [shuffleKey, setShuffleKey] = useState(0);
  const isRandom = isRandomDifficulty(difficulty);

  const items = useMemo(() => {
    return TECHNOLOGIES.map((tech) => {
      const r1 = seed(tech.id + ':1:' + shuffleKey);
      const r2 = seed(tech.id + ':2:' + shuffleKey);
      const r3 = seed(tech.id + ':3:' + shuffleKey);
      const r4 = seed(tech.id + ':4:' + shuffleKey);
      return {
        tech,
        rotate: (r1 - 0.5) * 4, // -2..2 deg
        translateY: (r2 - 0.5) * 14, // -7..7 px
        order: Math.floor(r3 * 9999),
        delay: r4 * 0.4, // 0..0.4s
      };
    }).sort((a, b) => a.order - b.order);
  }, [shuffleKey]);

  return (
    <div className="relative flex h-full flex-col">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-white/50">арсенал</div>
          <h1 className="text-2xl font-bold text-white">
            🛡️ Защити техстек проекта
          </h1>
          <p className="mt-1 text-xs text-white/50">{difficultyHint(difficulty, randomCount)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CountdownTimer
            active={timerActive}
            durationSec={timerDuration}
            onDurationChange={onTimerDurationChange}
          />
          <DifficultyToggle value={difficulty} onChange={onDifficultyChange} />
          {isRandom && (
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
              <label htmlFor="random-count" className="text-[11px] uppercase tracking-wide text-white/50">
                карт
              </label>
              <input
                id="random-count"
                type="number"
                min={MIN_RANDOM_COUNT}
                max={MAX_RANDOM_COUNT}
                value={randomCount}
                onChange={(e) => onRandomCountChange(Number(e.target.value))}
                className="w-12 rounded bg-black/30 px-1.5 py-0.5 text-center text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <input
                aria-label="Количество карт"
                type="range"
                min={MIN_RANDOM_COUNT}
                max={MAX_RANDOM_COUNT}
                value={randomCount}
                onChange={(e) => onRandomCountChange(Number(e.target.value))}
                className="w-24 accent-indigo-400"
              />
            </div>
          )}
          {isRandom && (
            <button
              type="button"
              onClick={onReroll}
              className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20"
              title="Перебросить кубики"
            >
              🎲 перебросить
            </button>
          )}
          <button
            type="button"
            onClick={() => setShuffleKey((k) => k + 1)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10"
            title="Перемешать карточки на столе"
          >
            🔀
          </button>
        </div>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <div className="flex flex-wrap items-start justify-center gap-4 px-6 py-8">
          {items.map(({ tech, rotate, translateY, delay }) => (
            <div
              key={tech.id}
              style={{
                transform: `translateY(${translateY}px) rotate(${rotate}deg)`,
                animationDelay: `${delay}s`,
              }}
              className="animate-float transition-transform duration-300 hover:!rotate-0 hover:!translate-y-0"
            >
              <TechCard
                tech={tech}
                selected={isSelected(tech.id)}
                dimmed={isDimmed(tech)}
                hideCategories={difficulty !== 'simple'}
                onToggle={onToggle}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
