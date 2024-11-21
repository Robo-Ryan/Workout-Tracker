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

  const handleEditExercise = (dayId: number, exerciseId: number, weights: number[], reps: number[]) => {
    setEditingExercise({ dayId, exerciseId })
    setEditedWeights(weights.map(String))
    setEditedReps(reps.map(String))
  }

  const handleSaveExercise = (dayId: number, exerciseId: number) => {
    const newWeights = editedWeights.map(Number)
    const newReps = editedReps.map(Number)

    setWorkoutDays(prevDays => 
      prevDays.map(day => 
        day.id === dayId 
          ? {
              ...day, 
              exercises: day.exercises.map(ex => 
                ex.id === exerciseId ? { 
                  ...ex, 
                  weights: newWeights, 
                  reps: newReps,
                  oldWeights: ex.weights,
                  oldReps: ex.reps
                } : ex
              )
            }
          : day
      )
    )
    setEditingExercise(null)
  }

  const handleDeleteExercise = (dayId: number, exerciseId: number) => {
    setWorkoutDays(prevDays => 
      prevDays.map(day => 
        day.id === dayId 
          ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) }
          : day
      )
    )
  }

  const handleAddWorkout = () => {
    if (newWorkoutName.trim()) {
      setWorkoutDays(prevDays => [
        ...prevDays,
        {
          id: Date.now(),
          name: newWorkoutName.trim(),
          exercises: [],
          inProgress: false,
          newExercise: { name: "", weights: "", reps: "" },
        }
      ])
      setNewWorkoutName("")
    }
  }

  const handleBeginWorkout = (dayId: number) => {
    setWorkoutDays(prevDays =>
      prevDays.map(day =>
        day.id === dayId
          ? { ...day, inProgress: true, exercises: day.exercises.map(ex => ({ ...ex, completed: false })) }
          : day
      )
    )
  }

  const handleCompleteExercise = (dayId: number, exerciseId: number, completed: boolean) => {
    setWorkoutDays(prevDays =>
      prevDays.map(day =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map(ex =>
                ex.id === exerciseId ? { ...ex, completed } : ex
              )
            }
          : day
      )
    )
  }

  const handleNewExerciseChange = (dayId: number, field: keyof NewExercise, value: string) => {
    setWorkoutDays(prevDays =>
      prevDays.map(day =>
        day.id === dayId
          ? { ...day, newExercise: { ...day.newExercise, [field]: value } }
          : day
      )
    )
  }

  const handleAddExercise = (dayId: number) => {
    setWorkoutDays(prevDays =>
      prevDays.map(day => {
        if (day.id === dayId && day.newExercise.name && day.newExercise.weights && day.newExercise.reps) {
          const weights = day.newExercise.weights.split(',').map(Number)
          const reps = day.newExercise.reps.split(',').map(Number)
          
          return {
            ...day,
            exercises: [
              ...day.exercises,
              {
                id: Date.now(),
                name: day.newExercise.name,
                weights,
                reps
              }
            ],
            newExercise: { name: "", weights: "", reps: "" }
          }
        }
        return day
      })
    )
  }

  const handleFinishWorkout = (dayId: number) => {
    const workoutDay = workoutDays.find(day => day.id === dayId);
    
    if (workoutDay) {
      const existingWorkouts: Workout[] = JSON.parse(localStorage.getItem('workouts') || '[]');
      
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); // Mes 0-indexado
      const day = today.getDate();
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const newWorkout: Workout = {
        id: Date.now(),
        type: workoutDay.name as WorkoutType,
        date: formattedDate
      };
      
      localStorage.setItem('workouts', JSON.stringify([...existingWorkouts, newWorkout]));
    }

    setWorkoutDays(prevDays =>
      prevDays.map(day =>
        day.id === dayId
          ? { ...day, inProgress: false, exercises: day.exercises.map(ex => ({ ...ex, completed: false })) }
          : day
      )
    );
    
    setShowCompletionDialog(true);
  }

  useEffect(() => {
    workoutDays.forEach(day => {
      if (day.inProgress && day.exercises.every(ex => ex.completed)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        handleFinishWorkout(day.id)
      }
    })
  }, [workoutDays])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold my-6">Workout-Tracker</h1>
      <div className="flex justify-between items-center mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Add New Workout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Workout</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="name"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  className="col-span-3"
                  placeholder="Workout name"
                />
                <Button onClick={handleAddWorkout}>Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Link href="/workout-history" className="text-blue-500 hover:underline">
          View Workout History
        </Link>
      </div>
      <div className="space-y-6">
        {workoutDays.map((day, index) => (
          <Card key={index} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{day.name}</CardTitle>
              {!day.inProgress ? (
                <Button onClick={() => handleBeginWorkout(day.id)}>
                  Begin Workout
                </Button>
              ) : (
                <Button onClick={() => handleFinishWorkout(day.id)}>
                  Finish Workout
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Exercise</TableHead>
                    <TableHead>Weight (lbs)</TableHead>
                    <TableHead>Reps</TableHead>
                    {day.inProgress && <TableHead className="w-[100px]">Completed</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {day.exercises.map(exercise => (
                    <TableRow key={exercise.id} className="bg-secondary">
                      <TableCell className="font-medium flex items-center justify-between">
                        <span>{exercise.name}</span>
                        {editingExercise?.dayId === day.id && editingExercise?.exerciseId === exercise.id ? (
                          <div className="flex">
                            <Button variant="ghost" size="sm" onClick={() => handleSaveExercise(day.id, exercise.id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteExercise(day.id, exercise.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingExercise(null)}>
                              <Cross2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleEditExercise(day.id, exercise.id, exercise.weights, exercise.reps)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingExercise?.dayId === day.id && editingExercise?.exerciseId === exercise.id ? (
                          <div className="flex flex-wrap gap-2">
                            {editedWeights.map((weight, index) => (
                              <Input
                                key={index}
                                type="text"
                                value={weight}
                                onChange={(e) => {
                                  const newWeights = [...editedWeights]
                                  newWeights[index] = e.target.value
                                  setEditedWeights(newWeights)
                                }}
                                className="w-16"
                              />
                            ))}
                          </div>
                        ) : (
                          <div>
                            <span>{exercise.weights.join(", ")}</span>
                            {exercise.oldWeights && (
                              <div className="text-sm text-muted-foreground line-through">
                                {exercise.oldWeights.join(", ")}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingExercise?.dayId === day.id && editingExercise?.exerciseId === exercise.id ? (
                          <div className="flex flex-wrap gap-2">
                            {editedReps.map((rep, index) => (
                              <Input
                                key={index}
                                type="text"
                                value={rep}
                                onChange={(e) => {
                                  const newReps = [...editedReps]
                                  newReps[index] = e.target.value
                                  setEditedReps(newReps)
                                }}
                                className="w-16"
                              />
                            ))}
                          </div>
                        ) : (
                          <div>
                            <span>{exercise.reps.join(", ")}</span>
                            {exercise.oldReps && (
                              <div className="text-sm text-muted-foreground line-through">
                                {exercise.oldReps.join(", ")}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      {day.inProgress && (
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-12 h-12 p-0"
                              onClick={() => handleCompleteExercise(day.id, exercise.id, !exercise.completed)}
                            >
                              {exercise.completed ? (
                                <Check className="h-10 w-10 text-green-600" />
                              ) : (
                                <div className="h-8 w-8 rounded-full border-2 border-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="flex items-center justify-between">
                      <Input
                        placeholder="Pushups"
                        className="placeholder:sm:hidden"
                        value={day.newExercise.name}
                        onChange={(e) => handleNewExerciseChange(day.id, 'name', e.target.value)}
                      />
                      <Button variant="secondary" onClick={() => handleAddExercise(day.id)}>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Input
                        className="placeholder:sm:hidden"
                        value={day.newExercise.weights}
                        onChange={(e) => handleNewExerciseChange(day.id, 'weights', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="placeholder:sm:hidden"
                        value={day.newExercise.reps}
                        onChange={(e) => handleNewExerciseChange(day.id, 'reps', e.target.value)}
                      />
                    </TableCell>
                    {day.inProgress && <TableCell />}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-2xl">
              <span role="img" aria-label="Weightlifter" className="mr-2">🏋️</span> Good work!
            </DialogTitle>
          </DialogHeader>
          <p className="text-center">Your workout was added to workout history.</p>
          <Button onClick={() => setShowCompletionDialog(false)} className="mt-4">Okay</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}