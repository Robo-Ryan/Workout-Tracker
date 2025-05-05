import { WORKOUT_TYPES } from "../lib/constants";

export type WorkoutType = typeof WORKOUT_TYPES[number];

export type Workout = {
  id: number
  type: string
  date: string
  user_id?: string // optional if not always used
}