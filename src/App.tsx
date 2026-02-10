import { Suspense, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useCardStore } from '@/stores/cardStore'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { CapsuleBar } from '@/components/ui/CapsuleBar'
import { CardCanvasLive } from '@/components/card/CardCanvasLive'
import { CardCanvas } from '@/components/card/CardCanvas'
import { WelcomeScreen } from '@/components/flow/WelcomeScreen'
import { CreateFlow } from '@/components/flow/CreateFlow'
import { BackgroundBar, MessageBar } from '@/components/flow/DesignBar'
import { ShareScreen } from '@/components/flow/ShareScreen'
import { ChatFlow } from '@/components/flow/ChatFlow'
import { CardToolbar } from '@/components/flow/CardToolbar'
import { useRTL } from '@/hooks/useRTL'

function App() {
  const { t } = useTranslation()
  const currentStep = useCardStore((s) => s.currentStep)
  const mode = useCardStore((s) => s.mode)
  const prevStep = useCardStore((s) => s.prevStep)
  const isRTL = useRTL()
  const exportRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)

  const showCanvas = currentStep !== 'welcome'
  const isChatMode = mode === 'freeform' && currentStep === 'chat'

  return (
    <div className="h-[100dvh] flex flex-col relative overflow-hidden">
      {/* Full-screen card canvas */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          {showCanvas && (
            <motion.div
              key="canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              <CardCanvasLive />
            </motion.div>
          )}
        </AnimatePresence>
        {!showCanvas && <div className="absolute inset-0 app-bg" />}
      </div>

      {/* Language switcher */}
      <div className="fixed top-3 end-3 z-[100] pointer-events-auto">
        <LanguageSwitcher />
      </div>

      {/* Back button — floating top-left on background/message + share edit */}
      <AnimatePresence>
        {(currentStep === 'background' || currentStep === 'message' || (currentStep === 'share' && editing)) && (
          <motion.button
            key="back-btn"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (editing) setEditing(false)
              else prevStep()
            }}
            className="fixed top-4 start-4 z-50 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 2px 12px rgba(26,10,14,0.1)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A0A0E" strokeWidth="2.5" strokeLinecap="round" className="rtl:rotate-180">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Welcome — full screen, centered */}
        {currentStep === 'welcome' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-md">
              <WelcomeScreen />
            </div>
          </div>
        )}

        {/* Create phase — capsule bar with flow chips */}
        <AnimatePresence>
          {currentStep === 'create' && (
            <CapsuleBar key="create-bar">
              <CreateFlow />
            </CapsuleBar>
          )}
        </AnimatePresence>

        {/* Chat mode — capsule bar with chat */}
        <AnimatePresence>
          {isChatMode && (
            <CapsuleBar key="chat-bar">
              <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                <ChatFlow />
              </div>
            </CapsuleBar>
          )}
        </AnimatePresence>

        {/* Background phase — capsule bar with image gen + thumbnails */}
        <AnimatePresence>
          {currentStep === 'background' && (
            <CapsuleBar key="bg-bar">
              <BackgroundBar />
            </CapsuleBar>
          )}
        </AnimatePresence>

        {/* Message phase — capsule bar with text editing */}
        <AnimatePresence>
          {currentStep === 'message' && (
            <CapsuleBar key="msg-bar">
              <MessageBar />
            </CapsuleBar>
          )}
        </AnimatePresence>

        {/* Share phase — floating share icons */}
        <AnimatePresence>
          {currentStep === 'share' && !editing && (
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
          )}
        </AnimatePresence>

        {/* Share edit mode — toolbar in capsule */}
        <AnimatePresence>
          {currentStep === 'share' && editing && (
            <CapsuleBar key="edit-bar">
              <CardToolbar />
            </CapsuleBar>
          )}
        </AnimatePresence>
      </div>

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
