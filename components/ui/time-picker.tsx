"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minuteStep?: number
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Pick a time",
  className,
  disabled = false,
  minuteStep = 15,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Generate time slots
  const timeSlots = React.useMemo(() => {
    const slots: string[] = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += minuteStep) {
        const h = hour.toString().padStart(2, "0")
        const m = minute.toString().padStart(2, "0")
        slots.push(`${h}:${m}`)
      }
    }
    return slots
  }, [minuteStep])

  const formatTimeDisplay = (time: string) => {
    if (!time) return placeholder
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleSelect = (time: string) => {
    onChange?.(time)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal bg-white dark:bg-gray-800",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTimeDisplay(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 bg-white dark:bg-gray-900" align="start">
        <ScrollArea className="h-64">
          <div className="p-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={value === time ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start font-normal mb-1",
                  value === time && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleSelect(time)}
              >
                {formatTimeDisplay(time)}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
