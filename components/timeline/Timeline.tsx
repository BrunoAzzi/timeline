"use client"

import { useState, useRef, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import TimelineHeader from "./TimelineHeader"
import TimelineControls from "./TimelineControls"
import assignLanes from "@/utils/assignLanes"
import { getDaysBetween, addMonthsToDate, startOfMonth, endOfMonth, isDateBetween } from "@/utils/dateUtils"
import useTimelineZoom from "@/hooks/useTimelineZoom"
import useTimelineDrag from "@/hooks/useTimelineDrag"
import useTimelinePositions from "@/hooks/useTimelinePositions"
import TimelineLane from "./TimelineLane"
import type { TimelineProps, TimelineItem } from "@/types/timeline"

const Timeline = ({ items, onItemUpdate }: TimelineProps) => {
  const [lanes, setLanes] = useState<TimelineItem[][]>([])
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [timelineWidth, setTimelineWidth] = useState<number>(0)

  const timelineRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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
  const startDate = startOfMonth(addMonthsToDate(earliestDate, -2))
  const endDate = endOfMonth(addMonthsToDate(latestDate, 2))

  const totalDays = getDaysBetween(startDate, endDate)

  // Current date for the vertical line
  const currentDate = new Date()

  // Custom hooks
  const { zoom, setZoom, zoomLevel, setZoomByLevel } = useTimelineZoom(1.5)

  const { getPositionForDate, getDayWidth, scrollToDate } = useTimelinePositions({
    startDate,
    endDate,
    totalDays,
    contentRef,
    zoom,
  })

  const { draggingItem, dragTooltip, handleDragStart, handleDrag, handleDragEnd } = useTimelineDrag({
    contentRef,
    onItemUpdate,
    getDayWidth,
  })

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

  // Handle clicks outside of editing input to save changes
  useEffect(() => {
    if (!editingItem) return

    const handleClickOutside = (e: MouseEvent) => {
      // If clicking outside the editing input, save the changes
      const target = e.target as HTMLElement
      if (target.className !== "timeline-item-name-input") {
        setEditingItem(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [editingItem])

  // Handle name editing
  const handleEditStart = (item: TimelineItem) => {
    setEditingItem(item.id)
  }

  const handleNameChange = (id: number, newName: string) => {
    const updatedItem = items.find((item) => item.id === id)
    if (updatedItem) {
      onItemUpdate({ ...updatedItem, name: newName })
    }
    setEditingItem(null)
  }

  const scrollToToday = () => {
    scrollToDate(currentDate)
  }

  return (
    <div className="p-4 select-none">
      <TimelineControls
        zoom={zoom}
        setZoom={setZoom}
        zoomLevel={zoomLevel}
        setZoomByLevel={setZoomByLevel}
        scrollToToday={scrollToToday}
      />

      <div className="border border-neutral-800 rounded overflow-hidden relative" ref={timelineRef}>
        {/* Single scrollable container for both header and content */}
        <div className="overflow-x-auto overflow-y-hidden" ref={contentRef}>
          <div
            style={{
              width: `${100 * zoom}%`,
              position: "relative",
            }}
          >
            {/* Non-scrollable header */}
            <div className="h-[60px] border-b border-neutral-800 bg-neutral-900 relative sticky top-0 z-20">
              <TimelineHeader
                startDate={startDate}
                endDate={endDate}
                zoomLevel={zoomLevel}
                getPositionForDate={getPositionForDate}
              />
            </div>

            {/* Content area */}
            <div
              style={{ height: `${lanes.length * 60 + 20}px` }}
              className="relative"
              onMouseMove={(e) => draggingItem && handleDrag(e)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              {/* Current day vertical line */}
              {isDateBetween(currentDate, startDate, endDate) && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-10 pointer-events-none"
                  style={{ left: `${getPositionForDate(currentDate)}%` }}
                />
              )}

              {lanes.map((lane, laneIndex) => (
                <TimelineLane
                  key={laneIndex}
                  lane={lane}
                  getPositionForDate={getPositionForDate}
                  isEditing={editingItem}
                  onDragStart={handleDragStart}
                  onEditStart={handleEditStart}
                  onNameChange={handleNameChange}
                />
              ))}
            </div>
          </div>
        </div>

        {dragTooltip && (
          <TooltipProvider>
            <Tooltip open={true}>
              <TooltipTrigger asChild>
                <div
                  className="absolute w-0 h-0 pointer-events-none"
                  style={{ left: `${dragTooltip.x}px`, top: `${dragTooltip.y}px` }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-neutral-900 border-neutral-700 text-xs">
                {dragTooltip.text}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}

export default Timeline
