import { lazy, Suspense } from 'react'
import AppHeader from './components/layout/AppHeader'
import BottomNavigation from './components/layout/BottomNavigation'
import { LanguageProvider } from './i18n/LanguageContext'
import AchievementsScreen from './screens/AchievementsScreen'
import ConceptLearnScreen from './screens/ConceptLearnScreen'
import GardenScreen from './screens/GardenScreen'
import HomeScreen from './screens/HomeScreen'
import type { GardenLevelId } from './lib/gardenQuestionGenerator'
import type { AquariumLevelId } from './lib/aquariumQuestionGenerator'
import LearnScreen from './screens/LearnScreen'
import LegalScreen from './screens/LegalScreen'
import LevelSelectScreen from './screens/LevelSelectScreen'
import PracticeScreen from './screens/PracticeScreen'
import ResultScreen from './screens/ResultScreen'
import SettingsScreen from './screens/SettingsScreen'
import StoryLearnScreen from './screens/StoryLearnScreen'
import { NavigationProvider, useNavigation } from './state/NavigationContext'
import { ProgressProvider, useProgress } from './state/ProgressContext'

const AquariumScreen = lazy(() => import('./screens/AquariumScreen'))
const TrainScreen = lazy(() => import('./screens/TrainScreen'))

function ScreenRouter() {
  const { screen } = useNavigation()
  switch (screen.name) {
    case 'home':
      return <HomeScreen />
    case 'levels':
      return <LevelSelectScreen />
    case 'learn':
      return (
        <LearnScreen
          key={`${screen.levelId ?? 'ad-hoc'}-${screen.problems?.[0]?.id ?? 'generate'}`}
          levelId={screen.levelId}
          problems={screen.problems}
          initialStats={screen.initialStats}
          title={screen.title}
        />
      )
    case 'concept-learn':
      return <ConceptLearnScreen levelId={screen.levelId} problems={screen.problems} />
    case 'story-learn':
      return <StoryLearnScreen levelId={screen.levelId} problems={screen.problems} />
    case 'garden':
      return <GardenScreen levelId={screen.levelId as GardenLevelId} />
    case 'aquarium':
      return (
        <Suspense
          fallback={
            <div className="py-10 text-center text-sm font-bold text-slate-400">
              Memuat akuarium…
            </div>
          }
        >
          <AquariumScreen levelId={screen.levelId as AquariumLevelId} />
        </Suspense>
      )
    case 'practice':
      return (
        <PracticeScreen key={JSON.stringify(screen.settings ?? null)} settings={screen.settings} />
      )
    case 'result':
      return <ResultScreen summary={screen.summary} />
    case 'achievements':
      return <AchievementsScreen />
    case 'settings':
      return <SettingsScreen />
    case 'privacy':
      return <LegalScreen kind="privacy" />
    case 'terms':
      return <LegalScreen kind="terms" />
    case 'train':
      return (
        <Suspense
          fallback={
            <div className="py-10 text-center text-sm font-bold text-slate-400">Memuat kereta…</div>
          }
        >
          <TrainScreen />
        </Suspense>
      )
  }
}

function AppShell() {
  const { progress } = useProgress()
  return (
    <div
      className={`flex min-h-dvh flex-col bg-sky-50 ${progress.animationsEnabled ? '' : 'no-anim'}`}
    >
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 pb-28 md:px-4 md:pb-10">
        <ScreenRouter />
      </main>
      <BottomNavigation />
    </div>
  )
}

export default function App() {
  return (
    <NavigationProvider>
      <ProgressProvider>
        <LanguageProvider>
          <AppShell />
        </LanguageProvider>
      </ProgressProvider>
    </NavigationProvider>
  )
}
