import type { Difficulty } from '../store/use-stack-store';

interface Props {
  value: Difficulty;
  onChange: (next: Difficulty) => void;
}

const OPTIONS: { id: Difficulty; label: string; hint: string }[] = [
  { id: 'simple', label: '🛡️ Простой', hint: 'затеняет альтернативы' },
  { id: 'advanced', label: '⚔️ Продвинутый', hint: 'выбирай что угодно' },
  { id: 'random-strict', label: '🎲 Рандом-строгий', hint: '8 случайных без пересечений' },
  { id: 'random-chaos', label: '💥 Хаос', hint: '8 случайных, ограничений нет' },
];

export function DifficultyToggle({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Уровень сложности"
      className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
    >
      {OPTIONS.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            title={opt.hint}
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-medium transition',
              active
                ? 'bg-indigo-500/30 text-white shadow-inner shadow-indigo-500/20'
                : 'text-white/60 hover:bg-white/5 hover:text-white/90',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
