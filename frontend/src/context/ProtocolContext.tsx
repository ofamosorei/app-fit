'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface Plan {
  waterTarget: number;
  weeklyPlan: DailyPlan[];
}

interface ProgressEntry {
  date: string;
  weight: number;
}

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
  undoWater: (ml: number) => void;
  addProgress: (weight: number) => void;
  toggleMeal: (dayOfWeek: number, mealIndex: number) => void;
}

const ProtocolContext = createContext<ProtocolContextType | undefined>(undefined);

const getToday = () => new Date().toISOString().split('T')[0];

export const ProtocolProvider = ({ children }: { children: React.ReactNode }) => {
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
  const [progress, setProgressState] = useState<ProgressEntry[]>([]);
  const [streak, setStreakState] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Convenience derivations
  const waterConsumed = waterLog[getToday()] || 0;
  const waterTarget = weight ? weight * 35 : 2000;

  useEffect(() => {
    const savedState = localStorage.getItem('protocolState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setWeightState(parsed.weight ?? null);
        setHeightState(parsed.height ?? null);
        setAgeState(parsed.age ?? null);
        setSexState(parsed.sex ?? null);
        setActivityLevelState(parsed.activityLevel ?? null);
        setComorbiditiesState(parsed.comorbidities ?? '');
        setMedicationsState(parsed.medications ?? '');
        setGoalState(parsed.goal ?? null);
        setTargetWeightState(parsed.targetWeight ?? null);
        setPlanState(parsed.plan ?? null);
        setProgressState(parsed.progress ?? []);
        setStreakState(parsed.streak ?? 0);

        // Support migrating old waterConsumed (number) → waterLog (object)
        if (parsed.waterLog && typeof parsed.waterLog === 'object') {
          setWaterLogState(parsed.waterLog);
        } else if (typeof parsed.waterConsumed === 'number') {
          // Migrate: store old value as today's entry (one-time migration)
          setWaterLogState({ [getToday()]: parsed.waterConsumed });
        }
      } catch (e) {
        console.error('Failed to parse state from localStorage');
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const stateToSave = {
        weight, height, age, sex, activityLevel, comorbidities, medications,
        goal, targetWeight, plan, waterLog, progress, streak
      };
      localStorage.setItem('protocolState', JSON.stringify(stateToSave));
    }
  }, [weight, height, age, sex, activityLevel, comorbidities, medications, goal, targetWeight, plan, waterLog, progress, streak, isLoaded]);

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
  };

  const undoWater = (ml: number) => {
    const today = getToday();
    setWaterLogState(prev => ({
      ...prev,
      [today]: Math.max(0, (prev[today] || 0) - ml)
    }));
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

  const toggleMeal = (dayOfWeek: number, mealIndex: number) => {
    setPlanState(prev => {
      if (!prev || !prev.weeklyPlan) return prev;
      const newWeeklyPlan = prev.weeklyPlan.map(dayPlan => {
        if (dayPlan.dayOfWeek === dayOfWeek) {
          const newMeals = [...dayPlan.meals];
          newMeals[mealIndex] = { ...newMeals[mealIndex], completed: !newMeals[mealIndex].completed };
          return { ...dayPlan, meals: newMeals };
        }
        return dayPlan;
      });
      return { ...prev, weeklyPlan: newWeeklyPlan };
    });
  };

  if (!isLoaded) return null;

  return (
    <ProtocolContext.Provider value={{
      weight, height, age, sex, activityLevel, comorbidities, medications, goal, targetWeight, plan,
      waterLog, waterConsumed, waterTarget, progress, streak,
      setWeight, setHeight, setAge, setSex, setActivityLevel, setComorbidities, setMedications,
      setGoal, setTargetWeight, setPlan, addWater, undoWater, addProgress, toggleMeal
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
