"use client"

import { format, isFirstDayOfMonth, getDate, getMonth, getYear, isSameYear, isMonday } from "date-fns"
import { cn } from "@/lib/utils"
import type { TimelineHeaderProps } from "@/types/timeline"

const TimelineHeader = ({ startDate, endDate, zoomLevel, getPositionForDate }: TimelineHeaderProps) => {
  // Generate ruler-style header with months and days
  const generateRulerHeader = () => {
    const monthRows = []
    const dayRows = []
    const gridLines = []

    const currentDate = new Date(startDate)
    let currentMonth: number | null = null
    let monthStartPosition = 0
    let monthWidth = 0

    // Process each day in the timeline
    while (currentDate <= endDate) {
      const position = getPositionForDate(currentDate)
      const day = getDate(currentDate)
      const month = getMonth(currentDate)
      const year = getYear(currentDate)
      const isFirstDay = isFirstDayOfMonth(currentDate)

      // Determine if we should show this day based on zoom level
      let showDay = false

      if (zoomLevel === "day") {
        // Show every day
        showDay = true
      } else if (zoomLevel === "week") {
        // Show first day of week (Monday) and first day of month
        showDay = isMonday(currentDate) || isFirstDay
      } else if (zoomLevel === "month") {
        // Show 1st, 8th, 15th, 22nd of each month
        showDay = day === 1 || day === 8 || day === 15 || day === 22
      } else if (zoomLevel === "quarter") {
        // Show only first day of month
        showDay = isFirstDay
      } else if (zoomLevel === "year") {
        // Show only first day of quarter months (Jan, Apr, Jul, Oct)
        showDay = isFirstDay && (month === 0 || month === 3 || month === 6 || month === 9)
      }

      // Add day cell if it should be shown
      if (showDay) {
        // Add special class for first day of month
        const dayClass = cn(
          "absolute w-6 h-6 border rounded flex items-center justify-center text-xs transform -translate-x-1/2 mt-0.5",
          isFirstDay ? "border-neutral-500 text-neutral-200 font-medium" : "border-neutral-700 text-neutral-400",
        )

        dayRows.push(
          <div key={`day-${currentDate.toISOString()}`} className={dayClass} style={{ left: `${position}%` }}>
            {day}
          </div>,
        )
      }

      // Handle month cells
      if (isFirstDay || currentDate.getTime() === startDate.getTime()) {
        // If we were tracking a previous month, add it to the output
        if (currentMonth !== null) {
          const monthEndPosition = position
          monthWidth = monthEndPosition - monthStartPosition

          // Only add month if it's visible based on zoom level
          if (
            zoomLevel === "day" ||
            zoomLevel === "week" ||
            zoomLevel === "month" ||
            (zoomLevel === "quarter" && (currentMonth % 3 === 0 || currentMonth === getMonth(startDate))) ||
            (zoomLevel === "year" && (currentMonth === 0 || currentMonth === 6 || currentMonth === getMonth(startDate)))
          ) {
            const monthDate = new Date(year, currentMonth, 1)
            monthRows.push(
              <div
                key={`month-${monthDate.toISOString()}`}
                className="absolute h-[30px] bg-neutral-900 border-r border-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-400 overflow-hidden whitespace-nowrap"
                style={{
                  left: `${monthStartPosition}%`,
                  width: `${monthWidth}%`,
                }}
              >
                {format(monthDate, "MMM")} {!isSameYear(monthDate, new Date()) ? year : ""}
              </div>,
            )
          }
        }

        // Start tracking the new month
        currentMonth = month
        monthStartPosition = position

        // Add vertical grid line for month start
        gridLines.push(
          <div
            key={`grid-${currentDate.toISOString()}`}
            className="absolute top-0 bottom-0 w-px bg-neutral-800 z-[1]"
            style={{ left: `${position}%` }}
          />,
        )
      }

      // Move to next day
      currentDate.setDate(getDate(currentDate) + 1)
    }

    // Add the last month if we were tracking one
    if (currentMonth !== null) {
      const monthEndPosition = getPositionForDate(endDate)
      monthWidth = monthEndPosition - monthStartPosition

      const monthDate = new Date(getYear(endDate), currentMonth, 1)
      monthRows.push(
        <div
          key={`month-${monthDate.toISOString()}`}
          className="absolute h-[30px] bg-neutral-900 border-r border-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-400 overflow-hidden whitespace-nowrap"
          style={{
            left: `${monthStartPosition}%`,
            width: `${monthWidth}%`,
          }}
        >
          {format(monthDate, "MMM")} {!isSameYear(monthDate, new Date()) ? getYear(endDate) : ""}
        </div>,
      )
    }

    return (
      <>
        <div className="absolute top-0 left-0 right-0 h-[30px]">{monthRows}</div>
        <div className="absolute top-[30px] left-0 right-0 h-[30px]">{dayRows}</div>
        {gridLines}
      </>
    )
  }

  return <>{generateRulerHeader()}</>
}

export default TimelineHeader
