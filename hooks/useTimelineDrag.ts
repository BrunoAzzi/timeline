"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { addDays, differenceInDays } from "date-fns"
import { formatDate } from "@/utils/dateUtils"
import type { TimelineItem, DragType, DragTooltip, TimelineDragHookParams } from "@/types/timeline"

export default function useTimelineDrag({ contentRef, onItemUpdate, getDayWidth }: TimelineDragHookParams) {
  const [draggingItem, setDraggingItem] = useState<TimelineItem | null>(null)
  const [dragType, setDragType] = useState<DragType | null>(null)
  const [dragTooltip, setDragTooltip] = useState<DragTooltip | null>(null)
  const [dragStartX, setDragStartX] = useState<number>(0)
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null)
  const scrollPositionRef = useRef<number>(0)

  // Prevent scrolling and selection during drag operations
  useEffect(() => {
    if (!contentRef.current) return

    if (draggingItem) {
      // Store current scroll position when drag starts
      scrollPositionRef.current = contentRef.current.scrollLeft

      // Prevent wheel scrolling during drag
      const preventWheel = (e: WheelEvent) => {
        e.preventDefault()
        return false
      }

      // Prevent text selection during drag
      const preventSelection = (e: Event) => {
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
  }, [draggingItem, contentRef])

  const handleDragStart = (e: React.MouseEvent, item: TimelineItem, type: DragType): void => {
    // Store current scroll position when drag starts
    if (contentRef.current) {
      scrollPositionRef.current = contentRef.current.scrollLeft
    }

    const rect = contentRef.current!.getBoundingClientRect()
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

  // Update the drag handling to work with the new structure
  const handleDrag = (e: React.MouseEvent): void => {
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
    const newDate = addDays(dragStartDate, daysDiff)

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
      const duration = differenceInDays(new Date(updatedItem.end), new Date(updatedItem.start))
      const newStartDate = newDate
      const newEndDate = addDays(newDate, duration)
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

  const handleDragEnd = (): void => {
    setDraggingItem(null)
    setDragType(null)
    setDragTooltip(null)
    setDragStartDate(null)
  }

  return {
    draggingItem,
    dragTooltip,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  }
}
