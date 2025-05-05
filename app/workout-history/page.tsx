'use client'

import { useState, useEffect } from 'react'
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Trash2
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { WORKOUT_TYPES } from '@/lib/constants'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/hooks/useUser'
import type { Workout } from '@/types/workout'
import Navbar from '@/components/navbar'

export default function WorkoutHistory() {
  const { user } = useUser()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [newWorkout, setNewWorkout] = useState({ type: '', date: '' })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching workouts:', error)
      } else {
        setWorkouts(data)
      }
    }
    fetchWorkouts()
  }, [user])

  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    const day = 1
    setNewWorkout(prev => ({
      ...prev,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }))
  }, [currentDate])

  const handleAddWorkout = async () => {
    if (!user || !newWorkout.type || !newWorkout.date) return
    const { data, error } = await supabase
      .from('workout_history')
      .insert({
        user_id: user.id,
        type: newWorkout.type,
        date: newWorkout.date
      })
      .select()

    if (error) {
      console.error('Insert error:', error)
      return
    }

    if (data) {
      setWorkouts(prev => [...prev, ...data])
      setNewWorkout({ type: '', date: newWorkout.date })
      setIsDialogOpen(false)
    }
  }

  const handleDeleteWorkout = async (id: number) => {
    const { error } = await supabase
      .from('workout_history')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete error:', error)
    } else {
      setWorkouts(prev => prev.filter(w => w.id !== id))
    }
  }

  const changeMonth = (month: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), month, 1))
  }

  const changeYear = (delta: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear() + delta, prev.getMonth(), 1))
  }

  const formatDate = (date: string) => {
    const [y, m, d] = date.split('-').map(Number)
    const localDate = new Date(y, m - 1, d, 12)
    return localDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }

  const getMonthName = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())

  const monthsWithActivity = workouts.reduce((acc, w) => {
    const [year, month] = w.date.split('-').map(Number)
    acc[`${year}-${month - 1}`] = true
    return acc
  }, {} as Record<string, boolean>)

  const renderMonthNavigation = (): JSX.Element[] => {
    const months = []
    const year = currentDate.getFullYear()
    for (let month = 0; month < 12; month++) {
      const key = `${year}-${month}`
      const isCurrent = month === currentDate.getMonth()
      const active = monthsWithActivity[key]
      months.push(
        <button
          key={month}
          onClick={() => changeMonth(month)}
          className={`flex-1 flex flex-col items-center justify-center p-2 rounded-md text-sm h-14
            ${isCurrent ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-gray-100'}
            ${active && !isCurrent ? 'text-blue-600' : ''}
          `}
        >
          <span>{new Date(year, month).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>
          <span className="w-1 h-1 mt-1">
            {active && <span className="block w-full h-full bg-blue-500 rounded-full"></span>}
          </span>
        </button>
      )
    }
    return months
  }

  const filteredWorkouts = workouts
    .filter(w => {
      const [y, m, d] = w.date.split('-').map(Number)
      const date = new Date(y, m - 1, d, 12)
      return date.getFullYear() === currentDate.getFullYear() &&
             date.getMonth() === currentDate.getMonth()
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totals = filteredWorkouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
    <Navbar />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <h2 className="text-2xl font-semibold mb-6">History</h2>

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

      <h2 className="text-2xl font-semibold mb-4">{getMonthName(currentDate)}</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Workouts</h3>
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
                    <Label className="text-right">Type</Label>
                    <Select onValueChange={val => setNewWorkout(w => ({ ...w, type: val }))}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select workout type" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKOUT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Date</Label>
                    <Input
                      type="date"
                      value={newWorkout.date}
                      onChange={e => setNewWorkout(w => ({ ...w, date: e.target.value }))}
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
              {filteredWorkouts.map(workout => (
                <li key={workout.id}>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{workout.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{formatDate(workout.date)}</span>
                      <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent"
                        onClick={() => handleDeleteWorkout(workout.id)}>
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No workouts recorded for this month.</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Totals</h3>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(totals).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-sm">{type}</span>
                  <span className="font-semibold text-lg">{count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="font-bold text-lg">Total Workouts</span>
              <span className="font-bold text-lg">{filteredWorkouts.length}</span>
            </div>
          </div>
        </div>
     </div>
    </div>
   </div>
  );
}

