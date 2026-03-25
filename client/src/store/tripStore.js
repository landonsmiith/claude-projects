import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateDays } from '../lib/dateUtils.js';
import { nanoid } from 'nanoid';

const initialWizardData = {
  // Step 1
  originCity: '',
  originAirport: '',
  returnCity: '',
  departureDate: '',
  returnDate: '',
  travelers: 2,
  budgetTier: 'mid-range',

  // Step 2
  days: [], // { index, date, label, dayNumber, location, locationTier, travelTypes }

  // Step 3
  bookedFlights: {}, // dayIndex -> { airline, flightNumber, times, isBooked }
  bookedHotels: {},  // dayIndex -> { name, dates, confirmation, isBooked }

  // Step 4
  dietaryRestrictions: [],
  mobilityConsiderations: '',
  interests: [],
  affiliateMode: true,
};

export const useTripStore = create(
  persist(
    (set, get) => ({
      // Active trip
      currentTrip: null,
      wizardData: { ...initialWizardData },
      wizardStep: 0,

      // UI state
      activeDayIndex: 0,
      isDarkMode: false,
      isPackPanelOpen: false,

      // Saved recommendations per day
      savedActivities: {}, // dayIndex -> activity[]

      // ── Wizard actions ──────────────────────────────────────────
      setWizardStep: (step) => set({ wizardStep: step }),

      updateWizardData: (updates) =>
        set((state) => ({
          wizardData: { ...state.wizardData, ...updates },
        })),

      updateDays: () =>
        set((state) => {
          const { departureDate, returnDate } = state.wizardData;
          const baseDays = generateDays(departureDate, returnDate);
          const existingDays = state.wizardData.days;

          // Preserve existing location/travelType data where possible
          const days = baseDays.map((d) => {
            const existing = existingDays.find((e) => e.date === d.date);
            return existing ? { ...d, ...existing } : {
              ...d,
              location: '',
              locationTier: 'city', // 'country' | 'region' | 'city'
              travelTypes: [],
            };
          });

          return { wizardData: { ...state.wizardData, days } };
        }),

      updateDay: (dayIndex, updates) =>
        set((state) => {
          const days = [...state.wizardData.days];
          days[dayIndex] = { ...days[dayIndex], ...updates };
          return { wizardData: { ...state.wizardData, days } };
        }),

      updateBookedFlight: (dayIndex, data) =>
        set((state) => ({
          wizardData: {
            ...state.wizardData,
            bookedFlights: {
              ...state.wizardData.bookedFlights,
              [dayIndex]: { ...state.wizardData.bookedFlights[dayIndex], ...data },
            },
          },
        })),

      updateBookedHotel: (dayIndex, data) =>
        set((state) => ({
          wizardData: {
            ...state.wizardData,
            bookedHotels: {
              ...state.wizardData.bookedHotels,
              [dayIndex]: { ...state.wizardData.bookedHotels[dayIndex], ...data },
            },
          },
        })),

      completeWizard: () =>
        set((state) => {
          const trip = {
            id: nanoid(),
            ...state.wizardData,
            createdAt: new Date().toISOString(),
          };
          return { currentTrip: trip, wizardStep: -1 };
        }),

      resetWizard: () =>
        set({ wizardData: { ...initialWizardData }, wizardStep: 0, currentTrip: null }),

      // ── Dashboard actions ────────────────────────────────────────
      setActiveDayIndex: (idx) => set({ activeDayIndex: idx }),

      updateTripDay: (dayIndex, updates) =>
        set((state) => {
          if (!state.currentTrip) return {};
          const days = [...state.currentTrip.days];
          days[dayIndex] = { ...days[dayIndex], ...updates };
          return { currentTrip: { ...state.currentTrip, days } };
        }),

      saveActivity: (dayIndex, activity) =>
        set((state) => {
          const dayActivities = state.savedActivities[dayIndex] || [];
          const alreadySaved = dayActivities.some((a) => a.name === activity.name);
          if (alreadySaved) return {};
          return {
            savedActivities: {
              ...state.savedActivities,
              [dayIndex]: [...dayActivities, { ...activity, savedAt: new Date().toISOString() }],
            },
          };
        }),

      removeActivity: (dayIndex, activityName) =>
        set((state) => ({
          savedActivities: {
            ...state.savedActivities,
            [dayIndex]: (state.savedActivities[dayIndex] || []).filter(
              (a) => a.name !== activityName
            ),
          },
        })),

      // ── UI actions ───────────────────────────────────────────────
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.isDarkMode;
          document.documentElement.classList.toggle('dark', next);
          return { isDarkMode: next };
        }),

      togglePackPanel: () =>
        set((state) => ({ isPackPanelOpen: !state.isPackPanelOpen })),
    }),
    {
      name: 'tripforge-store',
      partialize: (state) => ({
        currentTrip: state.currentTrip,
        wizardData: state.wizardData,
        wizardStep: state.wizardStep,
        savedActivities: state.savedActivities,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
