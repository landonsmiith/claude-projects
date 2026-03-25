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
  days: [], // { index, date, label, dayNumber, location, locationTier, travelTypes, isTravelDay }

  // Step 3
  flightLegs: [],  // [{ id, origin, dest, date, airline, flightNumber, isBooked }]
  hotelStays: [],  // [{ id, name, location, checkin, checkout, confirmation, isBooked }]

  // Step 4
  dietaryRestrictions: [],
  mobilityConsiderations: '',
  interests: [],
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
      savedEvents: {}, // dayIndex -> event[]
      activityTimeSlots: {}, // `${dayIndex}-${activityName}` -> 'Morning'|'Afternoon'|'Evening'
      activityNotes: {}, // `${dayIndex}-${activityName}` -> string

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
              isTravelDay: false,
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

      updateFlightLegs: (legs) =>
        set((state) => ({
          wizardData: { ...state.wizardData, flightLegs: legs },
        })),

      updateHotelStays: (stays) =>
        set((state) => ({
          wizardData: { ...state.wizardData, hotelStays: stays },
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

      // Update trip basics (dates, origin, travelers, budget) and regenerate days
      updateCurrentTripBasics: (updates) =>
        set((state) => {
          if (!state.currentTrip) return {};
          const merged = { ...state.currentTrip, ...updates };
          // Regenerate days if dates changed
          if (updates.departureDate || updates.returnDate) {
            const baseDays = generateDays(merged.departureDate, merged.returnDate);
            const existingDays = state.currentTrip.days || [];
            const days = baseDays.map((d) => {
              const existing = existingDays.find((e) => e.date === d.date);
              return existing
                ? { ...d, ...existing }
                : { ...d, location: '', locationTier: 'city', travelTypes: [], isTravelDay: false };
            });
            merged.days = days;
          }
          return { currentTrip: merged };
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

      saveEvent: (dayIndex, event) =>
        set((state) => {
          const dayEvents = state.savedEvents[dayIndex] || [];
          const alreadySaved = dayEvents.some((e) => e.title === event.title);
          if (alreadySaved) return {};
          return {
            savedEvents: {
              ...state.savedEvents,
              [dayIndex]: [...dayEvents, { ...event, savedAt: new Date().toISOString() }],
            },
          };
        }),

      removeEvent: (dayIndex, eventTitle) =>
        set((state) => ({
          savedEvents: {
            ...state.savedEvents,
            [dayIndex]: (state.savedEvents[dayIndex] || []).filter(
              (e) => e.title !== eventTitle
            ),
          },
        })),

      setActivityTimeSlot: (dayIndex, activityName, slot) =>
        set((state) => ({
          activityTimeSlots: {
            ...state.activityTimeSlots,
            [`${dayIndex}-${activityName}`]: slot,
          },
        })),

      setActivityNote: (dayIndex, activityName, note) =>
        set((state) => ({
          activityNotes: {
            ...state.activityNotes,
            [`${dayIndex}-${activityName}`]: note,
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
        savedEvents: state.savedEvents,
        activityTimeSlots: state.activityTimeSlots,
        activityNotes: state.activityNotes,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
