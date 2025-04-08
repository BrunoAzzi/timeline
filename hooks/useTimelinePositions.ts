"use client"
import { differenceInDays } from "date-fns"
import type { TimelinePositionsHookParams } from "@/types/timeline"

export default function useTimelinePositions({
  startDate,
  endDate,
  totalDays,
  contentRef,
  zoom,
}: TimelinePositionsHookParams) {
  // Calculate day width in pixels
  const getDayWidth = (): number => {
    if (!contentRef.current) return 0
    const contentWidth = contentRef.current.scrollWidth
    return contentWidth / totalDays
  }

  // Calculate position for a specific date - aligned to day boundaries
  const getPositionForDate = (date: Date): number => {
    const dayPosition = differenceInDays(date, startDate)
    return (dayPosition / totalDays) * 100
  }

  // Convert mouse position to date
  const getDateFromPosition = (x: number): Date => {
    const dayWidth = getDayWidth()
    const daysDiff = Math.round(x / dayWidth)

    const newDate = new Date(startDate)
    newDate.setDate(startDate.getDate() + daysDiff)
    return newDate
  }

  // Scroll to a specific date
  const scrollToDate = (date: Date): void => {
    if (!contentRef.current) return

    const dayPosition = differenceInDays(date, startDate)
    const position = (dayPosition / totalDays) * contentRef.current.scrollWidth
    contentRef.current.scrollLeft = position - contentRef.current.clientWidth / 2
  }

  return {
    getDayWidth,
    getPositionForDate,
    getDateFromPosition,
    scrollToDate,
  }
}
