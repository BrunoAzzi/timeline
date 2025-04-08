"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { TimelineItemProps } from "@/types/timeline"

const TimelineItem = ({ item, left, width, onDragStart, isEditing, onEditStart, onNameChange }: TimelineItemProps) => {
  const [name, setName] = useState<string>(item.name)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Update local name state when item changes
  useEffect(() => {
    setName(item.name)
  }, [item.name])

  const handleMouseDown = (e: React.MouseEvent, type: "start" | "end" | "move") => {
    e.stopPropagation()
    e.preventDefault() // Prevent text selection
    if (!isEditing) {
      onDragStart(e, item, type)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEditStart()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onNameChange(name)
    } else if (e.key === "Escape") {
      setName(item.name) // Reset to original name
      onNameChange(item.name)
    }
    e.stopPropagation() // Prevent event bubbling
  }

  const handleBlur = () => {
    onNameChange(name)
  }

  return (
    <div
      className={cn(
        "absolute h-6 bg-neutral-800 border border-neutral-700 rounded",
        "hover:bg-neutral-700 transition-colors duration-150",
      )}
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 0.2)}%`,
        top: "18px",
      }}
    >
      <div
        className="absolute -top-5 left-0 text-xs text-neutral-300 whitespace-nowrap"
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="bg-neutral-900 border border-neutral-700 rounded px-1 py-0.5 text-xs outline-none min-w-[100px]"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          name
        )}
      </div>

      {/* Left handle for start date */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-10 hover:bg-neutral-600/50"
        onMouseDown={(e) => handleMouseDown(e, "start")}
      />

      {/* Middle area for moving the entire event */}
      <div className="absolute inset-0 cursor-move" onMouseDown={(e) => handleMouseDown(e, "move")} />

      {/* Right handle for end date */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-10 hover:bg-neutral-600/50"
        onMouseDown={(e) => handleMouseDown(e, "end")}
      />
    </div>
  )
}

export default TimelineItem
