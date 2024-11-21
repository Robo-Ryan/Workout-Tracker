// =============================================
// ============= 1. IMPORTS =================== 
// =============================================
'use client'

import { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Workout } from '@/types/workout'
import { WORKOUT_TYPES } from '@/lib/constants'

// =============================================
// ============= 2. DATA ====================== 
// =============================================
// Predefined workout types
const workoutTypes = WORKOUT_TYPES

// Extended mock data for demonstration
const mockWorkouts = [
  { 
    id: 1, 
    type: 'Chest Day', 
    date: '2024-01-05',
  },
  { 
    id: 2, 
    type: 'Leg Day Quads', 
    date: '2024-01-08',
  },
  { 
    id: 3, 
    type: 'Back Day', 
    date: '2024-01-12',
  },
  { 
    id: 4, 
    type: 'Shoulders Day', 
    date: '2024-01-15',
  },
  { 
    id: 5, 
    type: 'Leg Day Glutes', 
    date: '2024-01-18',
  },
]

export default function WorkoutHistory() {
  // =============================================
  // ============= 3. INITIALIZATION ============ 
  // =============================================
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('workouts')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return mockWorkouts
  })
  const [newWorkout, setNewWorkout] = useState({ type: '', date: '' })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newBodyweight, setNewBodyweight] = useState(0)

  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts))
  }, [workouts])

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Mes 1-indexado para la fecha
    const day = 1; // Siempre el primer día del mes para el nuevo workout
    setNewWorkout(prev => ({
      ...prev,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }))
  }, [currentDate])

  useEffect(() => {
    setNewBodyweight(0)
  }, [newWorkout])

  // =============================================
  // ============= 4. USER INTERACTIONS ========== 
  // =============================================
  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-').map(Number)
    const d = new Date(year, month - 1, day, 12, 0, 0) // Fecha local a mediodía
    return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }

  const getMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long' })
      .charAt(0).toUpperCase() + 
      date.toLocaleDateString('en-US', { month: 'long' }).slice(1)
  }

  const changeMonth = (month: number) => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), month, 1))
  }

  const changeYear = (increment: number) => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear() + increment, prevDate.getMonth(), 1))
  }

  const filteredWorkouts = workouts
    .filter(workout => {
      const [year, month, day] = workout.date.split('-').map(Number)
      const workoutDate = new Date(year, month - 1, day, 12, 0, 0)
      return workoutDate.getMonth() === currentDate.getMonth() && 
             workoutDate.getFullYear() === currentDate.getFullYear();
    })
    .sort((a, b) => {
      // Ordenar por fecha de más antigua a más reciente
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    });

  const workoutTotals = filteredWorkouts.reduce((acc, workout) => {
    acc[workout.type] = (acc[workout.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalWorkouts = filteredWorkouts.length

  const monthsWithActivity = workouts.reduce((acc, workout) => {
    const [year, month] = workout.date.split('-').map(Number)
    const monthKey = `${year}-${month - 1}` // Mes 0-indexado
    acc[monthKey] = true
    return acc
  }, {} as Record<string, boolean>)

  const handleAddWorkout = () => {
    if (newWorkout.type && newWorkout.date) {
      const newWorkoutEntry: Workout = {
        id: Date.now(),
        type: newWorkout.type as Workout['type'],
        date: newWorkout.date
      };
      
      const updatedWorkouts = [...workouts, newWorkoutEntry];
      setWorkouts(updatedWorkouts);
      localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
      setNewWorkout({ type: '', date: newWorkout.date });
      setIsDialogOpen(false);
    }
  };

  const renderMonthNavigation = () => {
    const months = []
    const year = currentDate.getFullYear()
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1)
      const monthKey = `${year}-${month}`
      const hasActivity = monthsWithActivity[monthKey]
      const isCurrentMonth = currentDate.getMonth() === month
      months.push(
        <button
          key={month}
          onClick={() => changeMonth(month)}
          className={`flex-1 flex flex-col items-center justify-center p-2 rounded-md transition-colors text-sm h-14
            ${isCurrentMonth 
              ? 'bg-primary text-primary-foreground font-semibold' 
              : 'hover:bg-gray-100'
            }
            ${hasActivity && !isCurrentMonth ? 'text-blue-600' : ''}
          `}
        >
          <span>{date.toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>
          <span className="w-1 h-1 mt-1">
            {hasActivity && <span className="block w-full h-full bg-blue-500 rounded-full"></span>}
          </span>
        </button>
      )
    }
    return months
  }

  const WorkoutCard = ({ workout }: { workout: Workout }) => {
    const handleDelete = () => {
      const updatedWorkouts = workouts.filter(w => w.id !== workout.id);
      setWorkouts(updatedWorkouts);
      localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
    };

    return (
      <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <span className="font-medium">{workout.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">{formatDate(workout.date)}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDelete}
            className="p-0 h-auto hover:bg-transparent"
          >
            <Trash2 className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
    );
  };

  // =============================================
  // ============= 5. RENDER ==================== 
  // =============================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold my-6">
        <a href="/" className="hover:opacity-80">
          Workout-Tracker
        </a>
      </h1>
      <h2 className="text-2xl font-semibold mb-6">Workout History</h2>

      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => changeYear(-1)} className="p-2 rounded-full hover:bg-gray-200">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          <span className="text-xl font-semibold">{currentDate.getFullYear()}</span>
        </div>
        <button onClick={() => changeYear(1)} className="p-2 rounded-full hover:bg-gray-200">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex w-full space-x-1">
          {renderMonthNavigation()}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{getMonth(currentDate)}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Workouts</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Workout</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="workout-type" className="text-right">
                      Type
                    </Label>
                    <Select onValueChange={(value) => setNewWorkout({ ...newWorkout, type: value })}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select workout type" />
                      </SelectTrigger>
                      <SelectContent>
                        {workoutTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="workout-date" className="text-right">
                      Date
                    </Label>
                    <Input
                      id="workout-date"
                      type="date"
                      value={newWorkout.date}
                      onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <Button onClick={handleAddWorkout}>Add Workout</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {filteredWorkouts.length > 0 ? (
            <ul className="space-y-2">
              {filteredWorkouts.map((workout) => (
                <li key={workout.id}>
                  <WorkoutCard workout={workout} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No workouts recorded for this month.</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Totals</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(workoutTotals).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm">{type}</span>
                  <span className="font-semibold text-lg">{count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total Workouts</span>
                <span className="font-bold text-lg">{totalWorkouts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}