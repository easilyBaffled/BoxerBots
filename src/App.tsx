import { GameProvider, useGame } from './context/GameContext';
import { SetupScreen } from './screens/SetupScreen/SetupScreen';
import { GameScreen } from './screens/GameScreen/GameScreen';
import { VictoryScreen } from './screens/VictoryScreen/VictoryScreen';

function AppContent() {
  const { state } = useGame();

  if (state.gamePhase === 'setup') return <SetupScreen />;
  if (state.gamePhase === 'victory') return <VictoryScreen />;
  return <GameScreen />;
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
