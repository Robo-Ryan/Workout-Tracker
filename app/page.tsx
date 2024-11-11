"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, X, Save, Check } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import confetti from 'canvas-confetti'
import Link from 'next/link'

interface Exercise {
  id: number
  name: string
  weights: number[]
  reps: number[]
  oldWeights?: number[]
  oldReps?: number[]
  completed?: boolean
}

interface WorkoutDay {
  id: number
  name: string
  exercises: Exercise[]
  inProgress: boolean
}

// Definir los tipos de workout constantes
const WORKOUT_TYPES = [
  "Chest Day",
  "Back Day",
  "Leg Day Glutes",
  "Leg Day Quads",
  "Shoulders Day"
] as const;

export default function Home() {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>(() => {
    // Intentar cargar desde localStorage primero
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('workoutDays')
      if (saved) return JSON.parse(saved)
    }
    
    // Si no hay datos guardados, usar los tipos predefinidos
    return WORKOUT_TYPES.map((type, index) => ({
      id: index + 1,
      name: type,
      exercises: type === "Chest Day" ? [
        { id: 1, name: "Bench Press", weights: [90, 110, 120], reps: [12, 9, 6] },
        { id: 2, name: "Incline Bench Press", weights: [80, 100, 110], reps: [12, 9, 6] },
        { id: 3, name: "Cables", weights: [50, 60, 70], reps: [15, 12, 10] },
        { id: 4, name: "Chest Fly Machine", weights: [100, 120, 140], reps: [12, 10, 8] },
      ] : type === "Back Day" ? [
        { id: 1, name: "Lats", weights: [150, 165, 180], reps: [12, 9, 6] },
        { id: 2, name: "Dead", weights: [90, 110, 130], reps: [12, 9, 6] },
        { id: 3, name: "Delts opposite fly", weights: [85, 100, 115], reps: [12, 9, 6] },
        { id: 4, name: "Rows", weights: [100, 120, 140], reps: [12, 9, 6] },
        { id: 5, name: "Bar rows", weights: [60, 60, 60], reps: [18, 18, 18] },
      ] : [],
      inProgress: false,
    }))
  })

  // Guardar en localStorage cuando cambie workoutDays
  useEffect(() => {
    localStorage.setItem('workoutDays', JSON.stringify(workoutDays))
  }, [workoutDays])

  const [editingExercise, setEditingExercise] = useState<{ dayId: number, exerciseId: number } | null>(null)
  const [newWorkoutName, setNewWorkoutName] = useState("")
  const [editedWeights, setEditedWeights] = useState<string[]>([])
  const [editedReps, setEditedReps] = useState<string[]>([])
  const [newExercise, setNewExercise] = useState({ name: "", weights: "", reps: "" })

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

  const handleAddExercise = (dayId: number) => {
    if (newExercise.name && newExercise.weights && newExercise.reps) {
      const weights = newExercise.weights.split(',').map(Number)
      const reps = newExercise.reps.split(',').map(Number)
      
      setWorkoutDays(prevDays => 
        prevDays.map(day => 
          day.id === dayId 
            ? {
                ...day,
                exercises: [
                  ...day.exercises,
                  {
                    id: Date.now(),
                    name: newExercise.name,
                    weights,
                    reps
                  }
                ]
              }
            : day
        )
      )
      setNewExercise({ name: "", weights: "", reps: "" })
    }
  }

  const handleFinishWorkout = (dayId: number) => {
    const workoutDay = workoutDays.find(day => day.id === dayId);
    if (workoutDay) {
      // Obtener workouts existentes
      const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      
      // Agregar nuevo workout
      const newWorkout = {
        id: Date.now(), // usar timestamp como ID único
        type: workoutDay.name,
        date: new Date().toISOString().split('T')[0]
      };
      
      // Guardar workouts actualizados
      localStorage.setItem('workouts', JSON.stringify([...existingWorkouts, newWorkout]));
    }

    setWorkoutDays(prevDays =>
      prevDays.map(day =>
        day.id === dayId
          ? { ...day, inProgress: false, exercises: day.exercises.map(ex => ({ ...ex, completed: false })) }
          : day
      )
    )
    // Here you would typically save the completed workout to your workout history
    console.log(`Workout ${dayId} completed and saved to history`)
  }

  useEffect(() => {
    workoutDays.forEach(day => {
      if (day.inProgress && day.exercises.every(ex => ex.completed)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
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
              <Plus className="mr-2 h-4 w-4" /> Add New Workout
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
        {workoutDays.map(day => (
          <Card key={day.id} className="w-full">
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
                    <TableHead className="w-[200px]">Exercise</TableHead>
                    <TableHead>Weight (lbs)</TableHead>
                    <TableHead>Reps</TableHead>
                    <TableHead className="w-[100px]">Edit</TableHead>
                    {day.inProgress && <TableHead className="w-[100px]">Completed</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {day.exercises.map(exercise => (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium bg-secondary">{exercise.name}</TableCell>
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
                      <TableCell>
                        {editingExercise?.dayId === day.id && editingExercise?.exerciseId === exercise.id ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleSaveExercise(day.id, exercise.id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteExercise(day.id, exercise.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingExercise(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleEditExercise(day.id, exercise.id, exercise.weights, exercise.reps)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                      {day.inProgress && (
                        <TableCell>
                          <RadioGroup
                            onValueChange={(value) => handleCompleteExercise(day.id, exercise.id, value === 'completed')}
                            value={exercise.completed ? 'completed' : 'incomplete'}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="completed" id={`completed-${exercise.id}`} />
                              <RadioGroupItem value="incomplete" id={`incomplete-${exercise.id}`} className="hidden" />
                              <Label htmlFor={`completed-${exercise.id}`} className="cursor-pointer">
                                {exercise.completed ? <Check className="h-4 w-4 text-green-500" /> : null}
                              </Label>
                            </div>
                          </RadioGroup>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <Input
                        placeholder="New exercise name"
                        
                        value={newExercise.name}
                        onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Weight"
                        value={newExercise.weights}
                        onChange={(e) => setNewExercise({ ...newExercise, weights: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Reps"
                        value={newExercise.reps}
                        onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleAddExercise(day.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    {day.inProgress && <TableCell />}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}