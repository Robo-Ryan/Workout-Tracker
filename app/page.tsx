"use client"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Save, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import confetti from 'canvas-confetti'
import Link from 'next/link'
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons"
import type { Workout } from "@/types/workout"
import type { WorkoutType } from "@/types/workout"
import { supabase } from '@/lib/supabaseClient'  // you'll need to create this file if you haven't yet
import { useUser } from '../hooks/useUser'

interface Exercise {
  id: number
  name: string
  weights: number[]
  reps: number[]
  oldWeights?: number[]
  oldReps?: number[]
  completed?: boolean
}

interface NewExercise {
  name: string
  weights: string
  reps: string
}

interface WorkoutDay {
  id: number
  name: string
  exercises: Exercise[]
  inProgress: boolean
  newExercise: NewExercise
}

export default function Home() {
  const user = useUser()

  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([
    {
      id: 1,
      name: "Chest Day",
      exercises: [
        { id: 1, name: "Bench Press", weights: [90, 110, 120], reps: [12, 9, 6] },
        { id: 2, name: "Incline Bench Press", weights: [80, 100, 110], reps: [12, 9, 6] },
        { id: 3, name: "Cables", weights: [50, 60, 70], reps: [15, 12, 10] },
        { id: 4, name: "Chest Fly Machine", weights: [100, 120, 140], reps: [12, 10, 8] },
      ],
      inProgress: false,
      newExercise: { name: "", weights: "", reps: "" },
    },
    {
      id: 2,
      name: "Back Day",
      exercises: [
        { id: 1, name: "Lats", weights: [150, 165, 180], reps: [12, 9, 6] },
        { id: 2, name: "Dead", weights: [90, 110, 130], reps: [12, 9, 6] },
        { id: 3, name: "Delts opposite fly", weights: [85, 100, 115], reps: [12, 9, 6] },
        { id: 4, name: "Rows", weights: [100, 120, 140], reps: [12, 9, 6] },
        { id: 5, name: "Bar rows", weights: [60, 60, 60], reps: [18, 18, 18] },
      ],
      inProgress: false,
      newExercise: { name: "", weights: "", reps: "" },
    },
  ])

  const [editingExercise, setEditingExercise] = useState<{ dayId: number, exerciseId: number } | null>(null)
  const [newWorkoutName, setNewWorkoutName] = useState("")
  const [editedWeights, setEditedWeights] = useState<string[]>([])
  const [editedReps, setEditedReps] = useState<string[]>([])
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)

  const handleFinishWorkout = async (dayId: number) => {
    const workoutDay = workoutDays.find(day => day.id === dayId)

    if (!workoutDay) return

    if (!user) {
      console.warn("User not logged in — workout not saved to Supabase.")
      return
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const { error } = await supabase
      .from('workouts')
      .insert([
        {
          type: workoutDay.name,
          date: formattedDate,
          user_id: user.id,
        }
      ])

    if (error) {
      console.error('Error saving workout to Supabase:', error)
    }

    setWorkoutDays(prevDays =>
      prevDays.map(day =>
        day.id === dayId
          ? { ...day, inProgress: false, exercises: day.exercises.map(ex => ({ ...ex, completed: false })) }
          : day
      )
    )

    setShowCompletionDialog(true)
  }

  useEffect(() => {
    workoutDays.forEach(day => {
      if (day.inProgress && day.exercises.every(ex => ex.completed)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
        handleFinishWorkout(day.id)
      }
    })
  }, [workoutDays])

  // 🧠 Note: This excludes rendering and other handlers — just the logic and finish function.
  // You can copy/paste this directly over your current Home() function.
}