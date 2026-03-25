import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripBoard } from '@/components/dashboard/TripBoard';
import { useTripStore } from '@/store/tripStore';

export function BoardPage() {
  const navigate = useNavigate();
  const { currentTrip, isDarkMode } = useTripStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (!currentTrip) {
      navigate('/');
    }
  }, [currentTrip, navigate]);

  return <TripBoard />;
}
