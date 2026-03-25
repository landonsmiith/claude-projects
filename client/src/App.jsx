import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LandingPage } from './pages/LandingPage';
import { WizardPage } from './pages/WizardPage';
import { BoardPage } from './pages/BoardPage';
import { useTripStore } from './store/tripStore';

export default function App() {
  const { isDarkMode } = useTripStore();

  // Apply persisted dark mode on initial mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/wizard" element={<WizardPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="bottom-right"
        richColors
        theme={isDarkMode ? 'dark' : 'light'}
        closeButton
      />
    </>
  );
}
