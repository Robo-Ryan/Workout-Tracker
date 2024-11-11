import { WORKOUT_TYPES } from "../lib/constants";

export type WorkoutType = typeof WORKOUT_TYPES[number];

export interface Workout {
  id: number;
  type: WorkoutType;
  date: string;
} 