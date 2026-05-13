import { ScatteredField } from './components/scattered-field';
import { StackPanel } from './components/stack-panel';
import { useStackStore } from './store/use-stack-store';

function App() {
  const {
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
  } = useStackStore();

  return (
    <div className="grid h-screen w-screen grid-cols-1 overflow-hidden lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_440px]">
      <main className="min-h-0 min-w-0 overflow-hidden">
        <ScatteredField
          isSelected={isSelected}
          isDimmed={isDimmed}
          onToggle={toggle}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onReroll={reroll}
          randomCount={randomCount}
          onRandomCountChange={setRandomCount}
        />
      </main>
      <StackPanel
        selectedIds={selectedIds}
        onRemove={toggle}
        onReset={reset}
        groupByLayer={difficulty !== 'random-chaos'}
      />
    </div>
  );
}

export default App;
