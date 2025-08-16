'use client'
"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@zyra/ui/components/button"
import { Calendar } from "@zyra/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@zyra/ui/components/popover"

interface Calendar22Props {
  selected?: Date | null
  onChange?: (date: Date | null) => void
  dateFormat?: string
  placeholderText?: string
  className?: string
}

export function Calendar22({
  selected,
  onChange,
  dateFormat = "dd/MM/yyyy",
  placeholderText = "Select date",
  className = "",
}: Calendar22Props) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(selected || undefined)

  React.useEffect(() => {
    if (selected !== undefined) setDate(selected || undefined)
  }, [selected])

  const handleSelect = (d?: Date) => {
    setDate(d)
    if (onChange) onChange(d || null)
    setOpen(false)
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            id="date"
            className="w-48 justify-between font-normal"
            onClick={() => setOpen((prev) => !prev)} 
          >
            {date
              ? date.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : placeholderText}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            defaultMonth={date}
            numberOfMonths={2}
            selected={date}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
