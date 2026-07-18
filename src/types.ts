export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  timestamp: Date;
}

export interface CategoryData {
  name: string;
  label: string;
  amount: number;
  color: string;
  iconName: string;
  limit?: number; // Added for category goals
}

export interface BaseCategory {
  name: string;
  label: string;
  color: string;
  iconName: string;
  limit?: number;
}

export interface CalendarBlock {
  id: string;
  time: string;
  title: string;
  category: 'work' | 'personal' | 'health' | 'admin';
  durationMin: number;
  completed: boolean;
  timestamp?: Date;
}

export interface ShowcaseState {
  isIsometric: boolean;
  glowLevel: 'off' | 'medium' | 'hyper';
  soundEnabled: boolean;
  gridlinesVisible: boolean;
  gridType: 'cyber' | 'fine' | 'none';
  accentColor: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

export interface WorkoutSet {
  reps: number;
  weightKg: number;
}

export interface WorkoutSessionExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: Date;
  exercises: WorkoutSessionExercise[];
}

export interface RecurringItem {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  dayOfMonth?: number;
}
