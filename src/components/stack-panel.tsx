import { useMemo } from 'react';
import { TECHNOLOGIES } from '../data/technologies';
import { LAYER_META, type Layer, type Tech } from '../types';

interface Props {
  selectedIds: string[];
  onRemove: (id: string) => void;
  onReset: () => void;
  // When false, render a flat list without layer headers (used in chaos mode).
  groupByLayer?: boolean;
}

const LAYER_ORDER: Layer[] = ['language', 'frontend', 'backend', 'data', 'tooling', 'devops', 'ai'];
const TECH_BY_ID = new Map(TECHNOLOGIES.map((t) => [t.id, t]));

function StackItem({ tech, onRemove }: { tech: Tech; onRemove: (id: string) => void }) {
  return (
    <li className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{ background: tech.color + '22', boxShadow: `inset 0 0 0 1px ${tech.color}55` }}
      >
        {tech.emoji}
      </div>
      <div className="flex-1 truncate text-sm font-medium text-white">{tech.name}</div>
      <button
        type="button"
        onClick={() => onRemove(tech.id)}
        className="rounded-md px-2 py-1 text-xs text-white/40 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-300"
        aria-label={`Убрать ${tech.name}`}
      >
        ✕
      </button>
    </li>
  );
}

export function StackPanel({ selectedIds, onRemove, onReset, groupByLayer = true }: Props) {
  const grouped = useMemo(() => {
    const map: Record<Layer, Tech[]> = {
      language: [], frontend: [], backend: [], data: [], tooling: [], devops: [], ai: [],
    };
    for (const id of selectedIds) {
      const t = TECH_BY_ID.get(id);
      if (t) map[t.layer].push(t);
    }
    return map;
  }, [selectedIds]);

  const flat = useMemo(
    () => selectedIds.map((id) => TECH_BY_ID.get(id)).filter((t): t is Tech => !!t),
    [selectedIds],
  );

  const empty = selectedIds.length === 0;

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden border-l border-white/10 bg-black/40 backdrop-blur-xl">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/50">твой стек</div>
          <h2 className="text-xl font-bold text-white">
            🛡️ Защищённый техстек
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={empty}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-30"
        >
          сброс
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {empty && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-white/40">
            <div className="text-5xl">🛡️</div>
            <p className="text-sm">Выбирай технологии слева,<br />чтобы построить защиту проекта.</p>
          </div>
        )}

        {!empty && groupByLayer && LAYER_ORDER.map((layer) => {
          const items = grouped[layer];
          if (items.length === 0) return null;
          const meta = LAYER_META[layer];
          return (
            <section key={layer} className="mb-4">
              <div className={`mb-2 rounded-lg bg-gradient-to-r ${meta.accent} px-3 py-1.5`}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
                  {meta.label} · {items.length}
                </h3>
              </div>
              <ul className="space-y-1.5">
                {items.map((tech) => (
                  <StackItem key={tech.id} tech={tech} onRemove={onRemove} />
                ))}
              </ul>
            </section>
          );
        })}

        {!empty && !groupByLayer && (
          <ul className="space-y-1.5">
            {flat.map((tech) => (
              <StackItem key={tech.id} tech={tech} onRemove={onRemove} />
            ))}
          </ul>
        )}
      </div>

      <footer className="border-t border-white/10 px-5 py-3 text-center text-[11px] text-white/40">
        выбрано {selectedIds.length} из {TECHNOLOGIES.length}
      </footer>
    </aside>
  );
}
