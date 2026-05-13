import { useState } from 'react';
import { CATEGORY_LABEL, type Tech } from '../types';

interface Props {
  tech: Tech;
  selected: boolean;
  dimmed: boolean;
  hideCategories?: boolean;
  onToggle: (id: string) => void;
}

export function TechCard({ tech, selected, dimmed, hideCategories, onToggle }: Props) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (dimmed) return;
    onToggle(tech.id);
  };

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((v) => !v);
  };

  return (
    <div
      role="button"
      tabIndex={dimmed ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={[
        'group relative flex w-[220px] min-h-[150px] select-none flex-col rounded-2xl border p-4 backdrop-blur-md transition-all',
        'shadow-lg shadow-black/30',
        selected
          ? 'border-indigo-400/80 bg-indigo-500/15 ring-2 ring-indigo-400/60 animate-pulse-glow'
          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10',
        dimmed ? 'pointer-events-none opacity-25 grayscale' : 'cursor-pointer',
      ].join(' ')}
      style={selected ? { borderColor: tech.color + 'cc' } : undefined}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ background: tech.color + '22', boxShadow: `inset 0 0 0 1px ${tech.color}44` }}
        >
          <span>{tech.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-white">{tech.name}</div>
          {!hideCategories && (
            <div className="mt-0.5 flex flex-wrap gap-1">
              {tech.categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70"
                >
                  {CATEGORY_LABEL[c]}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleReveal}
        className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-left text-xs text-white/70 transition hover:bg-black/50"
      >
        {open ? '▾ скрыть' : '▸ что это?'}
      </button>

      {open && (
        <p className="mt-2 text-xs leading-relaxed text-white/80">{tech.description}</p>
      )}

      {selected && (
        <div className="absolute -right-2 -top-2 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-lg">
          в стеке
        </div>
      )}
    </div>
  );
}
