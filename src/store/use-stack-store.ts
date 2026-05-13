import { useCallback, useEffect, useMemo, useState } from 'react';
import { TECHNOLOGIES } from '../data/technologies';
import type { CategoryId, Tech } from '../types';

const STORAGE_KEY = 'stack-guard:selected-v1';
const DIFFICULTY_KEY = 'stack-guard:difficulty-v2';
const RANDOM_COUNT_KEY = 'stack-guard:random-count-v1';

export type Difficulty = 'simple' | 'advanced' | 'random-strict' | 'random-chaos';

export const DEFAULT_RANDOM_COUNT = 8;
export const MIN_RANDOM_COUNT = 1;
export const MAX_RANDOM_COUNT = Math.min(20, TECHNOLOGIES.length);

const VALID_DIFFICULTIES: Difficulty[] = ['simple', 'advanced', 'random-strict', 'random-chaos'];

function clampCount(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_RANDOM_COUNT;
  return Math.max(MIN_RANDOM_COUNT, Math.min(MAX_RANDOM_COUNT, Math.round(n)));
}

export function isRandomDifficulty(d: Difficulty): boolean {
  return d === 'random-strict' || d === 'random-chaos';
}

// Strict-mode lock: blocks/dimms category collisions.
function isStrictDifficulty(d: Difficulty): boolean {
  return d === 'simple' || d === 'random-strict';
}

function loadSelected(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === 'string');
  } catch {
    return [];
  }
}

function loadDifficulty(): Difficulty {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY) as Difficulty | null;
    return raw && VALID_DIFFICULTIES.includes(raw) ? raw : 'simple';
  } catch {
    return 'simple';
  }
}

function loadRandomCount(): number {
  try {
    const raw = localStorage.getItem(RANDOM_COUNT_KEY);
    if (raw === null) return DEFAULT_RANDOM_COUNT;
    return clampCount(Number(raw));
  } catch {
    return DEFAULT_RANDOM_COUNT;
  }
}

const TECH_BY_ID = new Map(TECHNOLOGIES.map((t) => [t.id, t]));

// Fisher-Yates in-place shuffle.
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick N techs with no overlapping categories (greedy on shuffled list).
function pickStrictRandom(count: number): string[] {
  const used = new Set<CategoryId>();
  const picked: string[] = [];
  for (const tech of shuffle(TECHNOLOGIES)) {
    if (picked.length >= count) break;
    if (tech.categories.some((c) => used.has(c))) continue;
    picked.push(tech.id);
    for (const c of tech.categories) used.add(c);
  }
  return picked;
}

// Pick N techs fully randomly — categories may collide.
function pickChaosRandom(count: number): string[] {
  return shuffle(TECHNOLOGIES).slice(0, count).map((t) => t.id);
}

function rollFor(difficulty: Difficulty, count: number): string[] {
  if (difficulty === 'random-strict') return pickStrictRandom(count);
  if (difficulty === 'random-chaos') return pickChaosRandom(count);
  return [];
}

export function useStackStore() {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => loadSelected());
  const [difficulty, setDifficultyState] = useState<Difficulty>(() => loadDifficulty());
  const [randomCount, setRandomCountState] = useState<number>(() => loadRandomCount());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
    } catch {
      /* ignore quota */
    }
  }, [selectedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(DIFFICULTY_KEY, difficulty);
    } catch {
      /* ignore quota */
    }
  }, [difficulty]);

  useEffect(() => {
    try {
      localStorage.setItem(RANDOM_COUNT_KEY, String(randomCount));
    } catch {
      /* ignore quota */
    }
  }, [randomCount]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Categories already taken by selection (used for dimming in strict modes).
  const lockedCategories = useMemo(() => {
    const set = new Set<CategoryId>();
    for (const id of selectedIds) {
      const tech = TECH_BY_ID.get(id);
      if (!tech) continue;
      for (const cat of tech.categories) set.add(cat);
    }
    return set;
  }, [selectedIds]);

  const isSelected = useCallback((id: string) => selectedSet.has(id), [selectedSet]);

  const isDimmed = useCallback(
    (tech: Tech) => {
      if (!isStrictDifficulty(difficulty)) return false;
      if (selectedSet.has(tech.id)) return false;
      return tech.categories.some((cat) => lockedCategories.has(cat));
    },
    [difficulty, selectedSet, lockedCategories],
  );

  const toggle = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        const tech = TECH_BY_ID.get(id);
        if (!tech) return prev;
        if (!isStrictDifficulty(difficulty)) return [...prev, id];
        // Strict modes: block if any of the tech's categories already taken.
        const blocked = prev.some((sid) => {
          const sTech = TECH_BY_ID.get(sid);
          if (!sTech) return false;
          return sTech.categories.some((c) => tech.categories.includes(c));
        });
        if (blocked) return prev;
        return [...prev, id];
      });
    },
    [difficulty],
  );

  const reset = useCallback(() => setSelectedIds([]), []);

  // Re-roll random selection for current difficulty (no-op for manual modes).
  const reroll = useCallback(() => {
    if (!isRandomDifficulty(difficulty)) return;
    setSelectedIds(rollFor(difficulty, randomCount));
  }, [difficulty, randomCount]);

  // Set difficulty. Switching INTO a random mode triggers an initial roll.
  const setDifficulty = useCallback(
    (next: Difficulty) => {
      setDifficultyState((prev) => {
        if (prev !== next && isRandomDifficulty(next)) {
          setSelectedIds(rollFor(next, randomCount));
        }
        return next;
      });
    },
    [randomCount],
  );

  // Set random pick count; if currently in a random mode, re-roll with new count.
  const setRandomCount = useCallback(
    (n: number) => {
      const clamped = clampCount(n);
      setRandomCountState(clamped);
      setDifficultyState((current) => {
        if (isRandomDifficulty(current)) {
          setSelectedIds(rollFor(current, clamped));
        }
        return current;
      });
    },
    [],
  );

  return {
    selectedIds,
    isSelected,
    isDimmed,
    toggle,
    reset,
    reroll,
    difficulty,
    setDifficulty,
    randomCount,
    setRandomCount,
  };
}
