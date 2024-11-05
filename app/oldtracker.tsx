"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Workout {
  id: number
  exercise: string
  sets: number
  reps: number
  weight: number // in pounds
}

export default function Home() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [exercise, setExercise] = useState("")
  const [sets, setSets] = useState("")
  const [reps, setReps] = useState("")
  const [weight, setWeight] = useState("")

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault()
    if (exercise && sets && reps && weight) {
      const newWorkout: Workout = {
        id: Date.now(),
        exercise,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight),
      }
      setWorkouts([...workouts, newWorkout])
      setExercise("")
      setSets("")
      setReps("")
      setWeight("")
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-6">
        Be good. Be great. Work hard.
      </h1>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Workout Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddWorkout} className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="exercise">Exercise</Label>
                <Input
                  id="exercise"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  placeholder="e.g. Push-ups"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  placeholder="e.g. 3"
                  required
                />
              </div>
              <div>
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="e.g. 10"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 110"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Workout
            </Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercise</TableHead>
                <TableHead>Sets</TableHead>
                <TableHead>Reps</TableHead>
                <TableHead>Weight (lbs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workouts.map((workout) => (
                <TableRow key={workout.id}>
                  <TableCell>{workout.exercise}</TableCell>
                  <TableCell>{workout.sets}</TableCell>
                  <TableCell>{workout.reps}</TableCell>
                  <TableCell>{workout.weight}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}