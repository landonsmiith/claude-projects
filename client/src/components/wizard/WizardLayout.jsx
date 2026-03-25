import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Calendar, Briefcase, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Trip Basics', icon: MapPin },
  { label: 'Day Planner', icon: Calendar },
  { label: 'Already Booked', icon: Briefcase },
  { label: 'Preferences', icon: Heart },
];

export function WizardLayout({ step, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forge-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <span className="font-bold text-xl text-forge-600 dark:text-forge-400">TripForge</span>
          </div>
          <span className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
        </div>
      </header>

      {/* Step indicators */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-8 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isComplete = i < step;
            const isActive = i === step;
            return (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <div className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all',
                  isComplete && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  isActive && 'bg-forge-100 text-forge-700 dark:bg-forge-900/30 dark:text-forge-400',
                  !isComplete && !isActive && 'bg-muted text-muted-foreground'
                )}>
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    'h-px w-6 flex-shrink-0',
                    i < step ? 'bg-green-400' : 'bg-border'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
