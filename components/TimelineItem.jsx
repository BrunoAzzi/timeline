"use client"

import { useState, useRef, useEffect } from "react"

const TimelineItem = ({ item, left, width, onDragStart, isEditing, onEditStart, onNameChange }) => {
  const [name, setName] = useState(item.name)
  const inputRef = useRef(null)

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

  const handleMouseDown = (e, type) => {
    e.stopPropagation()
    e.preventDefault() // Prevent text selection
    if (!isEditing) {
      onDragStart(e, item, type)
    }
  }

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    onEditStart()
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleKeyDown = (e) => {
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
      className="timeline-item"
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 0.2)}%`,
        top: "18px",
      }}
    >
      <div className="timeline-item-name" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="timeline-item-name-input"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          item.name
        )}
      </div>

      {/* Left handle for start date */}
      <div className="timeline-handle timeline-handle-left" onMouseDown={(e) => handleMouseDown(e, "start")} />

      {/* Middle area for moving the entire event */}
      <div className="absolute inset-0 cursor-move" onMouseDown={(e) => handleMouseDown(e, "move")} />

      {/* Right handle for end date */}
      <div className="timeline-handle timeline-handle-right" onMouseDown={(e) => handleMouseDown(e, "end")} />
    </div>
  )
}

export default TimelineItem
