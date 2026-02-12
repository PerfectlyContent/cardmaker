import { Suspense, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useCardStore } from '@/stores/cardStore'
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
      {/* Language switcher removed — only on welcome */}
    </>
  )

  return (
    <div className={`h-[100dvh] flex flex-col relative overflow-hidden ${currentStep === 'welcome' ? '' : 'bg-white'}`}>

      {/* ─── WELCOME SCREEN ─── */}
      {currentStep === 'welcome' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="absolute inset-0 app-bg" />
          <div className="relative z-10 w-full max-w-md">
            <WelcomeScreen />
          </div>
        </div>
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
