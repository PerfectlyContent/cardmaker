import { Suspense, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useCardStore } from '@/stores/cardStore'
import { useDateStore } from '@/stores/dateStore'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { FlowPanel } from '@/components/ui/CapsuleBar'
import { CardCanvasLive } from '@/components/card/CardCanvasLive'
import { CardCanvas } from '@/components/card/CardCanvas'
import { WelcomeScreen } from '@/components/flow/WelcomeScreen'
import { CreateFlow } from '@/components/flow/CreateFlow'
import { BackgroundBar, MessageBar } from '@/components/flow/DesignBar'
import { ShareScreen } from '@/components/flow/ShareScreen'
import { RevealScreen } from '@/components/flow/RevealScreen'
import { ChatFlow } from '@/components/flow/ChatFlow'
import { CardToolbar } from '@/components/flow/CardToolbar'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { CalendarTab } from '@/components/dates/CalendarTab'
import { DatesOnboarding } from '@/components/dates/DatesOnboarding'

type HomeTab = 'create' | 'dates'

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{ background: 'rgba(0,0,0,0.04)' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" className="rtl:rotate-180">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </motion.button>
  )
}

function BottomTabBar({ activeTab, onTabChange }: { activeTab: HomeTab; onTabChange: (tab: HomeTab) => void }) {
  const { t } = useTranslation()
  const dates = useDateStore((s) => s.dates)
  const upcomingSoon = dates.filter((d) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(d.date + 'T00:00:00')
    const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate())
    const diff = Math.round((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 7
  }).length

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-center"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        {/* Create tab */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onTabChange('create')}
          className="tappable-option flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: activeTab === 'create' ? 'rgba(255,255,255,0.9)' : 'transparent',
            color: activeTab === 'create' ? '#5C0F20' : 'rgba(255,255,255,0.5)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          {t('dates.tabCreate', 'Create')}
        </motion.button>

        {/* Dates tab */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onTabChange('dates')}
          className="tappable-option flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all relative"
          style={{
            background: activeTab === 'dates' ? 'rgba(255,255,255,0.9)' : 'transparent',
            color: activeTab === 'dates' ? '#5C0F20' : 'rgba(255,255,255,0.5)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {t('dates.tabDates', 'Dates')}
          {/* Badge for upcoming dates */}
          {upcomingSoon > 0 && activeTab !== 'dates' && (
            <span
              className="absolute -top-1 -end-1 w-4.5 h-4.5 rounded-full text-[9px] font-bold flex items-center justify-center"
              style={{ background: '#B83A4A', color: '#fff', minWidth: 18, height: 18 }}
            >
              {upcomingSoon}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  )
}

/** Compute step indicator for guided flow (4 steps, preview is not counted) */
function useGuidedProgress() {
  const currentStep = useCardStore((s) => s.currentStep)
  const stepMap: Record<string, number> = { create: 1, background: 2, message: 3, share: 4 }
  return { current: stepMap[currentStep] || 0, total: 4 }
}

function App() {
  const { t } = useTranslation()
  const currentStep = useCardStore((s) => s.currentStep)
  const mode = useCardStore((s) => s.mode)
  const prevStep = useCardStore((s) => s.prevStep)
  const exportRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)
  const [homeTab, setHomeTab] = useState<HomeTab>('create')
  const hasOnboarded = useDateStore((s) => s.hasOnboarded)
  const [showOnboarding, setShowOnboarding] = useState(!hasOnboarded)

  const isChatMode = mode === 'freeform' && currentStep === 'chat'
  const isPreview = currentStep === 'preview' && !editing
  const isPreviewEdit = currentStep === 'preview' && editing
  const isShareView = currentStep === 'share' && !editing
  const isShareEdit = currentStep === 'share' && editing
  const isCreationStep = currentStep === 'create' || currentStep === 'background' || currentStep === 'message' || isChatMode

  // Steps that use the split layout (top panel + bottom card)
  const usesSplitLayout = isCreationStep || isShareEdit || isPreviewEdit

  const progress = useGuidedProgress()

  const panelHeader = (
    <>
      {/* Back button */}
      {(currentStep === 'background' || currentStep === 'message' || isShareEdit || isPreviewEdit) && (
        <BackButton onClick={() => {
          if (editing) setEditing(false)
          else prevStep()
        }} />
      )}
      {/* Edit mode label */}
      {(isShareEdit || isPreviewEdit) && (
        <span className="text-sm font-semibold text-ink">{t('toolbar.edit', 'Edit card')}</span>
      )}
      {/* Spacer */}
      <div className="flex-1" />
      {/* Step indicator for guided flow (not on preview/share) */}
      {mode === 'guided' && progress.current > 0 && (
        <StepIndicator current={progress.current} total={progress.total} />
      )}
    </>
  )

  return (
    <div className={`h-[100dvh] flex flex-col relative overflow-hidden ${currentStep === 'welcome' ? '' : 'bg-white'}`}>

      {/* ─── HOME SCREEN (Welcome + Tabs) ─── */}
      {currentStep === 'welcome' && (
        <>
          <div className="absolute inset-0 z-10 flex flex-col">
            <div className="absolute inset-0 app-bg" />

            <div className="relative z-10 flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {homeTab === 'create' && (
                  <motion.div
                    key="tab-create"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-full max-w-md">
                      <WelcomeScreen />
                    </div>
                  </motion.div>
                )}

                {homeTab === 'dates' && (
                  <motion.div
                    key="tab-dates"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 overflow-y-auto"
                    style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
                  >
                    <CalendarTab />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom tab bar */}
            <BottomTabBar activeTab={homeTab} onTabChange={setHomeTab} />
          </div>

          {/* Dates onboarding overlay */}
          <AnimatePresence>
            {showOnboarding && (
              <DatesOnboarding onDone={() => setShowOnboarding(false)} />
            )}
          </AnimatePresence>
        </>
      )}

      {/* ─── SPLIT LAYOUT: Top flow panel + bottom card ─── */}
      {usesSplitLayout && (
        <>
          {/* Top: Flow panel — clean white */}
          <AnimatePresence mode="wait">
            {currentStep === 'create' && (
              <FlowPanel key="create-panel" header={panelHeader}>
                <CreateFlow />
              </FlowPanel>
            )}

            {isChatMode && (
              <FlowPanel key="chat-panel" header={panelHeader}>
                <ChatFlow />
              </FlowPanel>
            )}

            {currentStep === 'background' && (
              <FlowPanel key="bg-panel" header={panelHeader}>
                <BackgroundBar />
              </FlowPanel>
            )}

            {currentStep === 'message' && (
              <FlowPanel key="msg-panel" header={panelHeader}>
                <MessageBar />
              </FlowPanel>
            )}

            {(isShareEdit || isPreviewEdit) && (
              <FlowPanel key="edit-panel" header={panelHeader}>
                <CardToolbar onDone={() => setEditing(false)} />
              </FlowPanel>
            )}
          </AnimatePresence>

          {/* Divider line */}
          <div className="h-px bg-black/[0.06] shrink-0" />

          {/* Bottom: Card preview — fills remaining space */}
          <div className="flex-1 min-h-0">
            <CardCanvasLive compact />
          </div>
        </>
      )}

      {/* ─── PREVIEW / REVEAL: Full-screen card with edit/continue buttons ─── */}
      {isPreview && (
        <>
          <div className="absolute inset-0 z-0">
            <motion.div
              key="canvas-reveal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              <CardCanvasLive />
            </motion.div>
          </div>

          <motion.div
            key="reveal-bar"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed z-30"
            style={{
              bottom: 'max(24px, env(safe-area-inset-bottom))',
              left: 16,
              right: 16,
            }}
          >
            <RevealScreen onEdit={() => setEditing(true)} />
          </motion.div>
        </>
      )}

      {/* ─── SHARE VIEW: Full-screen card with share/download buttons ─── */}
      {isShareView && (
        <>
          <div className="absolute inset-0 z-0">
            <motion.div
              key="canvas-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              <CardCanvasLive />
            </motion.div>
          </div>

          <motion.div
            key="share-bar"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed z-30"
            style={{
              bottom: 'max(24px, env(safe-area-inset-bottom))',
              left: 16,
              right: 16,
            }}
          >
            <ShareScreen onEdit={() => setEditing(true)} />
          </motion.div>
        </>
      )}

      {/* Language switcher — only on welcome screen */}
      {currentStep === 'welcome' && (
        <div className="fixed top-3 end-3 z-[100] pointer-events-auto">
          <LanguageSwitcher />
        </div>
      )}

      {/* Hidden offscreen canvas for export */}
      <div data-export-canvas className="absolute" style={{ left: -9999, top: -9999, width: 1080, height: 1080, overflow: 'hidden' }}>
        <CardCanvas ref={exportRef} scale={1} />
      </div>
    </div>
  )
}

export default function Root() {
  return (
    <Suspense
      fallback={
        <div className="h-full bg-bg flex items-center justify-center">
          <svg className="w-8 h-8 text-ink" viewBox="0 0 40 40" fill="none">
            <path
              d="M5 20 C5 20, 15 5, 20 20 S35 35, 35 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="pen-loader"
            />
          </svg>
        </div>
      }
    >
      <App />
    </Suspense>
  )
}
