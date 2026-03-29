'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { addLocalDays, getLocalDateKey, getStartOfLocalDay } from '@/lib/date';
import { useAuth } from './AuthContext';
import { apiFetch } from '@/lib/api';

type Goal = 'fast' | 'moderate' | 'maintenance' | null;
type Sex = 'male' | 'female' | null;
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'intense' | null;

interface Meal {
  time: string;
  title: string;
  description: string;
  completed: boolean;
}

interface DailyPlan {
  dayOfWeek: number;
  dayName: string;
  meals: Meal[];
}

interface DailyMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface PlanSummary {
  dailyCalories: number;
  deficit: number;
  weeklyLossKg: number;
  monthlyLossKg: number;
  weeksToGoal: number;
}

interface Plan {
  waterTarget: number;
  weeklyPlan: DailyPlan[];
  warnings?: string[];
  dailyMacros?: DailyMacros;
  shoppingList?: Record<string, string[]>;
  summary?: PlanSummary;
}

interface ProgressEntry {
  date: string;
  weight: number;
}

const getLatestProgressWeight = (entries: ProgressEntry[]): number | null => {
  if (entries.length === 0) {
    return null;
  }

  const [latestEntry] = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  return latestEntry.weight;
};

interface ProtocolContextType {
  weight: number | null;
  height: number | null;
  age: number | null;
  sex: Sex;
  activityLevel: ActivityLevel;
  comorbidities: string;
  medications: string;
  goal: Goal;
  targetWeight: number | null;
  plan: Plan | null;
  waterLog: Record<string, number>;
  waterEventsLog: Record<string, number[]>;
  waterConsumed: number;
  waterTarget: number;
  progress: ProgressEntry[];
  streak: number;
  setWeight: (w: number) => void;
  setHeight: (h: number) => void;
  setAge: (a: number) => void;
  setSex: (s: Sex) => void;
  setActivityLevel: (l: ActivityLevel) => void;
  setComorbidities: (c: string) => void;
  setMedications: (m: string) => void;
  setGoal: (g: Goal) => void;
  setTargetWeight: (w: number) => void;
  setPlan: (p: Plan) => void;
  addWater: (ml: number) => void;
  undoWater: () => void;
  addProgress: (weight: number) => void;
  deleteProgress: (date: string) => void;
  toggleMeal: (dayOfWeek: number, mealIndex: number) => void;
}

const ProtocolContext = createContext<ProtocolContextType | undefined>(undefined);

const getToday = () => getLocalDateKey();
const LEGACY_PROTOCOL_STORAGE_KEY = 'protocolState';
const getProtocolStorageKey = (userIdentifier: string | null) =>
  userIdentifier ? `protocolState:${userIdentifier}` : 'protocolState:guest';

const createEmptyProtocolState = () => ({
  weight: null as number | null,
  height: null as number | null,
  age: null as number | null,
  sex: null as Sex,
  activityLevel: null as ActivityLevel,
  comorbidities: '',
  medications: '',
  goal: null as Goal,
  targetWeight: null as number | null,
  plan: null as Plan | null,
  waterLog: {} as Record<string, number>,
  waterEventsLog: {} as Record<string, number[]>,
  mealActivityLog: {} as Record<string, boolean>,
  progress: [] as ProgressEntry[],
  streak: 0,
});

