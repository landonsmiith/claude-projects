import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, Backpack, Share2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar.jsx';
import { PackPanel } from './PackPanel.jsx';
import { EditTripModal } from './EditTripModal.jsx';
import { DeepResearchPanel } from './DeepResearchPanel.jsx';
import { useTripStore } from '@/store/tripStore';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const { currentTrip, isDarkMode, toggleDarkMode, isPackPanelOpen, togglePackPanel } = useTripStore();

  const handleShare = async () => {
    if (!currentTrip?.id) return;
    try {
      const res = await api.shareTrip(currentTrip.id);
      const shareUrl = `${window.location.origin}${res.shareUrl}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!', {
        description: 'Anyone with this link can view your trip.',
      });
    } catch {
      toast.error('Could not generate share link');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 h-14">
          {/* Mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2 font-bold">
            <span className="text-xl">🌍</span>
            <span className="text-forge-600 dark:text-forge-400">TripForge</span>
          </div>

          {/* Trip title */}
          {currentTrip && (
            <div className="flex-1 min-w-0 ml-2 hidden sm:block">
              <span className="text-sm text-muted-foreground truncate">
                {currentTrip.originCity}
                {currentTrip.days?.[0]?.location && ` → ${currentTrip.days[0].location}`}
                {currentTrip.returnDate && ` · ${new Date(currentTrip.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${new Date(currentTrip.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {/* Edit trip button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="gap-1.5"
              title="Edit trip dates & details"
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit trip</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            <Button
              variant={isPackPanelOpen ? 'secondary' : 'outline'}
              size="sm"
              onClick={togglePackPanel}
              className="gap-1.5"
            >
              <Backpack className="h-4 w-4" />
              <span className="hidden sm:inline">Pack my bag</span>
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 border-r overflow-y-auto flex-shrink-0">
          <Sidebar onResearchOpen={() => setResearchOpen(true)} />
        </aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed left-0 top-14 bottom-0 w-64 border-r bg-background z-50 overflow-y-auto lg:hidden"
              >
                <Sidebar
                  onDayClick={() => setSidebarOpen(false)}
                  onResearchOpen={() => { setSidebarOpen(false); setResearchOpen(true); }}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Pack panel */}
        <AnimatePresence>
          {isPackPanelOpen && (
            <motion.aside
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-14 bottom-0 w-80 border-l bg-background z-40 overflow-y-auto shadow-xl"
            >
              <PackPanel />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <EditTripModal open={editModalOpen} onOpenChange={setEditModalOpen} />
      <DeepResearchPanel open={researchOpen} onOpenChange={setResearchOpen} />
    </div>
  );
}
