"use client"

import { useState, useRef, useEffect } from "react"
import TimelineItem from "@/components/TimelineItem"
import assignLanes from "@/utils/assignLanes"
import { formatDate, getDaysBetween, getMonthName } from "@/utils/dateUtils"

const Timeline = ({ items, onItemUpdate }) => {
  const [lanes, setLanes] = useState([])
  const [zoom, setZoom] = useState(1.5)
  const [zoomLevel, setZoomLevel] = useState("month") // "day", "week", "month", "quarter", "year"
  const [draggingItem, setDraggingItem] = useState(null)
  const [dragType, setDragType] = useState(null)
  const [dragTooltip, setDragTooltip] = useState(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartDate, setDragStartDate] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [timelineWidth, setTimelineWidth] = useState(0)
  const timelineRef = useRef(null)
  const contentRef = useRef(null)
  const headerRef = useRef(null)
  const scrollPositionRef = useRef(0)
  const dayBoxWidth = useRef(24) // Reference to track day box width

  // Find the earliest start date and latest end date
  const earliestDate = items.reduce(
    (earliest, item) => (new Date(item.start) < earliest ? new Date(item.start) : earliest),
    new Date(items[0].start),
  )

  const latestDate = items.reduce(
    (latest, item) => (new Date(item.end) > latest ? new Date(item.end) : latest),
    new Date(items[0].end),
  )

  // Add padding months to the timeline
  const startDate = new Date(earliestDate)
  startDate.setMonth(startDate.getMonth() - 2)
  startDate.setDate(1)

  const endDate = new Date(latestDate)
  endDate.setMonth(endDate.getMonth() + 2)
  endDate.setDate(0) // Last day of the month

  const totalDays = getDaysBetween(startDate, endDate)

  // Current date for the vertical line
  const currentDate = new Date()

  useEffect(() => {
    setLanes(assignLanes(items))
  }, [items])

  useEffect(() => {
    const handleResize = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Sync header scroll with content scroll
  useEffect(() => {
    if (!contentRef.current || !headerRef.current) return

    const handleScroll = () => {
      if (headerRef.current && !draggingItem) {
        headerRef.current.scrollLeft = contentRef.current.scrollLeft
      }
    }

    contentRef.current.addEventListener("scroll", handleScroll)
    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener("scroll", handleScroll)
      }
    }
  }, [contentRef.current, headerRef.current, draggingItem])

  // Prevent scrolling and selection during drag operations
  useEffect(() => {
    if (!contentRef.current) return

    if (draggingItem) {
      // Store current scroll position when drag starts
      scrollPositionRef.current = contentRef.current.scrollLeft

      // Prevent wheel scrolling during drag
      const preventWheel = (e) => {
        e.preventDefault()
        return false
      }

      // Prevent text selection during drag
      const preventSelection = (e) => {
        e.preventDefault()
        return false
      }

      // Add event listeners to prevent scrolling and selection
      document.addEventListener("wheel", preventWheel, { passive: false })
      document.addEventListener("selectstart", preventSelection)

      return () => {
        document.removeEventListener("wheel", preventWheel)
        document.removeEventListener("selectstart", preventSelection)
      }
    }
  }, [draggingItem])

  // Handle clicks outside of editing input to save changes
  useEffect(() => {
    if (!editingItem) return

    const handleClickOutside = (e) => {
      // If clicking outside the editing input, save the changes
      if (e.target.className !== "timeline-item-name-input") {
        setEditingItem(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [editingItem])

  // Update zoom level based on zoom value
  useEffect(() => {
    if (zoom <= 0.6) {
      setZoomLevel("year")
    } else if (zoom <= 1.0) {
      setZoomLevel("quarter")
    } else if (zoom <= 2.0) {
      setZoomLevel("month")
    } else if (zoom <= 3.5) {
      setZoomLevel("week")
    } else {
      setZoomLevel("day")
    }
  }, [zoom])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5))
  }

  const setZoomByLevel = (level) => {
    switch (level) {
      case "day":
        setZoom(4)
        break
      case "week":
        setZoom(2.5)
        break
      case "month":
        setZoom(1.5)
        break
      case "quarter":
        setZoom(0.8)
        break
      case "year":
        setZoom(0.5)
        break
      default:
        setZoom(1.5)
    }
  }

  // Calculate day width in pixels
  const getDayWidth = () => {
    if (!contentRef.current) return 0
    const contentWidth = contentRef.current.scrollWidth
    return contentWidth / totalDays
  }

  // Convert mouse position to date
  const getDateFromPosition = (x) => {
    const dayWidth = getDayWidth()
    const daysDiff = Math.round(x / dayWidth)

    const newDate = new Date(startDate)
    newDate.setDate(startDate.getDate() + daysDiff)
    return newDate
  }

  const handleDragStart = (e, item, type) => {
    // Don't start dragging if we're editing
    if (editingItem) return

    // Store current scroll position when drag starts
    if (contentRef.current) {
      scrollPositionRef.current = contentRef.current.scrollLeft
    }

    const rect = contentRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left + scrollPositionRef.current

    setDragStartX(mouseX)
    setDragType(type)

    // Store the original date we're dragging from
    if (type === "start") {
      setDragStartDate(new Date(item.start))
    } else if (type === "end") {
      setDragStartDate(new Date(item.end))
    } else if (type === "move") {
      setDragStartDate(new Date(item.start))
    }

    setDraggingItem(item)
  }

  const handleDrag = (e) => {
    if (!draggingItem || !contentRef.current || !dragStartDate || !dragType) return

    // Ensure scroll position remains fixed during drag
    if (contentRef.current.scrollLeft !== scrollPositionRef.current) {
      contentRef.current.scrollLeft = scrollPositionRef.current
    }

    const rect = contentRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left + scrollPositionRef.current

    // Calculate the difference in days from the drag start position
    const dayWidth = getDayWidth()
    const daysDiff = Math.round((mouseX - dragStartX) / dayWidth)

    // Apply the day difference to the original date
    const newDate = new Date(dragStartDate)
    newDate.setDate(dragStartDate.getDate() + daysDiff)

    let updatedItem = { ...draggingItem }
    let tooltipText = ""

    if (dragType === "start") {
      // Ensure start date isn't after end date
      if (newDate < new Date(updatedItem.end)) {
        updatedItem.start = formatDate(newDate)
        tooltipText = `Start: ${updatedItem.start}`
      }
    } else if (dragType === "end") {
      // Ensure end date isn't before start date
      if (newDate > new Date(updatedItem.start)) {
        updatedItem.end = formatDate(newDate)
        tooltipText = `End: ${updatedItem.end}`
      }
    } else if (dragType === "move") {
      const duration = getDaysBetween(new Date(updatedItem.start), new Date(updatedItem.end))
      const newStartDate = new Date(newDate)
      const newEndDate = new Date(newDate)
      newEndDate.setDate(newEndDate.getDate() + duration)
      updatedItem = {
        ...updatedItem,
        start: formatDate(newStartDate),
        end: formatDate(newEndDate),
      }
      tooltipText = `${updatedItem.start} to ${updatedItem.end}`
    }

    // Update tooltip
    setDragTooltip({
      text: tooltipText,
      x: e.clientX,
      y: e.clientY,
    })

    // Update the item if it changed
    if (updatedItem.start !== draggingItem.start || updatedItem.end !== draggingItem.end) {
      onItemUpdate(updatedItem)
    }
  }

  const handleDragEnd = () => {
    setDraggingItem(null)
    setDragType(null)
    setDragTooltip(null)
    setDragStartDate(null)
  }

  // Handle name editing
  const handleEditStart = (item) => {
    setEditingItem(item.id)
  }

  const handleNameChange = (id, newName) => {
    const updatedItem = items.find((item) => item.id === id)
    if (updatedItem) {
      onItemUpdate({ ...updatedItem, name: newName })
    }
    setEditingItem(null)
  }

  // Calculate position for a specific date - aligned to day boundaries
  const getPositionForDate = (date) => {
    const dayPosition = getDaysBetween(startDate, date)
    return (dayPosition / totalDays) * 100
  }

  // Generate ruler-style header with months and days
  const generateRulerHeader = () => {
    const monthRows = []
    const dayRows = []
    const gridLines = []

    const currentDate = new Date(startDate)
    let currentMonth = null
    let monthStartPosition = 0
    let monthWidth = 0

    // Process each day in the timeline
    while (currentDate <= endDate) {
      const position = getPositionForDate(currentDate)
      const day = currentDate.getDate()
      const month = currentDate.getMonth()
      const year = currentDate.getFullYear()
      const isFirstDayOfMonth = day === 1
      const isLastDayOfMonth = new Date(year, month + 1, 0).getDate() === day

      // Determine if we should show this day based on zoom level
      let showDay = false

      if (zoomLevel === "day") {
        // Show every day
        showDay = true
      } else if (zoomLevel === "week") {
        // Show first day of week (Monday) and first day of month
        showDay = currentDate.getDay() === 1 || isFirstDayOfMonth
      } else if (zoomLevel === "month") {
        // Show 1st, 8th, 15th, 22nd of each month
        showDay = day === 1 || day === 8 || day === 15 || day === 22
      } else if (zoomLevel === "quarter") {
        // Show only first day of month
        showDay = isFirstDayOfMonth
      } else if (zoomLevel === "year") {
        // Show only first day of quarter months (Jan, Apr, Jul, Oct)
        showDay = isFirstDayOfMonth && (month === 0 || month === 3 || month === 6 || month === 9)
      }

      // Add day cell if it should be shown
      if (showDay) {
        // Add special class for first day of month
        const dayClass = isFirstDayOfMonth ? "timeline-ruler-day timeline-ruler-day-first" : "timeline-ruler-day"

        dayRows.push(
          <div key={`day-${currentDate.toISOString()}`} className={dayClass} style={{ left: `${position}%` }}>
            {day}
          </div>,
        )
      }

      // Handle month cells
      if (isFirstDayOfMonth || currentDate.getTime() === startDate.getTime()) {
        // If we were tracking a previous month, add it to the output
        if (currentMonth !== null) {
          const monthEndPosition = position
          monthWidth = monthEndPosition - monthStartPosition

          // Only add month if it's visible based on zoom level
          if (
            zoomLevel === "day" ||
            zoomLevel === "week" ||
            zoomLevel === "month" ||
            (zoomLevel === "quarter" && (currentMonth % 3 === 0 || currentMonth === startDate.getMonth())) ||
            (zoomLevel === "year" &&
              (currentMonth === 0 || currentMonth === 6 || currentMonth === startDate.getMonth()))
          ) {
            const monthDate = new Date(year, currentMonth, 1)
            monthRows.push(
              <div
                key={`month-${monthDate.toISOString()}`}
                className="timeline-ruler-month"
                style={{
                  left: `${monthStartPosition}%`,
                  width: `${monthWidth}%`,
                }}
              >
                {getMonthName(monthDate)} {year !== new Date().getFullYear() ? year : ""}
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
            className="timeline-grid-line"
            style={{ left: `${position}%` }}
          />,
        )
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Add the last month if we were tracking one
    if (currentMonth !== null) {
      const monthEndPosition = getPositionForDate(endDate)
      monthWidth = monthEndPosition - monthStartPosition

      const monthDate = new Date(endDate.getFullYear(), currentMonth, 1)
      monthRows.push(
        <div
          key={`month-${monthDate.toISOString()}`}
          className="timeline-ruler-month"
          style={{
            left: `${monthStartPosition}%`,
            width: `${monthWidth}%`,
          }}
        >
          {getMonthName(monthDate)} {endDate.getFullYear() !== new Date().getFullYear() ? endDate.getFullYear() : ""}
        </div>,
      )
    }

    return (
      <>
        <div className="timeline-ruler-months">{monthRows}</div>
        <div className="timeline-ruler-days">{dayRows}</div>
        {gridLines}
      </>
    )
  }

  // Calculate position for current day line
  const getCurrentDayPosition = () => {
    if (currentDate < startDate || currentDate > endDate) return null

    const position = getPositionForDate(currentDate)

    return <div className="timeline-current-day" style={{ left: `${position}%` }} />
  }

  return (
    <div className="p-4 timeline-container">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleZoomOut}
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
        >
          Zoom Out
        </button>
        <button
          onClick={handleZoomIn}
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
        >
          Zoom In
        </button>

        {/* Zoom level selector */}
        <div className="flex bg-gray-800 rounded overflow-hidden">
          {["day", "week", "month", "quarter", "year"].map((level) => (
            <button
              key={level}
              onClick={() => setZoomByLevel(level)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                zoomLevel === level ? "bg-blue-700" : "hover:bg-gray-700"
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            // Scroll to current day
            if (contentRef.current) {
              const dayPosition = getDaysBetween(startDate, currentDate)
              const position = (dayPosition / totalDays) * contentRef.current.scrollWidth
              contentRef.current.scrollLeft = position - contentRef.current.clientWidth / 2
            }
          }}
          className="px-3 py-1 bg-blue-800 hover:bg-blue-700 rounded text-sm font-medium transition-colors ml-auto"
        >
          Today
        </button>
      </div>

      <div className="border border-gray-800 rounded overflow-hidden relative" ref={timelineRef}>
        {/* Ruler-style header with month and day cells */}
        <div className="timeline-ruler-header relative overflow-hidden" ref={headerRef}>
          <div
            style={{
              width: `${100 * zoom}%`,
              height: "100%",
              position: "relative",
            }}
          >
            {generateRulerHeader()}
          </div>
        </div>

        {/* Timeline content */}
        <div
          className={`relative overflow-x-auto ${draggingItem ? "overflow-hidden" : ""}`}
          style={{ height: `${lanes.length * 60 + 20}px` }}
          ref={contentRef}
          onMouseMove={(e) => draggingItem && handleDrag(e)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div
            style={{
              width: `${100 * zoom}%`,
              height: "100%",
              position: "relative",
            }}
          >
            {/* Current day vertical line */}
            {getCurrentDayPosition()}

            {lanes.map((lane, laneIndex) => (
              <div key={laneIndex} className="relative h-[60px]">
                {lane.map((item) => {
                  // Calculate positions aligned to day boundaries
                  const startPosition = getPositionForDate(new Date(item.start))

                  // For end date, we need to add 1 day to include the full end day
                  const endDate = new Date(item.end)
                  endDate.setDate(endDate.getDate() + 1)
                  const endPosition = getPositionForDate(endDate)

                  const width = endPosition - startPosition

                  return (
                    <TimelineItem
                      key={item.id}
                      item={item}
                      left={startPosition}
                      width={width}
                      isEditing={editingItem === item.id}
                      onDragStart={handleDragStart}
                      onEditStart={() => handleEditStart(item)}
                      onNameChange={(newName) => handleNameChange(item.id, newName)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {dragTooltip && (
          <div
            className="timeline-tooltip"
            style={{
              left: `${dragTooltip.x + 10}px`,
              top: `${dragTooltip.y - 30}px`,
            }}
          >
            {dragTooltip.text}
          </div>
        )}
      </div>
    </div>
  )
}

export default Timeline