export const ProtocolProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [weight, setWeightState] = useState<number | null>(null);
  const [height, setHeightState] = useState<number | null>(null);
  const [age, setAgeState] = useState<number | null>(null);
  const [sex, setSexState] = useState<Sex>(null);
  const [activityLevel, setActivityLevelState] = useState<ActivityLevel>(null);
  const [comorbidities, setComorbiditiesState] = useState<string>('');
  const [medications, setMedicationsState] = useState<string>('');
  const [goal, setGoalState] = useState<Goal>(null);
  const [targetWeight, setTargetWeightState] = useState<number | null>(null);
  const [plan, setPlanState] = useState<Plan | null>(null);
  const [waterLog, setWaterLogState] = useState<Record<string, number>>({});
  const [waterEventsLog, setWaterEventsLogState] = useState<Record<string, number[]>>({});
  const [mealActivityLog, setMealActivityLogState] = useState<Record<string, boolean>>({});
  const [progress, setProgressState] = useState<ProgressEntry[]>([]);
  const [streak, setStreakState] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeStorageKey, setActiveStorageKey] = useState<string>(getProtocolStorageKey(null));
  const hasHydratedFromSource = useRef(false);

  // Convenience derivations
  const waterConsumed = waterLog[getToday()] || 0;
  const waterTarget = weight ? weight * 35 : 2000;

  const applyProtocolState = (state: ReturnType<typeof createEmptyProtocolState>) => {
    setWeightState(state.weight);
    setHeightState(state.height);
    setAgeState(state.age);
    setSexState(state.sex);
    setActivityLevelState(state.activityLevel);
    setComorbiditiesState(state.comorbidities);
    setMedicationsState(state.medications);
    setGoalState(state.goal);
    setTargetWeightState(state.targetWeight);
    setPlanState(state.plan);
    setWaterLogState(state.waterLog);
    setWaterEventsLogState(state.waterEventsLog);
    setMealActivityLogState(state.mealActivityLog);
    setProgressState(state.progress);
    setStreakState(state.streak);
  };

  const buildStateFromStorage = (savedState: any) => {
    const empty = createEmptyProtocolState();

    const migratedWaterLog =
      savedState?.waterLog && typeof savedState.waterLog === 'object'
        ? savedState.waterLog
        : typeof savedState?.waterConsumed === 'number'
          ? { [getToday()]: savedState.waterConsumed }
          : {};

    return {
      ...empty,
      weight: savedState?.weight ?? null,
      height: savedState?.height ?? null,
      age: savedState?.age ?? null,
      sex: savedState?.sex ?? null,
      activityLevel: savedState?.activityLevel ?? null,
      comorbidities: savedState?.comorbidities ?? '',
      medications: savedState?.medications ?? '',
      goal: savedState?.goal ?? null,
      targetWeight: savedState?.targetWeight ?? null,
      plan: savedState?.plan ?? null,
      waterLog: migratedWaterLog,
      waterEventsLog: savedState?.waterEventsLog ?? {},
      mealActivityLog: savedState?.mealActivityLog ?? {},
      progress: savedState?.progress ?? [],
      streak: savedState?.streak ?? 0,
    };
  };

  useEffect(() => {
    const guestKey = getProtocolStorageKey(null);
    const legacyState = localStorage.getItem(LEGACY_PROTOCOL_STORAGE_KEY);
    if (legacyState && !localStorage.getItem(guestKey)) {
      localStorage.setItem(guestKey, legacyState);
      localStorage.removeItem(LEGACY_PROTOCOL_STORAGE_KEY);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (isAuthenticated && !user) return;

    const userIdentifier = isAuthenticated ? (user?.id || user?.email || null) : null;
    const nextStorageKey = getProtocolStorageKey(userIdentifier);
    const savedState = localStorage.getItem(nextStorageKey);
    let nextState = createEmptyProtocolState();

    if (savedState) {
      try {
        nextState = buildStateFromStorage(JSON.parse(savedState));
      } catch (e) {
        console.error('Failed to parse state from localStorage');
      }
    }

    // For authenticated users, the server always wins for identity, profile and plan.
    if (user) {
      nextState = {
        ...nextState,
        weight: user.weight ?? null,
        height: user.height ?? null,
        age: user.age ?? null,
        sex: user.sex ?? null,
        activityLevel: user.activityLevel ?? null,
        comorbidities: user.comorbidities ?? '',
        medications: user.medications ?? '',
        goal: user.goal ?? null,
        targetWeight: user.targetWeight ?? null,
        plan: user.plan ?? null,
        progress: Array.isArray(user.progress) ? user.progress : nextState.progress,
        waterLog: user.waterLog && typeof user.waterLog === 'object' ? user.waterLog : nextState.waterLog,
        waterEventsLog: user.waterEventsLog && typeof user.waterEventsLog === 'object' ? user.waterEventsLog : nextState.waterEventsLog,
        mealActivityLog: user.mealActivityLog && typeof user.mealActivityLog === 'object' ? user.mealActivityLog : nextState.mealActivityLog,
      };
    }

    applyProtocolState(nextState);
    setActiveStorageKey(nextStorageKey);
    hasHydratedFromSource.current = true;
  }, [isLoaded, isAuthenticated, user]);

  useEffect(() => {
    if (isLoaded && activeStorageKey) {
      const stateToSave = {
        weight, height, age, sex, activityLevel, comorbidities, medications,
        goal, targetWeight, plan, waterLog, waterEventsLog, mealActivityLog, progress, streak
      };
      localStorage.setItem(activeStorageKey, JSON.stringify(stateToSave));
    }
  }, [weight, height, age, sex, activityLevel, comorbidities, medications, goal, targetWeight, plan, waterLog, waterEventsLog, mealActivityLog, progress, streak, isLoaded, activeStorageKey]);

  useEffect(() => {
    if (!isLoaded || !isAuthenticated || !user || !hasHydratedFromSource.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      apiFetch('/auth/me/profile', {
        method: 'POST',
        body: JSON.stringify({
          weight,
          plan,
          progress,
          waterLog,
          waterEventsLog,
          mealActivityLog,
        }),
      }).catch((error) => {
        console.error('Failed to sync protocol state to server', error);
      });
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [weight, plan, progress, waterLog, waterEventsLog, mealActivityLog, isLoaded, isAuthenticated, user]);

  useEffect(() => {
    if (!isLoaded) return;

    const progressDates = new Set(progress.map((entry) => entry.date));
    let nextStreak = 0;
    let cursor = getStartOfLocalDay();

    while (true) {
      const dateKey = getLocalDateKey(cursor);
      const hasWeightLog = progressDates.has(dateKey);
      const hitWaterGoal = (waterLog[dateKey] || 0) >= waterTarget;
      const completedMeal = mealActivityLog[dateKey] === true;

      if (!hasWeightLog && !hitWaterGoal && !completedMeal) {
        break;
      }

      nextStreak += 1;
      cursor = addLocalDays(cursor, -1);
    }

    setStreakState(nextStreak);
  }, [progress, waterLog, waterTarget, mealActivityLog, isLoaded]);

  const setWeight = (w: number) => setWeightState(w);
  const setHeight = (h: number) => setHeightState(h);
  const setAge = (a: number) => setAgeState(a);
  const setSex = (s: Sex) => setSexState(s);
  const setActivityLevel = (l: ActivityLevel) => setActivityLevelState(l);
  const setComorbidities = (c: string) => setComorbiditiesState(c);
  const setMedications = (m: string) => setMedicationsState(m);
  const setGoal = (g: Goal) => setGoalState(g);
  const setTargetWeight = (w: number) => setTargetWeightState(w);
  const setPlan = (p: Plan) => setPlanState(p);

  const addWater = (ml: number) => {
    const today = getToday();
    setWaterLogState(prev => ({ ...prev, [today]: (prev[today] || 0) + ml }));
    setWaterEventsLogState(prev => ({
      ...prev,
      [today]: [...(prev[today] || []), ml],
    }));
  };

  const undoWater = () => {
    const today = getToday();
    const todaysEvents = waterEventsLog[today] || [];

    if (todaysEvents.length === 0) {
      return;
    }

    const removedMl = todaysEvents[todaysEvents.length - 1];

    setWaterEventsLogState(prev => {
      const nextEvents = (prev[today] || []).slice(0, -1);
      const nextLog = { ...prev };

      if (nextEvents.length > 0) {
        nextLog[today] = nextEvents;
      } else {
        delete nextLog[today];
      }

      return nextLog;
    });

    setWaterLogState(prev => {
      const nextAmount = Math.max(0, (prev[today] || 0) - removedMl);
      const nextLog = { ...prev };

      if (nextAmount > 0) {
        nextLog[today] = nextAmount;
      } else {
        delete nextLog[today];
      }

      return nextLog;
    });
  };

  const addProgress = (w: number) => {
    const today = getToday();
    setProgressState(prev => {
      const existing = prev.find(p => p.date === today);
      if (existing) return prev.map(p => p.date === today ? { ...p, weight: w } : p);
      return [...prev, { date: today, weight: w }];
    });
    setWeightState(w);
  };

  const deleteProgress = (date: string) => {
    setProgressState(prev => {
      const newProgress = prev.filter(p => p.date !== date);

      setWeightState(getLatestProgressWeight(newProgress));

      return newProgress;
    });
  };

  const toggleMeal = (dayOfWeek: number, mealIndex: number) => {
    setPlanState(prev => {
      if (!prev || !prev.weeklyPlan) return prev;
      let nextMealActivityLog = mealActivityLog;
      const newWeeklyPlan = prev.weeklyPlan.map(dayPlan => {
        if (dayPlan.dayOfWeek === dayOfWeek) {
          const newMeals = [...dayPlan.meals];
          newMeals[mealIndex] = { ...newMeals[mealIndex], completed: !newMeals[mealIndex].completed };
          if (dayOfWeek === new Date().getDay()) {
            const today = getToday();
            const hasCompletedMeal = newMeals.some((meal) => meal.completed);
            setMealActivityLogState((current) => {
              if (hasCompletedMeal) {
                nextMealActivityLog = { ...current, [today]: true };
                return nextMealActivityLog;
              }

              const nextLog = { ...current };
              delete nextLog[today];
              nextMealActivityLog = nextLog;
              return nextLog;
            });
          }
          return { ...dayPlan, meals: newMeals };
        }
        return dayPlan;
      });
      const nextPlan = { ...prev, weeklyPlan: newWeeklyPlan };

      if (isAuthenticated && user) {
        apiFetch('/auth/me/profile', {
          method: 'POST',
          body: JSON.stringify({
            plan: nextPlan,
            mealActivityLog: nextMealActivityLog,
          }),
        }).catch((error) => {
          console.error('Failed to persist meal completion state', error);
        });
      }

      return nextPlan;
    });
  };

  if (!isLoaded) return null;

  return (
    <ProtocolContext.Provider value={{
      weight, height, age, sex, activityLevel, comorbidities, medications, goal, targetWeight, plan,
      waterLog, waterEventsLog, waterConsumed, waterTarget, progress, streak,
      setWeight, setHeight, setAge, setSex, setActivityLevel, setComorbidities, setMedications,
      setGoal, setTargetWeight, setPlan, addWater, undoWater, addProgress, deleteProgress, toggleMeal
    }}>
      {children}
    </ProtocolContext.Provider>
  );
};

export const useProtocol = () => {
  const context = useContext(ProtocolContext);
  if (!context) throw new Error('useProtocol must be used within ProtocolProvider');
  return context;
};
