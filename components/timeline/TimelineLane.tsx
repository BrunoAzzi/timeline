"use client"

import TimelineItem from "./TimelineItem"
import { addDaysToDate } from "@/utils/dateUtils"
import type { TimelineLaneProps } from "@/types/timeline"

const TimelineLane = ({
  lane,
  getPositionForDate,
  isEditing,
  onDragStart,
  onEditStart,
  onNameChange,
}: TimelineLaneProps) => {
  return (
    <div className="relative h-[60px]">
      {lane.map((item) => {
        // Calculate positions aligned to day boundaries
        const startPosition = getPositionForDate(new Date(item.start))

        // For end date, we need to add 1 day to include the full end day
        const endDate = addDaysToDate(new Date(item.end), 1)
        const endPosition = getPositionForDate(endDate)

        const width = endPosition - startPosition

        return (
          <TimelineItem
            key={item.id}
            item={item}
            left={startPosition}
            width={width}
            isEditing={isEditing === item.id}
            onDragStart={onDragStart}
            onEditStart={() => onEditStart(item)}
            onNameChange={(newName) => onNameChange(item.id, newName)}
          />
        )
      })}
    </div>
  )
}

export default TimelineLane
