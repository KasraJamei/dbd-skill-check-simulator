import { AttemptHistory } from './components/AttemptHistory'
import { LeaderboardPanel } from './components/LeaderboardPanel'
import { ModeSelector } from './components/ModeSelector'
import { SettingsPanel } from './components/SettingsPanel'
import { SkillCheckCanvas } from './components/SkillCheckCanvas'
import { StatsPanel } from './components/StatsPanel'
import { TopBar } from './components/TopBar'

function App() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(90,18,26,0.28),transparent_34%),linear-gradient(135deg,#08090a_0%,#151313_42%,#090909_100%)] text-stone-100">
      <TopBar />
      <div className="mx-auto grid w-full max-w-[1480px] gap-4 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)_300px] lg:px-6">
        <aside className="grid content-start gap-4">
          <ModeSelector />
          <SettingsPanel />
        </aside>
        <section className="grid min-w-0 content-start gap-4">
          <SkillCheckCanvas />
        </section>
        <aside className="grid content-start gap-4">
          <StatsPanel />
          <LeaderboardPanel />
          <AttemptHistory />
        </aside>
      </div>
    </main>
  )
}

export default App
