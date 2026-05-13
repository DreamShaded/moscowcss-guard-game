export type Layer =
  | 'language'
  | 'frontend'
  | 'backend'
  | 'data'
  | 'tooling'
  | 'devops'
  | 'ai';

export type CategoryId =
  | 'meta-framework'
  | 'frontend-framework'
  | 'css'
  | 'state-management'
  | 'backend-framework'
  | 'runtime'
  | 'language'
  | 'database-sql'
  | 'database-nosql'
  | 'cache'
  | 'orm'
  | 'bundler'
  | 'unit-testing'
  | 'e2e-testing'
  | 'api-protocol'
  | 'auth'
  | 'container'
  | 'ci-cd'
  | 'cloud'
  | 'ai-llm'
  | 'ai-protocol'
  | 'monorepo'
  | 'package-manager';

export interface Tech {
  id: string;
  name: string;
  description: string;
  categories: CategoryId[];
  layer: Layer;
  emoji: string;
  color: string;
}

export const LAYER_META: Record<Layer, { label: string; accent: string }> = {
  language: { label: 'Языки', accent: 'from-yellow-500/30 to-amber-500/10' },
  frontend: { label: 'Фронтенд', accent: 'from-sky-500/30 to-cyan-500/10' },
  backend: { label: 'Бэкенд', accent: 'from-emerald-500/30 to-green-500/10' },
  data: { label: 'Данные', accent: 'from-rose-500/30 to-red-500/10' },
  tooling: { label: 'Тулинг', accent: 'from-violet-500/30 to-purple-500/10' },
  devops: { label: 'DevOps', accent: 'from-orange-500/30 to-amber-500/10' },
  ai: { label: 'AI', accent: 'from-fuchsia-500/30 to-pink-500/10' },
};

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  'meta-framework': 'мета-фреймворк',
  'frontend-framework': 'frontend',
  css: 'CSS',
  'state-management': 'state',
  'backend-framework': 'backend',
  runtime: 'runtime',
  language: 'язык',
  'database-sql': 'SQL DB',
  'database-nosql': 'NoSQL DB',
  cache: 'кэш',
  orm: 'ORM',
  bundler: 'bundler',
  'unit-testing': 'unit-тесты',
  'e2e-testing': 'e2e-тесты',
  'api-protocol': 'API',
  auth: 'auth',
  container: 'контейнеры',
  'ci-cd': 'CI/CD',
  cloud: 'cloud',
  'ai-llm': 'LLM',
  'ai-protocol': 'AI-протокол',
  monorepo: 'monorepo',
  'package-manager': 'пакетный менеджер',
};
