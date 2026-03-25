import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '@/components/wizard/WizardLayout';
import { Step1Basics } from '@/components/wizard/Step1Basics';
import { Step2DayPlanner } from '@/components/wizard/Step2DayPlanner';
import { Step3Booked } from '@/components/wizard/Step3Booked';
import { Step4Preferences } from '@/components/wizard/Step4Preferences';
import { useTripStore } from '@/store/tripStore';
import { toast } from 'sonner';

export function WizardPage() {
  const navigate = useNavigate();
  const {
    wizardStep,
    wizardData,
    setWizardStep,
    updateWizardData,
    updateDay,
    updateDays,
    updateFlightLegs,
    updateHotelStays,
    completeWizard,
    currentTrip,
    isDarkMode,
  } = useTripStore();

  // Apply dark mode class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // If trip already exists, redirect to board
  useEffect(() => {
    if (currentTrip) {
      navigate('/board');
    }
  }, [currentTrip, navigate]);

  const handleNext = () => {
    // When advancing from step 0 to step 1, generate day rows
    if (wizardStep === 0) {
      updateDays();
    }
    setWizardStep(wizardStep + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setWizardStep(wizardStep - 1);
    window.scrollTo(0, 0);
  };

  const handleComplete = () => {
    completeWizard();
    toast.success('Trip board built! 🚀');
    navigate('/board');
  };

  return (
    <WizardLayout step={wizardStep}>
      {wizardStep === 0 && (
        <Step1Basics
          data={wizardData}
          onChange={updateWizardData}
          onNext={handleNext}
        />
      )}
      {wizardStep === 1 && (
        <Step2DayPlanner
          data={wizardData}
          onUpdateDay={updateDay}
          onBack={handleBack}
          onNext={handleNext}
        />
      )}
      {wizardStep === 2 && (
        <Step3Booked
          data={wizardData}
          onUpdateFlightLegs={updateFlightLegs}
          onUpdateHotelStays={updateHotelStays}
          onBack={handleBack}
          onNext={handleNext}
        />
      )}
      {wizardStep === 3 && (
        <Step4Preferences
          data={wizardData}
          onChange={updateWizardData}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      )}
    </WizardLayout>
  );
}
